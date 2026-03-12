import { Board } from "./Board/Board";
import { PlayableCard, TerritoryCard, VictoryCard } from "./Cards";
import { createBoard, createCharacterDeck, createMaesterDeck, createVictoryDeck } from "../utils/Utils";

export class GameSettings {
    map: Board;
    activePlayerIndex: number;
    victoryDeck: VictoryCard[];
    territoryDeck: TerritoryCard[];
    maesterDeck: PlayableCard[];
    characterDeck: PlayableCard[];
    victoryTarget: number;

    constructor() {
        const mapInfo = createBoard();
        this.map = mapInfo.board;
        this.territoryDeck = mapInfo.territoryCards;
        this.characterDeck = createCharacterDeck();
        this.maesterDeck = createMaesterDeck();
        const victoryInfo = createVictoryDeck();
        this.victoryDeck = victoryInfo.victoryCards;
        this.victoryTarget = victoryInfo.pointsToWin;
        this.activePlayerIndex = 0;
    }
}

let _defaultSettings: GameSettings | null = null;

export function getDefaultSettings(): GameSettings {
    if (!_defaultSettings) {
        _defaultSettings = new GameSettings();
    }
    return _defaultSettings;
}

export function resetDefaultSettings(): void {
    _defaultSettings = null;
}
