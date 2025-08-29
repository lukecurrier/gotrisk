import { Region } from "./Region.js";

type ContinentName = "Westeros" | "Essos";

export class Continent {
    readonly name: ContinentName;
    readonly regions: Region[];

    constructor(name: ContinentName, regions: Region[]) {
        this.name = name;
        this.regions = regions;
    }
}
    
