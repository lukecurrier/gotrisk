import { Continent } from "../game/Board/Continent";
import { Board } from "../game/Board/Board";
import { Region } from "../game/Board/Region";
import { Territory } from "../game/Board/Territory";
import { PlayableCard, TerritoryCard, VictoryCard } from "../game/Cards";
import { CharacterCards } from '../game/CharacterCards';
import { MaesterCards } from '../game/MaesterCards';
import { VictoryCardCheckMap } from '../game/VictoryCardChecks';
import { EssosMap } from '../utils/Essos';
import { Characters } from "./CharactersToUse";
import { Maesters } from "./MaesterCardsToUse";
import { VictoryCards } from "./VictoryCardsToUse";
import { CardCheck, CardChecks } from "../game/CardCheck";
import { GameTimeMarker, Token } from "./types";

// Re-export so existing imports from Utils still work
export { GameTimeMarker, Token, type Port } from "./types";

export function randInt(low: number, high: number): number {
    if (high <= low) {
        throw Error("Randint called with low >= high");
    }
    return Math.floor(Math.random() * (high - low)) + low;
}

export class Die {
    rollResult: number = 0;
    maxValue: number = 6;
    rollCount: number = 0;

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

    addX(x: number): number {
        this.rollResult = this.rollResult + x;
        return this.rollResult;
    }
}

export class BattleResult {
    attackDice: Die[] = [];
    defendDice: Die[] = [];
    attackingTokens: Token[] = [];
    defendingTokens: Token[] = [];

    private countTokensOfType(t: Token, tokens: Token[]): number {
        return tokens.filter(tok => tok === t).length;
    }

    constructor(attackingTroops: number, defendingTroops: number,
        attackingTokens: Token[],
        defendingTokens: Token[]) {

        if (1 > attackingTroops || attackingTroops > 3) {
            throw new Error("Invalid number of attackers");
        }
        if (1 > defendingTroops || defendingTroops > 2) {
            throw new Error("Invalid number of defenders");
        }

        this.attackingTokens = attackingTokens;
        this.defendingTokens = defendingTokens;

        for (let i = 0; i < attackingTroops; i++) {
            this.attackDice.push(new Die(6));
        }
        for (let i = 0; i < defendingTroops; i++) {
            this.defendDice.push(new Die(6));
        }

        this.applySiegeEngineEffects();
    }

    outcome(): { attackerLosses: number; defenderLosses: number } {
        let attackerLosses = 0;
        let defenderLosses = 0;

        const rounds = Math.min(this.attackDice.length, this.defendDice.length);
        for (let i = 0; i < rounds; i++) {
            if (this.attackDice[i].rollResult > this.defendDice[i].rollResult) {
                defenderLosses++;
            } else {
                attackerLosses++;
            }
        }

        return { attackerLosses, defenderLosses };
    }

    fight(): void {
        this.rollForBattle();
        this.applyFortificationEffects();
        this.applyKnightEffects();
    }

    rollForBattle(): void {
        for (const d of this.attackDice) d.roll();
        for (const d of this.defendDice) d.roll();

        this.attackDice.sort((a, b) => b.rollResult - a.rollResult);
        this.defendDice.sort((a, b) => b.rollResult - a.rollResult);
    }

    applyFortificationEffects(): void {
        const defenderFortifications = this.countTokensOfType(Token.Fortification, this.defendingTokens);
        for (const d of this.defendDice) d.addX(defenderFortifications);
    }

    applyKnightEffects(): void {
        const attackerKnights = this.countTokensOfType(Token.Knight, this.attackingTokens);
        const defenderKnights = this.countTokensOfType(Token.Knight, this.defendingTokens);
        this.attackDice[0].addX(attackerKnights);
        this.defendDice[0].addX(defenderKnights);
    }

    applySiegeEngineEffects(): void {
        const attackerSE = this.countTokensOfType(Token.SiegeEngine, this.attackingTokens);
        const defenderSE = this.countTokensOfType(Token.SiegeEngine, this.defendingTokens);

        const attacker8s = Math.min(attackerSE, this.attackDice.length);
        const attacker6s = this.attackDice.length - attacker8s;
        this.attackDice = [];
        for (let i = 0; i < attacker6s; i++) this.attackDice.push(new Die(6));
        for (let i = 0; i < attacker8s; i++) this.attackDice.push(new Die(8));

        const defender8s = Math.min(defenderSE, this.defendDice.length);
        const defender6s = this.defendDice.length - defender8s;
        this.defendDice = [];
        for (let i = 0; i < defender6s; i++) this.defendDice.push(new Die(6));
        for (let i = 0; i < defender8s; i++) this.defendDice.push(new Die(8));
    }
}

export function territorySetValue(territoryCards: TerritoryCard[]): number {
    if (territoryCards.length !== 3) return -1;

    const counts = [0, 0, 0]; // Fortification, Knight, Siege Engine
    for (const tc of territoryCards) {
        if (tc.getToken() === Token.Fortification) counts[0]++;
        else if (tc.getToken() === Token.Knight) counts[1]++;
        else if (tc.getToken() === Token.SiegeEngine) counts[2]++;
    }

    if (counts.some(n => n === 2)) return -1; // can't form a set

    if (counts[0] === counts[1]) return 7;  // one of each
    if (counts[0] === 3) return 6;           // 3 fortifications
    if (counts[1] === 3) return 4;           // 3 knights
    return 5;                                 // 3 siege engines
}

