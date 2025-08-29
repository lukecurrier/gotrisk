import { Continent } from "./Board/Continent"
import { Region } from "./Board/Region"
import { Territory } from "./Board/Territory"

export class GameManager {
    private static _instance: GameManager;

    territories: Territory[];
    regions: Region[];
    continents: Continent[];

    constructor(continents: Continent[]) {
        this.continents = continents;
        this.regions = continents.flatMap(continent => continent.regions);
        this.territories = this.regions.flatMap(region => region.territories);
    }

    static create(continents: Continent[]) {
        GameManager._instance = new GameManager(continents);
        return GameManager._instance;
    }

    static get instance() {
        if (!GameManager._instance) throw new Error("GameManager not initialized");
        return GameManager._instance;
    }
}
