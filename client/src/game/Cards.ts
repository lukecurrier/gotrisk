import { Token } from "../utils/types";
import { Territory } from "./Board/Territory";
import type { CardCheck } from "./CardCheck";
import { CardEffect } from "./CardEffect";
import type { Player } from "./Player";

export abstract class Card {
    private static _nextId = 1;
    readonly id: number;
    readonly name: string;
    readonly checks: CardCheck[];
    protected type: CardType;
    protected owner?: Player;

    constructor(name: string, type: CardType, checks: CardCheck[]) {
        this.id = Card._nextId++;
        this.name = name;
        this.checks = checks;
        this.type = type;
    }

    setOwner(player: Player) { this.owner = player; }
    clearOwner() { this.owner = undefined; }
    getOwner(): Player | undefined { return this.owner; }

    cardType(): CardType {
        return this.type;
    }

    isActive(): boolean {
        if (!this.owner) { throw new Error("No owner!")}
        return this.checks.every(check => check(this.owner!));
    }

    play(): void {
        if (!this.isActive()) {
            throw new Error("Card cannot be played!")
        }
        this.effect()
    }

    protected abstract effect(): void;
}

export class PlayableCard extends Card {
    readonly price: number;
    readonly cardEffect: CardEffect;

    constructor(name: string, type: CardType, checks: CardCheck[], price: number, effect: CardEffect) {
        super(name, type, checks);
        this.price = price;
        this.cardEffect = effect;
    }

    override isActive(): boolean {
        if (!this.owner) throw new Error("No owner!");
        if (!this.owner.canSpend(this.price)) return false;
        return this.checks.every(check => check(this.owner!));
    }

    override play(): void {
        if (!this.isActive()) {
            throw new Error("Card cannot be played!")
        }
        this.owner!.spend(this.price)
        this.effect()
    }

    protected effect(): void {
        this.cardEffect(this.owner!);
    }
}

/** @deprecated Use PlayableCard with CardType.Character */
export type CharacterCard = PlayableCard;
/** @deprecated Use PlayableCard with CardType.Maester */
export type MaesterCard = PlayableCard;

export class VictoryCard extends Card {
    readonly value: number

    constructor(name: string, checks: CardCheck[], value: number) {
        super(name, CardType.Victory, checks);
        this.value = value;
    }

    protected effect(): void {
        this.owner?.awardVictoryPoints(this.value);
    }
}

export class TerritoryCard extends Card {
    readonly token: Token;
    readonly territory: Territory;

    constructor(name: string, checks: CardCheck[], token: Token, territory: Territory) {
        super(name, CardType.Territory, checks);
        this.token = token;
        this.territory = territory;
    }

    protected effect(): void {

    }

    getToken(): Token {
        return this.token;
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

export enum CardType {
    Character,
    Maester,
    Victory,
    Territory
}
