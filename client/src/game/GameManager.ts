import { Continent } from "./Board/Continent";
import { Region } from "./Board/Region";
import { Map } from "./Board/Map";
import { Territory } from "./Board/Territory";
import { Phase, PhaseManager } from "./GamePhase";
import { GameSettings } from "./LobbyManager";
import { Player } from "./Player";
import { MaesterCard, TerritoryCard, VictoryCard } from "./Cards";

export class GameManager {
    private static _instance: GameManager;

    private phaseManager: PhaseManager;

    readonly players: Player[]
    readonly territories: Territory[];
    readonly regions: Region[];
    readonly continents: Continent[];
    readonly map: Map;
    activePlayerIndex: number;
    readonly territoryCardDeck: TerritoryCard[];
    readonly maesterCardDeck: MaesterCard[];
    readonly victoryCardDeck: VictoryCard[];

    private constructor(map: Map, players: Player[], activePlayerIndex) {
        this.phaseManager = new PhaseManager(players);
        this.map = map;
        this.continents = map.continents;
        this.regions = this.continents.flatMap(continent => continent.regions);
        this.territories = this.regions.flatMap(region => region.territories);
        this.players = players;
        this.activePlayerIndex = activePlayerIndex;
    }

    static create(settings: GameSettings) {
        GameManager._instance = new GameManager(settings.map, settings.players, settings.activePlayerIndex);
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
    private getActivePlayer(): Player {
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
