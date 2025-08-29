import type { Territory } from "./Board/Territory.js";

export class Player {
    id: number
    name: string
    capitol?: Territory
    gold: number

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
        this.gold = 0
    }

    // MARK: Setters
    setCapitol(territory: Territory) {
        if (this.capitol) throw new Error(`${name} already has a capitol!`)
        this.capitol = territory;
    }
}