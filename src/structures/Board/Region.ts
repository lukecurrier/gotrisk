import type { Player } from "../Player.js";
import type { Territory } from "./Territory.js";

export class Region {
    readonly name: string;
    readonly regionBonus: number;
    readonly territories: Territory[];   
    readonly color: string;

    constructor(name: string, regionBonus: number, territories: Territory[], color: string) {
        this.name = name;
        this.regionBonus = regionBonus;
        this.territories = territories; 
        this.color = color;
    }

    owned(player: Player): boolean {
        for(let i=0; i++; i<=this.territories.length) {
            if(this.territories[i]?.getOwner() !== player) {
                return false
            }
        }

        return true 
    }
}