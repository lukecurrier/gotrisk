import { Continent } from "./Board/Continent"
import { Region } from "./Board/Region"
import { Territory } from "./Board/Territory"
import { Player } from "./Player";

export class GameManager {
    private static _instance: GameManager;

    players: Player[]
    territories: Territory[];
    regions: Region[];
    continents: Continent[];

    gameOngoing: boolean;

    constructor(continents: Continent[]) {
        this.continents = continents;
        this.regions = continents.flatMap(continent => continent.regions);
        this.territories = this.regions.flatMap(region => region.territories);
        this.players = [];
    }

    static create(continents: Continent[]) {
        GameManager._instance = new GameManager(continents);
        return GameManager._instance;
    }

    static get instance() {
        if (!GameManager._instance) throw new Error("GameManager not initialized");
        return GameManager._instance;
    }

    // MARK: Pre-game methods
    addPlayer(id: number, name: string, color: string) {
        this.guardPreGameOnly()
        let player = new Player(id, name, color);
        this.players.push(player);
    }

    // MARK: In-game methods
    

    // MARK: Utilities
    guardPreGameOnly(): void {
        if (this.gameOngoing) {
            throw new Error("This action can only be performed before the game starts!");
        }
    }

    guardGameStarted(): void {
        if (!this.gameOngoing) {
            throw new Error("This action can only be performed after the game starts!");
        }
    }
}