// ── Map & Deck builders ──────────────────────────────────────────────────────

export function createBoard(): { board: Board; territoryCards: TerritoryCard[] } {
    const continents: Continent[] = [];
    const regions: Region[] = [];
    const territories: Territory[] = [];
    const territoryCards: TerritoryCard[] = [];

    /*
    Config file formatted like:
    ___CONTINENTS___
    ContinentName
    ...
    ___REGIONS___
    RegionName:ContinentName:OccupationBonus:ColorStringHexadecimal
    ...
    ___TERRITORIES___
    TerritoryName:RegionName:Coastal(0/1):Port(0/1):Castle(0/1):TokenType
    ...
    ___CONNECTIONS___
    T1Name:T2Name
    ...
    */

    try {
        const fileContent: string = EssosMap;
        const theContinentsPart = fileContent.split(`\n___REGIONS___`)[0].split(`CONTINENTS___\n`)[1];

        for (const name of theContinentsPart.split(`\n`)) {
            continents.push(new Continent(name, []));
        }

        const theRegionsPart = fileContent.split(`\n___TERRITORIES___`)[0].split(`REGIONS___\n`)[1];

        for (const line of theRegionsPart.split(`\n`)) {
            const parts = line.split(":");
            const continent = continents.find(c => c.name === parts[1])!;
            const region = new Region(parts[0], Number(parts[2]), [], parts[3]);
            regions.push(region);
            continent.regions.push(region);
        }

        const theTerritoriesPart = fileContent.split(`\n___CONNECTIONS___`)[0].split(`TERRITORIES___\n`)[1];
        const tokenNameMap = new Map<string, Token>([
            ["KNIGHT", Token.Knight],
            ["FORTIFICATION", Token.Fortification],
            ["SIEGEENGINE", Token.SiegeEngine],
        ]);

        for (const line of theTerritoriesPart.split(`\n`)) {
            const parts = line.split(":");
            const region = regions.find(r => r.name === parts[1])!;
            const coastal = parts[2] === "1";
            const port = parts[3] === "1";
            const castle = parts[4] === "1";
            const tokenType = tokenNameMap.get(parts[5])!;
            const territory = new Territory(parts[0], coastal, port, castle, region);
            const card = new TerritoryCard(parts[0], [CardChecks.isRightGameTime(GameTimeMarker.TurnInTerritoryCards)], tokenType, territory);
            region.territories.push(territory);
            territories.push(territory);
            territoryCards.push(card);
        }

        const theConnectionsPart = fileContent.split(`\n___CONNECTIONS___\n`)[1];

        for (const line of theConnectionsPart.split(`\n`)) {
            const ends = line.split(":");
            const t1 = territories.find(t => t.name === ends[0])!;
            const t2 = territories.find(t => t.name === ends[1].split(`\n`)[0])!;
            t1.addNeighbor(t2);
        }
    } catch (error) {
        console.error('Error reading map:', error);
    }

    return { board: new Board("Essos", continents), territoryCards };
}

export function createCharacterDeck(): PlayableCard[] {
    const characters: PlayableCard[] = [];
    try {
        for (const name of Characters.split(`\n`)) {
            const match = CharacterCards.find(cc => cc.name.toUpperCase() === name.trim().toUpperCase());
            if (match) characters.push(match);
        }
    } catch (error) {
        console.error('Error reading characters:', error);
    }
    return characters;
}

export function createMaesterDeck(): PlayableCard[] {
    const maesters: PlayableCard[] = [];
    try {
        for (const line of Maesters.split(`\n`)) {
            const parts = line.split(":");
            const mName = parts[0].trim();
            const copies = parts.length > 1 ? Number(parts[1]) : 1;
            const match = MaesterCards.find(mc => mc.name.toUpperCase() === mName.toUpperCase());
            if (match) {
                for (let i = 0; i < copies; i++) maesters.push(match);
            }
        }
    } catch (error) {
        console.error('Error reading maesters:', error);
    }
    return maesters;
}

export function createVictoryDeck(): { victoryCards: VictoryCard[]; pointsToWin: number } {
    const victoryCards: VictoryCard[] = [];
    let pointsToWin = 0;

    try {
        const fileContent: string = VictoryCards;
        pointsToWin = Number(fileContent.split("___POINTS_TO_WIN___\n")[1].split("\n")[0]);
        const cardSection = fileContent.split(`\n___VICTORY_CARDS___\n`)[1];
        for (const line of cardSection.split(`\n`)) {
            if (!line.trim()) continue;
            const parts = line.split(":");
            const checks: CardCheck[] = VictoryCardCheckMap.get(parts[0]) ?? [];
            victoryCards.push(new VictoryCard(parts[0], checks.concat([CardChecks.isRightGameTime(GameTimeMarker.TurnInVictoryCards)]), Number(parts[1])));
        }
    } catch (error) {
        console.error('Error reading victory cards:', error);
    }

    return { victoryCards, pointsToWin };
}
