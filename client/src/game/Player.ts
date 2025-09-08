import type { Territory } from "./Board/Territory";
import { Card, MaesterCard, TerritoryCard, CharacterCard, VictoryCard, CardType } from "./Cards";
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
    startOfTurnCount(): { gold: number; troops: number; } {
        const gm = GameManager.instance;

        let castlesOwned = 0;   
        let portsOwned = 0;     
        let ownedTerritories = this.territories;
        for (const region of ownedTerritories) {
            if (region.port) portsOwned += 1;
            if (region.castle) castlesOwned += 1;
        }

        let regionBonuses = 0;
        let allRegions = gm.regions;
        for (const region of allRegions) {
            if (region.owned(this)) {
                regionBonuses += region.regionBonus;
            }
        }

        let troops =  Math.floor((ownedTerritories.length + castlesOwned) / 3) + regionBonuses;
        let gold = (troops + portsOwned) * 100;

        return {troops, gold}
    }

    // MARK: Getters
    getCapital(): Territory { 
        if(!this.capital) {
            throw new Error ("Player has no capital!") 
        }
        return this.capital;
    }

    getColor(): string {
        return this.color;
    }
    
    canSpend(gold: number): boolean { return this.gold >= gold; }

    getGold(): number { return this.gold; }
    
    getVictoryPoints(): number {
        return this.victoryPoints;
    }

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
        const cardsOfType = this.getCards(card.cardType());
        return cardsOfType.includes(card);
    }

    // MARK: Setters
    awardVictoryPoints(points: number) {
        this.victoryPoints += points;
    }

    loseVictoryPoints(points: number) {
        this.victoryPoints -= points;
    }

    setCapital(territory: Territory) {
        if (this.capital) throw new Error(`${name} already has a capital!`)
        if (!this.territories.includes(territory)) throw new Error(`${name} does not own this territory!`)
        this.capital = territory;
    }

    spend(gold: number) {
        this.gold -= gold;
    }

    earn(gold: number) { 
        this.gold += gold;
    }

    addTerritory(territory: Territory) {
        if (territory.getOwner() != this) {
            throw new Error("Territory and Player disagree on owner!")
        }
        this.territories.push(territory);
    }

    removeTerritory(territory: Territory) { //Should only be called BEFORE giving territory to new owner
        if (territory.getOwner() != this) {
            throw new Error("Territory and Player disagree on owner!")
        }
        const territoryFilter = (t: Territory, i: number, tList: Territory []) => !(t === territory);
        this.territories = this.territories.filter(territoryFilter);
    }

    addCard(card: Card): void {
        const cardsOfType = this.cards.get(card.cardType());
        if (cardsOfType && !cardsOfType.includes(card)) {
            cardsOfType.push(card);
        }
    }

    removeCard(card: Card): boolean {
        const cardsOfType = this.cards.get(card.cardType());
        if (!cardsOfType) return false;
        
        const index = cardsOfType.indexOf(card);
        if (index !== -1) {
            cardsOfType.splice(index, 1);
            return true;
        }
        return false;
    }

    getTerritoryCount(): number {
        return this.territories.length;
    }

    getCastleCount(): number {
        const territoryCastleFilter = (t: Territory, i: number, tList: Territory []) => (t.castle);
        return this.territories.filter(territoryCastleFilter).length;
    }

    getPortCount(): number {
        const territoryPortFilter = (t: Territory, i: number, tList: Territory []) => (t.port);
        return this.territories.filter(territoryPortFilter).length;
    }
}