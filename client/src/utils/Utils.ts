// Could choose to have these be methods under specific classes, but have them here for now just for funsies
// Random data structures and utility functions

//import { assert } from "console";
import * as fs from 'fs';
import { EOL } from 'os';
import { Continent } from "../game/Board/Continent";
import { Board } from "../game/Board/Board";
import { Region } from "../game/Board/Region";
import { Territory } from "../game/Board/Territory";
import { Card, TerritoryCard } from "../game/Cards";
import { Player } from '../game/Player';
//import { Map as HashMap } from 'immutable';
import { CardEffect } from '../game/CardEffect';

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

export function calculateBaseTroopDeploy(map:Board, player:Player): number {
    let earnedTotal: number = 0;
    const minimumTroopsToDeploy = 3;

    // Territories + Castles / 3
    earnedTotal += Math.floor((player.getTerritoryCount() + player.getCastleCount()) / 3);
    // + Region Bonus
    earnedTotal += calculateRegionBonus(map, player);
    // Territory Card deploys not included here

    return Math.min(earnedTotal, minimumTroopsToDeploy);
}

export function calculateRegionBonus(map: Board, player: Player): number {

    let bonusSum = 0;
    for (let c of map.continents) {
        for (let r of c.regions) {
            let playerControlsRegion = true; 
            for (let t of r.territories) {
                if (t.getOwner() !== player) {
                    playerControlsRegion = false;
                    break;
                }
            }
            if (playerControlsRegion) {
                bonusSum += r.regionBonus;
            }
        }
    }

    return bonusSum;
}

export function calculatePlayerIncome(map:Board, player:Player) {
    return 100 * (player.getPortCount() + calculateBaseTroopDeploy(map, player) + calculateRegionBonus(map, player));
}

export function territorySetValue(territoryCards: TerritoryCard[]): number {
    //return -1 if not a set, otherwise return how many troops they deploy for
    let returnValue: number = -1;

    if (territoryCards.length != 3) { // wrong number of territory cards
        return returnValue;
    }

    const counts = [0, 0, 0]; // Fortification, Knight, Siege Engine in that order

    for (let tc of territoryCards) {
        if (tc.getToken() == Token.Fortification) {
            counts[0] += 1;
        }
        if (tc.getToken() == Token.Knight) {
            counts[1] += 1;
        }
        if (tc.getToken() == Token.SiegeEngine) {
            counts[2] += 1;
        }
    }
    if (counts.findIndex((n, index, list) => n==2) != -1) { // found a token type with 2, can't form a set
        return returnValue;
    }

    if (counts[0] == counts[1]) { // we have three 1s, return 7 troops for one-of-each deploy type
        return 7;
    } else if (counts[0] == 3) { // 3 fortifications
        return 6;
    } else if (counts[1] == 3) { // 3 knights
        return 4;
    } else { // 3 siege engines
        return 5;
    }
}

export class BoardCreator {

    constructor() {
        
    }

