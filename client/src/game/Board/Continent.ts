import { Region } from "./Region";

export class Continent {
    readonly name: string;
    readonly regions: Region[];

    constructor(name: string, regions: Region[]) {
        this.name = name;
        this.regions = regions;
    }

    toString(): string {
        return `${this.name}: ${this.regions.map(r => r.name).join(', ')}`;
    }
}
    
