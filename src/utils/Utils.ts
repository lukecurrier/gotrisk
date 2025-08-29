// Could choose to have these be methods under specific classes, but have them here for now just for funsies
// Random data structures and utility functions

import type { Card } from "../structures/Card.js"

export type Port = 0 | 1 | 2 | 3

export enum Token {
    Castle,
    Knight,
    SiegeEngine,
}

export class BattleResult {
    attacker: number[];
    defender: number[];

    constructor(attacker: number[], defender: number[]) {
        if (1 > attacker.length || attacker.length > 3) {
            throw new Error("Invalid number of attackers");
        }

        if (1 > defender.length || defender.length > 2) {
            throw new Error("Invalid number of defenders");
        }
        
        this.attacker = attacker;
        this.defender = defender;
    }

    outcome(): { attackerLosses: number; defenderLosses: number } {
        let attackerLosses = 0;
        let defenderLosses = 0;

        const rounds = Math.min(this.attacker.length, this.defender.length);

        for (let i = 0; i < rounds; i++) {
            const attackerDie = this.attacker[i]!;
            const defenderDie = this.defender[i]!;

            if (attackerDie > defenderDie) {
                defenderLosses++;
            } else {
                attackerLosses++;
            }
        }

        return { attackerLosses, defenderLosses };
    }
}

export function roll(count: number, numD8s: number = 0): number[] {
    const result: number[] = [];

    // Roll the d8 dice first
    for (let i = 0; i < numD8s; i++) {
        result.push(Math.floor(Math.random() * 8) + 1);
    }

    // Roll the remaining d6 dice
    for (let i = 0; i < count - numD8s; i++) {
        result.push(Math.floor(Math.random() * 6) + 1);
    }

    // Sort descending (highest to lowest)
    return result.sort((a, b) => b - a);
}

export function shuffleCards(deck: Card[]): Card[] {
    // TODO: add shuffle function
    return deck;
}


