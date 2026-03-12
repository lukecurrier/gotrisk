import type { Territory } from "./Board/Territory";
import { Card, CardType } from "./Cards";
import { GameManager } from "./GameManager";

export class Player {
    readonly id: number;
    readonly name: string;
    readonly color: string;
    private capital?: Territory;
    private gold: number;
    private victoryPoints: number;
    private territories: Territory[];
    private cards: Map<CardType, Card[]>;

    constructor(id: number, name: string, color: string) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.gold = 0;
        this.victoryPoints = 0;
        this.territories = [];

        this.cards = new Map([
            [CardType.Character, []],
            [CardType.Maester, []],
            [CardType.Victory, []],
            [CardType.Territory, []]
        ]);
    }

    // MARK: Checks
    startOfTurnCount(): { gold: number; troops: number } {
        const gm = GameManager.instance;

        let castlesOwned = 0;
        let portsOwned = 0;
        for (const t of this.territories) {
            if (t.port) portsOwned++;
            if (t.castle) castlesOwned++;
        }

        let regionBonuses = 0;
        for (const region of gm.regions) {
            if (region.owned(this)) regionBonuses += region.regionBonus;
        }

        const troops = Math.floor((this.territories.length + castlesOwned) / 3) + regionBonuses;
        const gold = (troops + portsOwned) * 100;

        return { troops, gold };
    }

    // MARK: Getters
    getCapital(): Territory {
        if (!this.capital) throw new Error("Player has no capital!");
        return this.capital;
    }

    canSpend(gold: number): boolean { return this.gold >= gold; }
    getGold(): number { return this.gold; }
    getVictoryPoints(): number { return this.victoryPoints; }

    getCards(type: CardType): Card[] {
        return this.cards.get(type) || [];
    }

    getAllCards(): Card[] {
        return Array.from(this.cards.values()).flat();
    }

    getCardCount(type: CardType): number {
        return this.getCards(type).length;
    }

    getTotalCardCount(): number {
        return this.getAllCards().length;
    }

    hasCard(card: Card): boolean {
        return this.getCards(card.cardType()).includes(card);
    }

    getTerritoryCount(): number { return this.territories.length; }
    getCastleCount(): number { return this.territories.filter(t => t.castle).length; }
    getPortCount(): number { return this.territories.filter(t => t.port).length; }

    hasAllTokens(): boolean {
        let hasFort = false, hasKnight = false, hasSiege = false;
        for (const t of this.territories) {
            if (t.getFortifications() > 0) hasFort = true;
            if (t.getKnights() > 0) hasKnight = true;
            if (t.getSiegeEngines() > 0) hasSiege = true;
        }
        return hasFort && hasKnight && hasSiege;
    }

    // MARK: Setters
    awardVictoryPoints(points: number) { this.victoryPoints += points; }
    loseVictoryPoints(points: number) { this.victoryPoints -= points; }

    setCapital(territory: Territory) {
        if (this.capital) throw new Error(`${this.name} already has a capital!`);
        if (!this.territories.includes(territory)) throw new Error(`${this.name} does not own this territory!`);
        this.capital = territory;
    }

    spend(gold: number) { this.gold -= gold; }
    earn(gold: number) { this.gold += gold; }
    setGold(g: number) { this.gold = g; }
    setVictoryPoints(vp: number) { this.victoryPoints = vp; }

    addTerritory(territory: Territory) {
        if (territory.getOwner() !== this) {
            throw new Error("Territory and Player disagree on owner!");
        }
        this.territories.push(territory);
    }

    removeTerritory(territory: Territory) {
        if (territory.getOwner() !== this) {
            throw new Error("Territory and Player disagree on owner!");
        }
        this.territories = this.territories.filter(t => t !== territory);
    }

    addCard(card: Card): void {
        const cardsOfType = this.cards.get(card.cardType());
        if (cardsOfType && !cardsOfType.includes(card)) {
            card.setOwner(this);
            cardsOfType.push(card);
        }
    }

    removeCard(card: Card): boolean {
        const cardsOfType = this.cards.get(card.cardType());
        if (!cardsOfType) return false;

        const index = cardsOfType.indexOf(card);
        if (index !== -1) {
            cardsOfType.splice(index, 1);
            card.clearOwner();
            return true;
        }
        return false;
    }

    // ── Snapshot support ──────────────────────────────────────────────
    getCardIds(): number[] {
        return this.getAllCards().map(c => c.id);
    }

    clearCards() {
        for (const [, cards] of this.cards) {
            for (const card of cards) card.clearOwner();
        }
        this.cards = new Map([
            [CardType.Character, []],
            [CardType.Maester, []],
            [CardType.Victory, []],
            [CardType.Territory, []]
        ]);
    }

    setTerritoriesDirect(territories: Territory[]) {
        this.territories = territories;
    }
}
