import type { Player } from "../Player";
import type { Territory } from "./Territory";

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
        return this.territories.every(t => t.getOwner() === player);
    }

    toString(): string {
        return `${this.name}: ${this.territories.map(t => t.name).join(', ')}`;
    }
}