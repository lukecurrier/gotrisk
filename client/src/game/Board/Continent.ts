import { Region } from "./Region";

export class Continent {
    readonly name: string;
    readonly regions: Region[];

    constructor(name: string, regions: Region[]) {
        this.name = name;
        this.regions = regions;
    }

    toString() {
        console.log("CONTINENT: " + this.name + "\n");
        for (let r of this.regions) {
            r.toString();
        }
    }
}
    
