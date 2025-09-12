import { Continent } from "./Continent";

export class Board {
    readonly name: string;
    readonly continents: Continent[];

    constructor(name: string, continents: Continent[]) {
        this.name = name;
        this.continents = continents;
    }

    toString() {
        console.log("BOARD: " + this.name + "\n");
        for (let c of this.continents) {
            c.toString();
        }
    }
}