    createFrom(filePath: string): Board { //gotrisk\client\src\utils\filename.txt
        let numSegments = filePath.split("\\").length;
        let mapName: string = filePath.split(".")[0].split("\\")[numSegments - 1];
        let continents: Continent[] = [];
        let regions: Region[] = [];
        let territories: Territory[] = [];

        /*
        Config file formatted like:
        ___CONTINENTS___
        ContinentName
        ...
        ___REGIONS___
        RegionName:ContinentName:OccupationBonus:ColorStringHexadecimal
        ...
        ___TERRITORIES___
        TerritoryName:RegionName:Coastal(0/1):Port(0/1):Castle(0/1)
        ...
        ___CONNECTIONS___
        T1Name:T2Name
        ...
        */

        // only have to list connections one way (we'll assemble both links automatically)

        try { // yeah this is a mega shit function who cares rn
            const fileContent: string = fs.readFileSync(filePath, 'utf-8');
            const theContinentsPart = fileContent.split(`${EOL}___REGIONS___`)[0].split(`CONTINENTS___${EOL}`)[1];
            //let numContinents: number = theContinentsPart.split(`${EOL}`).length;
            
            for (let i of theContinentsPart.split(`${EOL}`)) {
                continents.push(new Continent(i, []));
            }

            const theRegionsPart = fileContent.split(`${EOL}___TERRITORIES___`)[0].split(`REGIONS___${EOL}`)[1];
            //let numRegions: number = theRegionsPart.split(`${EOL}`).length;
            //console.log('File Content:', theRegionsPart);
            //console.log('Num continents:', numRegions);

            for (let i of theRegionsPart.split(`${EOL}`)) {
                const regionParts: string[] = i.split(":");
                const regionName = regionParts[0];
                const continent = continents.filter((continent, index, list) => continent.name == regionParts[1])[0];
                const color = regionParts[3];
                const occupationBonus = Number(regionParts[2]);
                let region = new Region(regionName, occupationBonus, [], color)
                regions.push(region);
                continent.regions.push(region);
            }

            const theTerritoriesPart = fileContent.split(`${EOL}___CONNECTIONS___`)[0].split(`TERRITORIES___${EOL}`)[1];

            for (let i of theTerritoriesPart.split(`${EOL}`)) {
                const territoryParts: string[] = i.split(":");
                const territoryName = territoryParts[0];
                let regionItsIn = regions.filter((r, index, list) => r.name == territoryParts[1])[0];
                const port = Number(territoryParts[3]) == 1 ? true : false;
                const coastal = Number(territoryParts[2]) == 1 ? true : false;
                const castle = Number(territoryParts[4]) == 1 ? true : false;
                let territory = new Territory(territoryName, coastal, port, castle);
                regionItsIn.territories.push(territory);
                territories.push(territory);
            }

            const theConnectionsPart = fileContent.split(`${EOL}___CONNECTIONS___${EOL}`)[1];

            for (let i of theConnectionsPart.split(`${EOL}`)) {
                const ends: string[] = i.split(":");
                const t1Name = ends[0];
                const t2Name = ends[1].split(`${EOL}`)[0];
                const t1 = territories.filter((t, index, list) => t.name == t1Name)[0];
                const t2 = territories.filter((t, index, list) => t.name == t2Name)[0];
                t1.addNeighbor(t2);
            }

        } catch (error) {
            console.error('Error reading file:', error);
        }
        //new Map(mapName, continents).toString();
        return new Board(mapName, continents);
    }

}

export class TerritoryCardReader {

    constructor () {

    }

    createTerritoryCardDeckFrom(filePath: string, territoryObjects: Territory[]): TerritoryCard[] {
        let territoryCardDeck: TerritoryCard[] = [];
        const territoryTokenPairings: Map<string, Token> = this.readFrom(filePath);
        for (let t of territoryObjects) {
            territoryCardDeck.push(this.createTerritoryCard(t, territoryTokenPairings[t.name]));
        }
        return territoryCardDeck;
    }

    createTerritoryCard(territory: Territory, token: Token): TerritoryCard {
        // TODO can add card play conditions here, maybe they differ between cards but I don't think so
        return new TerritoryCard(0, territory.name, [], token,  territory);
    }

    readFrom(filePath: string): Map<string, Token> {
        let territoryTokenPairings: Map<string, Token> = new Map<string, Token>();
        const tokenNameMap: Map<string, Token> = new Map<string, Token>([
            ["Fortification", Token.Fortification],
            ["Knight", Token.Knight],
            ["SiegeEngine", Token.SiegeEngine] ]);

        try {
            const fileContent: string = fs.readFileSync(filePath, 'utf-8');
            const lines: string[] = fileContent.split(`${EOL}`);
            for (let line of lines) {
                const parts: string[] = line.split(":");
                territoryTokenPairings[parts[0]] = tokenNameMap[parts[1]];
            } 
        } catch (error) {
            console.error('Error reading file:', error);
        }

        return territoryTokenPairings;
    }
}

    

export class CardEffectStack {
    private static effectsStack: CardEffectStack;
    private stack: CardEffect[];

    public static getInstance(): CardEffectStack {
    if (!CardEffectStack.effectsStack) {
      CardEffectStack.effectsStack = new CardEffectStack();
    }
      return CardEffectStack.effectsStack;
    }

    constructor() {
        this.stack = [];
        // TODO config default response delay and other stack vars here? or in game manager?
    }

    push(element: CardEffect): void {
      this.stack.push(element);
    }

    pop(): CardEffect | undefined {
      return this.stack.pop();
    }

    peek(): CardEffect | undefined {
      return this.stack[this.stack.length - 1];
    }

    isEmpty(): boolean {
      return this.stack.length === 0;
    }

    size(): number {
      return this.stack.length;
    }

    clear(): void {
      this.stack = [];
    }
}

// TODO need a card creator that makes territory cards and links them to the territory objects in the map
// Also need to make all the victory, territory, maester, character cards
// And load them into game manager class