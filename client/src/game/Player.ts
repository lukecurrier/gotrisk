import type { Territory } from "./Board/Territory";
import { GameManager } from "./GameManager";

export class Player {
    readonly id: number;
    readonly name: string;
    private capital?: Territory;
    private gold: number;
    private victoryPoints: number;
    private territories: Territory[];

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
        this.gold = 0;
        this.victoryPoints = 0;
        this.territories = [];
    }

    // MARK: Checks
    startOfTurnCount(): { gold: number; troops: number; } {
        const gm = GameManager.instance;

        let castlesOwned = 0;   
        let portsOwned = 0;     
        let ownedTerritories = this.territories;
        for (const region of ownedTerritories) {
            if (region.port) portsOwned += 1;
            if (region.castle) castlesOwned += 1;
        }

        let regionBonuses = 0;
        let allRegions = gm.regions;
        for (const region of allRegions) {
            if (region.owned(this)) {
                regionBonuses += region.regionBonus;
            }
        }

        let troops =  Math.floor((ownedTerritories.length + castlesOwned) / 3) + regionBonuses;
        let gold = (troops + portsOwned) * 100;

        return {troops, gold}
    }

    // MARK: Getters
    getCapital(): Territory { 
        if(!this.capital) {
            throw new Error ("Player has no capital!") 
        }
        return this.capital;
    }
    
    canSpend(gold: number): boolean { return this.gold >= gold; }

    getGold(): number { return this.gold; }
    
    getVictoryPoints(): number {
        return this.victoryPoints;
    }

    // MARK: Setters
    awardVictoryPoints(points: number) {
        this.victoryPoints += points;
    }

    loseVictoryPoints(points: number) {
        this.victoryPoints -= points;
    }

    setCapital(territory: Territory) {
        if (this.capital) throw new Error(`${name} already has a capital!`)
        if (!this.territories.includes(territory)) throw new Error(`${name} does not own this territory!`)
        this.capital = territory;
    }

    spend(gold: number) {
        this.gold -= gold;
    }

    earn(gold: number) { 
        this.gold += gold;
    }

    addTerritory(territory: Territory) {
        if (territory.getOwner() != this) {
            throw new Error("Territory and Player disagree on owner!")
        }
        this.territories.push(territory);
    }
}