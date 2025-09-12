import { Continent } from "./Board/Continent";
import { GameManager } from "./GameManager";
import { Player } from "./Player";
import { Board } from "./Board/Board";

export class LobbyManager {
  private players: Player[] = [];
  private settings: GameSettings = defaultSettings;
  private playerReady: Record<string, boolean> = {};

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

    GameManager.create(this.settings);
    return GameManager.instance;
  }
}

export class GameSettings {
    map: Board;
    players: Player[]
    activePlayerIndex: number;
}

const defaultSettings = new GameSettings()