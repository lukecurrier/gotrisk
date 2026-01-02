import { Continent } from "./Board/Continent";
import { GameManager } from "./GameManager";
import { Player } from "./Player";
import { Board } from "./Board/Board";
import { CharacterCard, MaesterCard, TerritoryCard, VictoryCard } from "./Cards";
import { BoardCreator, CharacterCardReader, MaesterCardReader, VictoryCardReader } from "../utils/Utils";

export class LobbyManager {
  private players: Player[] = [];
  private settings: GameSettings = DefaultSettings;
  private playerReady: Record<string, boolean> = {};

  addSettings(settings: GameSettings) {
    this.settings = settings;
  }

  addPlayer(player: Player) {
    this.players.push(player);
    this.playerReady[player.id] = false;
  }

  removePlayer(player: Player) {
    this.players = this.players.filter(p => p.id !== player.id);
    delete this.playerReady[player.id];
  }

  updateSettings(newSettings: Partial<GameSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }

  markReady(player: Player) {
    this.playerReady[player.id] = true;
  }

  allReady(): boolean {
    return Object.values(this.playerReady).every(v => v);
  }

  startGame(): GameManager {
    if (!this.allReady()) {
      throw new Error("Not all players are ready");
    }

    GameManager.create(this.settings, this.players, 0, this.settings.territoryDeck, this.settings.maesterDeck, this.settings.victoryDeck);
    return GameManager.instance;
  }
}

export class GameSettings {
    map: Board;
    activePlayerIndex: number;
    victoryDeck: VictoryCard[];
    territoryDeck: TerritoryCard[];
    maesterDeck: MaesterCard[];
    characterDeck: CharacterCard[];
    victoryTarget: number;

    constructor(charactersFilePath: string,
      mapFilePath: string,
      maestersFilePath: string,
      victoryFilePath: string,
      activePlayerIndex: number) {

      const mapInfo = new BoardCreator().createFrom(mapFilePath);
      this.map = mapInfo.board;
      this.territoryDeck = mapInfo.territoryCards;
      this.characterDeck = new CharacterCardReader().createCharacterDeckFrom(charactersFilePath);
      this.maesterDeck = new MaesterCardReader().createMaesterCardDeckFrom(maestersFilePath);
      const victoryInfo = new VictoryCardReader().createVictoryCardDeckFrom(victoryFilePath);
      this.victoryDeck = victoryInfo.victoryCards;
      this.victoryTarget = victoryInfo.pointsToWin;
      this.activePlayerIndex = activePlayerIndex;
    }

}

export const DefaultSettings = new GameSettings("", "", "", "", 0); // todo change constructor to not use files and instead use constants
