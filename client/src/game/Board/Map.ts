import { Continent } from "./Continent";

export class Map {
    readonly name: string;
    readonly continents: Continent[];

    constructor(name: string, continents: Continent[]) {
        this.name = name;
        this.continents = continents;
    }

    toString() {
        console.log("MAP: " + this.name + "\n");
        for (let c of this.continents) {
            c.toString();
        }
    }
}