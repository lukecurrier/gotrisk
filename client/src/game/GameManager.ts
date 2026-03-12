import { Region } from "./Board/Region";
import { Board } from "./Board/Board";
import { Territory } from "./Board/Territory";
import { Phase, PhaseManager, TurnPhase, InvasionPhase } from "./GamePhase";
import { GameSettings } from "./LobbyManager";
import { Player } from "./Player";
import { PlayableCard, VictoryCard, TerritoryCard, Deck } from "./Cards";
import { GameTimeMarker } from "../utils/types";

export class GameManager {
    private static _instance: GameManager;

    private phaseManager: PhaseManager;

    readonly players: Player[]
    readonly territories: Territory[];
    readonly regions: Region[];
    readonly map: Board;
    activePlayerIndex: number;
    readonly territoryCardDeck: Deck<TerritoryCard>;
    readonly maesterCardDeck: Deck<PlayableCard>;
    readonly victoryCardDeck: Deck<VictoryCard>;

    capitalTroops: number = 3;

    private constructor(map: Board, players: Player[], activePlayerIndex: number,
        territoryCardDeck: TerritoryCard[],
        maesterCardDeck: PlayableCard[],
        victoryCardDeck: VictoryCard[]
    ) {
        this.phaseManager = new PhaseManager();
        this.map = map;
        this.regions = map.continents.flatMap(c => c.regions);
        this.territories = this.regions.flatMap(r => r.territories);
        this.players = players;
        this.activePlayerIndex = activePlayerIndex;
        this.territoryCardDeck = new Deck(territoryCardDeck);
        this.maesterCardDeck = new Deck(maesterCardDeck);
        this.victoryCardDeck = new Deck(victoryCardDeck);
    }

    static create(settings: GameSettings, players: Player[], activePlayerIndex: number,
        territoryCardDeck: TerritoryCard[],
        maesterCardDeck: PlayableCard[],
        victoryCardDeck: VictoryCard[]
    ) {
        GameManager._instance = new GameManager(settings.map, players, activePlayerIndex, territoryCardDeck,
            maesterCardDeck, victoryCardDeck
        );
        return GameManager._instance;
    }

    static get instance() {
        if (!GameManager._instance) throw new Error("GameManager not initialized");
        return GameManager._instance;
    }

    getPhaseManager() {
        return this.phaseManager;
    }

    isGameOngoing() {
        return this.phaseManager.currentPhase.gameOngoing;
    }

    getGameTimeMarker(): GameTimeMarker | null {
        return this.phaseManager.currentPhase.gameTimeMarker ?? null;
    }

    getCurrentPhase(): Phase {
        return this.phaseManager.currentPhase;
    }

    // MARK: Phase transitions

    startGame() {
        this.phaseManager.transitionPhases();
    }

    enterInvasion(from: Territory, target: Territory): InvasionPhase {
        const turnPhase = this.phaseManager.currentPhase;
        if (!(turnPhase instanceof TurnPhase)) {
            throw new Error("Can only declare invasions during a Turn phase!");
        }
        const invasion = turnPhase.declareInvasion(from, target);
        this.phaseManager.advanceTo(invasion);
        return invasion;
    }

    resolveInvasion() {
        const invasion = this.phaseManager.currentPhase;
        if (!(invasion instanceof InvasionPhase)) {
            throw new Error("Not currently in an invasion!");
        }
        this.phaseManager.restoreTo(invasion.next());
    }

    endCurrentTurn() {
        const turnPhase = this.phaseManager.currentPhase;
        if (!(turnPhase instanceof TurnPhase)) {
            throw new Error("Can only end turn during a Turn phase!");
        }
        turnPhase.endTurn();
        this.phaseManager.advanceTo(turnPhase.next());
    }

    // MARK: In-game methods

    getActivePlayer(): Player {
        if (this.activePlayerIndex >= 0 && this.activePlayerIndex < this.players.length) {
            return this.players[this.activePlayerIndex];
        }
        throw new Error("Invalid active player index: " + this.activePlayerIndex);
    }

    nextTurn() {
        if (this.players.length < 2) {
            throw new Error("Fewer than two players in game");
        }
        this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;
    }

    // MARK: Card drawing

    drawTerritoryCard(player: Player) {
        const card = this.territoryCardDeck.draw();
        if (card) player.addCard(card);
    }

    drawMaesterCard(player: Player) {
        const card = this.maesterCardDeck.draw();
        if (card) player.addCard(card);
    }

    drawVictoryCard(player: Player) {
        const card = this.victoryCardDeck.draw();
        if (card) player.addCard(card);
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
