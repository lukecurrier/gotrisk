// Could choose to have these be methods under specific classes, but have them here for now just for funsies
// Random data structures and utility functions

import { assert } from "console";
import type { Card } from "../game/Cards"
import * as fs from 'fs';
import { Map, MapName } from "../game/Board/Map";
import { Continent } from "../game/Board/Continent";
import { Region } from "../game/Board/Region";
import { Territory } from "../game/Board/Territory";

export type Port = 0 | 1 | 2 | 3

export enum Token {
    Fortification,
    Knight,
    SiegeEngine,
}

export function randInt(low: number, high: number): number {
    // random int, inclusive on low end, not inclusive on the high end

    if (high <= low) {
        throw Error("Randint called with low >= high");
    }

    return Math.floor(Math.random() * (high - low)) + low;
}

export class Die {
    rollResult: number = 0;
    maxValue: number = 6;
    rollCount: number = 0;  // needed for the guy who re-rolls 1s, but only one time per die per battle

    constructor(maxValue: number) {
        this.rollResult = 0;
        this.maxValue = maxValue;
        this.rollCount = 0;
    }

    roll(): number {
        this.rollResult = randInt(1, this.maxValue + 1);
        this.rollCount++;
        return this.rollResult;
    }

    view(): number {
        return this.rollResult;
    }

    setToMaxValue(): number {
        this.rollResult = this.maxValue;
        return this.rollResult;
    }

    getRollCount(): number {
        return this.rollCount;
    }

    addX(x: number): number { // intentionally can go beyond max face value on die
        this.rollResult = this.rollResult + x;
        return this.rollResult;
    }

}

export class BattleResult {
    attackDice: Die[];
    defendDice: Die[];
    attackingTokens: Token[];
    defendingTokens: Token[];

    // ONLY USE countTokensOfType, for counting tokens of type t in a list
    filterToType = (t: Token) => ((innerToken: Token, i: number, list: Token[]) => t == innerToken ? 1 : 0);
    countTokensOfType = (t: Token, tokens: Token[]) => tokens.filter(this.filterToType(t)).reduce((a, b) => a + b, 0);

    constructor(attackingTroops: number, defendingTroops: number, 
        attackingTokens: Token[], 
        defendingTokens: Token[]) {

        if (1 > attackingTroops || attackingTroops > 3) {
            throw new Error("Invalid number of attackers");
        }

        if (1 > defendingTroops || defendingTroops > 2) {
            throw new Error("Invalid number of defenders");
        }

        this.applySiegeEngineEffects();
    }

    outcome(): { attackerLosses: number; defenderLosses: number } {
        let attackerLosses = 0;
        let defenderLosses = 0;

        const rounds = Math.min(this.attackDice.length, this.defendDice.length);

        for (let i = 0; i < rounds; i++) {
            const attackerDie = this.attackDice[i].rollResult;
            const defenderDie = this.defendDice[i].rollResult;

            if (attackerDie > defenderDie) {
                defenderLosses++;
            } else {
                attackerLosses++;
            }
        }

        return { attackerLosses, defenderLosses };
    }

    fight(): void {
        //Do the initial roll and incorporate token effects
        //TODO add in pre-battle character card / maester card effects


        //TODO add in pre-battle maester card effects / character card effects before this fight call
        // but after the siegeEngine effects call from consructor b/c it initializes dice

        this.rollForBattle();
        this.applyFortificationEffects();
        this.applyKnightEffects();

        //TODO add in post-battle maester card effects / character card effects after this fight call

    }

    rollForBattle(): void { // Roll all dice

        for (let d of this.attackDice) {
            d.roll();
        }
        for (let d of this.defendDice) {
            d.roll();
        }

        // Sort descending (highest to lowest)
        this.attackDice.sort((a, b) => b.rollResult - a.rollResult);
        this.defendDice.sort((a, b) => b.rollResult - a.rollResult);
    }

    applyFortificationEffects(): void {
        // Apply defensive fortification effects
        let defenderFortifications: number = this.countTokensOfType(Token.Fortification, this.defendingTokens);

        for (let d of this.defendDice) {
            d.addX(defenderFortifications);
        }
    }

    applyKnightEffects(): void { //only call with dice sorted descending

        let attackerKnights: number = this.countTokensOfType(Token.Knight, this.attackingTokens);
        let defenderKnights: number = this.countTokensOfType(Token.Knight, this.defendingTokens);

        this.attackDice[0].addX(attackerKnights);
        this.defendDice[0].addX(defenderKnights);

    }

    applySiegeEngineEffects(): void { 
        // Apply effects from all siege engines (replace a six sided die with an 8-sider) 

        let attackerSiegeEngines: number = this.countTokensOfType(Token.SiegeEngine, this.attackingTokens);
        let defenderSiegeEngines: number = this.countTokensOfType(Token.SiegeEngine, this.defendingTokens);

        const attacker8s: number = Math.min(attackerSiegeEngines, this.attackDice.length);
        const attacker6s: number = this.attackDice.length - attacker8s;
        this.attackDice = []
        for (let i = 0; i < attacker6s; i++) {
            this.attackDice.push(new Die(6));
        }
        for (let i = 0; i < attacker8s; i++) {
            this.attackDice.push(new Die(8));
        }

        const defender8s: number = Math.min(defenderSiegeEngines, this.defendDice.length);
        const defender6s: number = this.defendDice.length - defender8s;
        this.defendDice = []
        for (let i = 0; i < defender6s; i++) {
            this.defendDice.push(new Die(6));
        }
        for (let i = 0; i < defender8s; i++) {
            this.defendDice.push(new Die(8));
        }
    }
}

export function shuffleCards(deck: Card[]): Card[] {
    
  const deckSize: number = deck.length;
  if (1 > deckSize) {
    throw new Error("Too few cards in deck to shuffle");
  }

  for (let i = deckSize - 1; i > 1; i--) {
    const j = randInt(0, i+1);
    const temp: Card = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }

  return deck;
}

export class MapCreator {
    
    



    constructor() {
        
    }

    createFrom(filePath: string): Map { //gotrisk\client\src\utils\mapConfig.txt
        let mapName: MapName = "Westeros"; //TODO get from filePath name
        let continents: Continent[] = [];
        let regions: Region[] = [];
        let territories: Territory[] = [];

        /*
        Config file formatted like:
        ___CONTINENTS___
        ContinentName
        ...
        ___REGIONS___
        RegionName:ContinentName:OccupationBonus
        ...
        ___TERRITORIES___
        TerritoryName:RegionName:Coastal(0/1):Port(0/1):Castle(0/1)
        ...
        ___CONNECTIONS___
        T1Name:T2Name
        ...
        */

        // only have to list connections one way (we'll assemble both links automatically)


        try { //const lines = content.split(/\r?\n/); TODO for splitting into lines
            const fileContent: string = fs.readFileSync(filePath, 'utf-8');
            console.log('File Content:', fileContent);
        } catch (error) {
            console.error('Error reading file:', error);
        }

        return new Map(mapName, continents);
    }

}