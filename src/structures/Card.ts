import type { CardCheck } from "./CardCheck.js";
import type { Player } from "./Player.js";

export abstract class Card {
    id: number;
    name: string;
    owner?: Player;
    checks: CardCheck[];

    constructor(id: number, name: string, checks: CardCheck[]) {
        this.id = id;
        this.name = name;
        this.checks = checks;
    }

    abstract isActive(): boolean;
    abstract play(): void;
    abstract effect(): void;
}

// Example concrete card
export class MaesterCard extends Card {
    price: number;

    constructor(id: number, name: string, checks: CardCheck[], price: number) {
        super(id, name, checks);
        this.price = price;
    }

    isActive(): boolean {
        return false;
    }

    play(): void {
        this.owner.gold -= this.price;
        this.effect();
    }

    effect(): void {
        // TODO: define actual Maester effect
        console.log(`${this.name} effect triggered!`);
    }
}


export interface VictoryCard extends Card {
    // How many victory points a player gets for playing the card
    value: 1 | 2 | 3 | 4;
    // The requrement for playing the card (again, figure out a data representation for this)
    requirement: 0;
}

export class Deck<T extends Card> {
    cards: T[];

    constructor(initialCards: T[]) {
        this.cards = [...initialCards]; 
        this.shuffle();
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = this.cards[i]!;
            this.cards[i] = this.cards[j]!;
            this.cards[j] = temp;
        }
    }

    draw(): T | null { return this.cards.length > 0 ? this.cards.pop()! : null; }

    size(): number { return this.cards.length; }

    isEmpty(): boolean { return this.cards.length === 0; }
}
