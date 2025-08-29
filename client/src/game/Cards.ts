import { Token } from "../utils/Utils";
import { Territory } from "./Board/Territory";
import type { CardCheck } from "./CardCheck";
import { GameManager } from "./GameManager";
import type { Player } from "./Player";

export abstract class Card {
    readonly id: number;
    readonly name: string;
    readonly checks: CardCheck[];
    readonly manager: GameManager;
    protected owner?: Player;

    constructor(id: number, name: string, checks: CardCheck[], manager: GameManager) {
        this.id = id;
        this.name = name;
        this.checks = checks;
        this.manager = manager;
    }

    isActive(): boolean { 
        if (!this.owner) { throw new Error("No owner!")}
        return this.checks.every(check => check(this.owner!, this.manager)); 
    }

    play(): void {
        if (!this.isActive()) {
            throw new Error("Card cannot be played!")
        }
        this.effect()
    }

    protected abstract effect(): void;
}

export class CharacterCard extends Card {
    readonly price: number;

    constructor(id: number, name: string, checks: CardCheck[], manager: GameManager, price: number) {
        super(id, name, checks, manager);
        this.price = price;
    }

    override play(): void {
        if (!this.isActive()) {
            throw new Error("Card cannot be played!")
        }
        this.owner!.spend(this.price)
        this.effect()
    }

    protected effect(): void {
        // TODO: define actual Maester effect
        console.log(`${this.name} effect triggered!`);
    }
}

export class MaesterCard extends Card {
    readonly price: number;

    constructor(id: number, name: string, checks: CardCheck[], manager: GameManager, price: number) {
        super(id, name, checks, manager);
        this.price = price;
    }

    override play(): void {
        if (!this.isActive()) {
            throw new Error("Card cannot be played!")
        }
        this.owner!.spend(this.price)
        this.effect()
    }

    protected effect(): void {
        // TODO: define actual Maester effect
        console.log(`${this.name} effect triggered!`);
    }
}


export class VictoryCard extends Card {
    readonly value: number

    constructor(id: number, name: string, checks: CardCheck[], manager: GameManager, value: number) {
        super(id, name, checks, manager);
        this.value = value;
    }

    protected effect(): void {
        this.owner?.awardVictoryPoints(this.value);
    }
}

export class TerritoryCard extends Card {
    readonly token: Token;
    readonly territory: Territory;

    constructor(id: number, name: string, checks: CardCheck[], manager: GameManager, token: Token, territory: Territory) {
        super(id, name, checks, manager);
        this.token = token;
        this.territory = territory;
    }

    protected effect(): void {

    }
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
