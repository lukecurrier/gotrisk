import { Continent } from "./Continent";

export class Board {
    readonly name: string;
    readonly continents: Continent[];

    constructor(name: string, continents: Continent[]) {
        this.name = name;
        this.continents = continents;
    }

    toString(): string {
        return `${this.name}: ${this.continents.map(c => c.name).join(', ')}`;
    }
}