import { Player } from "../Player";
import { Region } from "./Region";
import { Token, BattleResult } from "../../utils/Utils";
import { GameManager } from "../GameManager";

export class Territory {
    readonly name: string
    readonly coastal: boolean;
    readonly port: boolean // rather than do complicated bs, just add all territories with the same port as neighbors
    readonly castle: boolean;
    private region: Region;
    private neighbors: Territory[];
    private troops: number;
    private owner?: Player;
    private capital?: Player;
    private knights: number;
    private fortifications: number;
    private siegeEngines: number;

    constructor(name: string, coastal: boolean, port: boolean, castle: boolean) {
        this.name = name;
        this.neighbors = [];
        this.coastal = coastal;
        this.port = port;
        this.castle = castle;
        this.troops = 0;
        this.knights = 0;
        this.fortifications = 0;
        this.siegeEngines = 0;
    }

    // MARK: Operations
    resolveAttack(from: Territory, result: BattleResult): void { //TODO fix from.maneuver logic
        let outcome = result.outcome()
        let lostTroops = outcome.defenderLosses;

        if(lostTroops >= this.getTroops()) {
            this.removeTokens([Token.Fortification, Token.Knight, Token.SiegeEngine])
            this.changeOwner(from.getOwner())
            from.maneuver(this, result.attackDice.length - outcome.attackerLosses)
        } else {
            this.removeTroops(lostTroops)
            from.removeTroops(outcome.attackerLosses)
        }
    }

    maneuver(to: Territory, numberOfTroops: number): void {
        if(!this.canManeuver(to, numberOfTroops)) {
            throw new Error("Cannot maneuver here!")
        }

        let tt = this.removeTokens([Token.Knight, Token.SiegeEngine])
        to.placeTokens(tt.fortificationsRemoved, tt.knightsRemoved, tt.enginesRemoved)
        
        this.removeTroops(numberOfTroops)
        to.placeTroops(numberOfTroops)
    }

    // MARK: Checks
    canAttack(target: Territory): boolean {
        let viableDefender = target.getOwner() != this.getOwner();

        let adjacent = this.isNeighboring(target);

        let sufficientTroops = this.getTroops() > 1;

        return viableDefender && adjacent && sufficientTroops;
    }

    isNeighboring(target: Territory): boolean {
        return this.neighbors.includes(target) && target.neighbors.includes(this)
    }

    // MARK: Getters
    getOwner(): Player { 
        if (!this.owner) throw new Error("No owner!");
        return this.owner; 
    }

    getCapital(): Player | undefined { return this.capital; }

    getTroops(): number { return this.troops; }

    getFortifications(): number { return this.fortifications; }

    getKnights(): number { return this.knights; }

    getSiegeEngines(): number { return this.siegeEngines; }

    // MARK: Setters
    addNeighbor(that: Territory) {
        // TODO: add a start of game check?
        if (!this.isNeighboring(that)) { 
            this.neighbors.push(that) 
            that.addNeighbor(this)
        }
    }

    placeCapital() {
        let player = this.getOwner();
        if (player.getCapital()) throw new Error("Player already has a seat of power!")
        this.capital = player;
        player.setCapital(this)

        this.setTroops(3) // TODO this might not be hard-codable forever, if starting setup is modifiable
    }

    placeTroops(troops: number) {
        this.troops += troops;
    }

    placeTokens(fortifications: number = 0, knights: number = 0, siegeEngines: number = 0) {
        this.fortifications += fortifications;
        this.knights += knights;
        this.siegeEngines += siegeEngines;
    }

    removeTroops(troopsToLose: number): void { 
        if(this.troops <= troopsToLose) { 
            throw new Error("Not enough troops to remove!") 
        } 
        this.troops -= troopsToLose;
    }

    removeTokens(tokens: Token[]): { fortificationsRemoved: number; knightsRemoved: number; enginesRemoved: number } {
        let fortificationsRemoved = 0;
        let knightsRemoved = 0;
        let enginesRemoved = 0;

        for (const token of tokens) {
            switch (token) {
                case Token.Fortification:
                    fortificationsRemoved += this.fortifications;
                    this.fortifications = 0;
                    break;
                case Token.Knight:
                    knightsRemoved += this.knights;
                    this.knights = 0;
                    break;
                case Token.SiegeEngine:
                    enginesRemoved += this.siegeEngines;
                    this.siegeEngines = 0;
                    break;
            }
        }

        return { fortificationsRemoved, knightsRemoved, enginesRemoved };
    }

    changeOwner(newOwner: Player) {
        const gm = GameManager.instance;
        if (this.owner) this.owner.removeTerritory(this);
        this.owner = newOwner;
        this.setTroops(true ? 1 : 0); // TODO: This should check the current phase to see if it's start of game
        newOwner.addTerritory(this);
    }

    // MARK: Private helpers
    private canManeuver(to: Territory, numberOfTroops: number): boolean {
        return this.isConnected(to) && numberOfTroops < this.troops;
    }

    private isConnected(to: Territory): boolean {
        if (!this.owner) return false;

        const visited = new Set<Territory>();

        function dfs(current: Territory): boolean {
            if (current === to) return true;
            visited.add(current);

            for (const neighbor of current.neighbors) {
                if (!visited.has(neighbor)) {
                    if(neighbor.owner === current.owner) {
                        if (dfs(neighbor)) return true;
                    }
                }
            }

            return false;
        }

        return dfs(this);
    }

    private setTroops(to: number) {
        this.troops = to;
    }
}