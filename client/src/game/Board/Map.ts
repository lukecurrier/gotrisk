import { Continent } from "./Continent";

export type MapName = "Westeros" | "Essos" | "World";

export class Map {
    readonly name: MapName;
    readonly continents: Continent[];

    constructor(name: MapName, continents: Continent[]) {
        this.name = name;
        this.continents = continents;
    }
}