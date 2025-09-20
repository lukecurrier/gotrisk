import { Continent } from "./Board/Continent";
import { Region } from "./Board/Region";
import { Board } from "./Board/Board";
import { Territory } from "./Board/Territory";
import { Phase, PhaseManager } from "./GamePhase";
import { GameSettings } from "./LobbyManager";
import { Player } from "./Player";
import { MaesterCard, VictoryCard, TerritoryCard } from "./Cards";

export class GameManager {
    private static _instance: GameManager;

    private phaseManager: PhaseManager;

    readonly players: Player[]
    readonly territories: Territory[];
    readonly regions: Region[];
    readonly continents: Continent[];
    readonly map: Board;
    activePlayerIndex: number;
    readonly territoryCardDeck: TerritoryCard[];
    readonly maesterCardDeck: MaesterCard[];
    readonly victoryCardDeck: VictoryCard[];

    private constructor(map: Board, players: Player[], activePlayerIndex) {
        this.phaseManager = new PhaseManager(players);
        this.map = map;
        this.continents = map.continents;
        this.regions = this.continents.flatMap(continent => continent.regions);
        this.territories = this.regions.flatMap(region => region.territories);
        this.players = players;
        this.activePlayerIndex = activePlayerIndex;
    }

    static create(settings: GameSettings, players: Player[], activePlayerIndex: number) {
        GameManager._instance = new GameManager(settings.map, players, activePlayerIndex);
        return GameManager._instance;
    }

    static get instance() {
        if (!GameManager._instance) throw new Error("GameManager not initialized");
        return GameManager._instance;
    }

    // MARK: Pre-game methods
    addPlayer(id: number, name: string, color: string) {
        this.guardPreGameOnly()
        let player = new Player(id, name, color);
        this.players.push(player);
    }

    // MARK: In-game methods
    getActivePlayer(): Player {
        if (this.activePlayerIndex >= 0 && this.activePlayerIndex < this.players.length) {
            return this.players[this.activePlayerIndex];
        }
        throw new Error("Invalid active player index: " + this.activePlayerIndex);
    }

    setActivePlayer(index: number) {
        if (index >= 0 && index < this.players.length) {
            this.activePlayerIndex = index;
        }
        throw new Error("Invalid attempt to set active player index: " + index);
    }

    nextTurn() { // TODO can call a lot of things here at end of turns, like saving state or something idk

        this.nextActivePlayer();
    }

    private nextActivePlayer() {
        if (this.players.length < 2) {
            throw new Error("Fewer than two players in game");
        }
        this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;
    }

    // MARK: Utilities
    guardPreGameOnly(): void {
        if (this.phaseManager.currentPhase.gameOngoing) {
            throw new Error("This action can only be performed before the game starts!");
        }
    }

    guardGameStarted(): void {
        if (!this.phaseManager.currentPhase.gameOngoing) {
            throw new Error("This action can only be performed after the game starts!");
        }
    }
}
