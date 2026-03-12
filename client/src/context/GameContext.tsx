import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import { socket } from '../socket';

// ── Shared types the server will also use ──────────────────────────────────

export interface PlayerInfo {
  id: string;
  name: string;
  color: string;
  gold: number;
  victoryPoints: number;
  territoryCount: number;
  cardCount: number;
  ready: boolean;
}

export interface TerritoryInfo {
  name: string;
  owner: string | null;   // player id
  troops: number;
  region: string;
  coastal: boolean;
  port: boolean;
  castle: boolean;
  knights: number;
  fortifications: number;
  siegeEngines: number;
}

export interface BattleResultInfo {
  attackerRolls: number[];
  defenderRolls: number[];
  attackerLosses: number;
  defenderLosses: number;
  conquered: boolean;
}

export interface CardInfo {
  id: number;
  name: string;
  type: string;       // "Character" | "Maester" | "Territory" | "Victory"
  price?: number;
  value?: number;
  token?: string;
  territory?: string;
  description?: string;
  timing?: string;
  isPlayable?: boolean;
}

export type AppScreen = 'join' | 'lobby' | 'game';
export type GamePhaseName = 'Init' | 'Setup' | 'Turn' | 'Invasion';

export interface SaveInfo {
  filename: string;
  timestamp: string;
  playerNames: string[];
  playerCount: number;
}
export type TurnStepName =
  | 'StartOfTurn'
  | 'TurnInTerritoryCards'
  | 'Reinforce'
  | 'BuyCards'
  | 'DeclareInvasions'
  | 'Maneuver'
  | 'TurnInVictoryCards'
  | 'EndOfTurn';

export interface GameState {
  screen: AppScreen;
  connected: boolean;
  playerId: string | null;
  playerName: string | null;

  // Lobby
  players: PlayerInfo[];

  // Game
  phase: GamePhaseName;
  turnStep: TurnStepName | null;
  activePlayerId: string | null;
  territories: TerritoryInfo[];
  troopsToPlace: number;

  // Invasion
  attackingTerritory: string | null;
  defendingTerritory: string | null;
  lastBattle: BattleResultInfo | null;

  // UI selection
  selectedTerritory: string | null;

  // Hand
  hand: CardInfo[];

  // Priority
  priorityPlayerId: string | null;

  // Victory card choice
  victoryChoices: CardInfo[];
  victoryBoughtThisTurn: boolean;
  canUndo: boolean;

  // Save/load
  saves: SaveInfo[];
  expectedPlayers: string[] | null;  // non-null when a save is loaded, waiting for players
  lastSaveMessage: string | null;

  // Errors / messages
  message: string | null;
}

const initialState: GameState = {
  screen: 'join',
  connected: false,
  playerId: null,
  playerName: null,
  players: [],
  phase: 'Init',
  turnStep: null,
  activePlayerId: null,
  territories: [],
  troopsToPlace: 0,
  attackingTerritory: null,
  defendingTerritory: null,
  lastBattle: null,
  selectedTerritory: null,
  hand: [],
  priorityPlayerId: null,
  victoryChoices: [],
  victoryBoughtThisTurn: false,
  canUndo: false,
  saves: [],
  expectedPlayers: null,
  lastSaveMessage: null,
  message: null,
};

// ── Actions ────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_CONNECTED'; connected: boolean }
  | { type: 'JOINED'; playerId: string; playerName: string }
  | { type: 'SET_SCREEN'; screen: AppScreen }
  | { type: 'PLAYERS_UPDATE'; players: PlayerInfo[] }
  | { type: 'GAME_STATE_UPDATE'; phase: GamePhaseName; turnStep: TurnStepName | null; activePlayerId: string; territories: TerritoryInfo[]; troopsToPlace: number; players?: PlayerInfo[]; priorityPlayerId?: string | null; victoryBoughtThisTurn?: boolean; canUndo?: boolean }
  | { type: 'INVASION_START'; attacking: string; defending: string }
  | { type: 'BATTLE_RESULT'; result: BattleResultInfo }
  | { type: 'INVASION_END' }
  | { type: 'SELECT_TERRITORY'; name: string | null }
  | { type: 'HAND_UPDATE'; hand: CardInfo[] }
  | { type: 'VICTORY_CHOICES'; choices: CardInfo[] }
  | { type: 'SAVES_LIST'; saves: SaveInfo[] }
  | { type: 'SAVE_LOADED'; expectedPlayers: string[] }
  | { type: 'GAME_SAVED'; filename: string }
  | { type: 'SET_MESSAGE'; message: string | null };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_CONNECTED':
      return { ...state, connected: action.connected };
    case 'JOINED':
      return { ...state, playerId: action.playerId, playerName: action.playerName, screen: 'lobby' };
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };
    case 'PLAYERS_UPDATE':
      return { ...state, players: action.players };
    case 'GAME_STATE_UPDATE':
      return {
        ...state,
        screen: 'game',
        phase: action.phase,
        turnStep: action.turnStep,
        activePlayerId: action.activePlayerId,
        territories: action.territories,
        troopsToPlace: action.troopsToPlace,
        priorityPlayerId: action.priorityPlayerId ?? null,
        victoryBoughtThisTurn: action.victoryBoughtThisTurn ?? false,
        canUndo: action.canUndo ?? false,
        ...(action.players ? { players: action.players } : {}),
      };
    case 'INVASION_START':
      return { ...state, attackingTerritory: action.attacking, defendingTerritory: action.defending, lastBattle: null };
    case 'BATTLE_RESULT':
      return { ...state, lastBattle: action.result };
    case 'INVASION_END':
      return { ...state, attackingTerritory: null, defendingTerritory: null, lastBattle: null };
    case 'SELECT_TERRITORY':
      return { ...state, selectedTerritory: action.name };
    case 'HAND_UPDATE':
      return { ...state, hand: action.hand };
    case 'VICTORY_CHOICES':
      return { ...state, victoryChoices: action.choices };
    case 'SAVES_LIST':
      return { ...state, saves: action.saves };
    case 'SAVE_LOADED':
      return { ...state, expectedPlayers: action.expectedPlayers };
    case 'GAME_SAVED':
      return { ...state, lastSaveMessage: `Saved: ${action.filename}` };
    case 'SET_MESSAGE':
      return { ...state, message: action.message };
    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<Action>;

  // Convenience action creators that emit to socket
  join: (name: string) => void;
  ready: () => void;
  startGame: () => void;
  placeReinforcements: (territory: string, count: number) => void;
  finishStep: () => void;
  declareInvasion: (from: string, target: string) => void;
  fight: (attackers: number, defenders: number) => void;
  retreat: () => void;
  maneuver: (from: string, to: string, troops: number) => void;
  drawCard: (type: string) => void;
  playCard: (cardId: number, targetTerritory?: string) => void;
  chooseVictoryCard: (cardId: number) => void;
  undo: () => void;
  passPriority: () => void;
  setAutoPass: (enabled: boolean) => void;
  setBreakpoints: (breakpoints: string[]) => void;
  saveGame: () => void;
  listSaves: () => void;
  loadSave: (filename: string) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Wire up socket listeners
  useEffect(() => {
    socket.connect();

    socket.on('connect', () => dispatch({ type: 'SET_CONNECTED', connected: true }));
    socket.on('disconnect', () => dispatch({ type: 'SET_CONNECTED', connected: false }));

    socket.on('joined', ({ playerId, playerName }: { playerId: string; playerName: string }) => {
      dispatch({ type: 'JOINED', playerId, playerName });
    });

    socket.on('players', (players: PlayerInfo[]) => {
      dispatch({ type: 'PLAYERS_UPDATE', players });
    });

    socket.on('gameState', (data: { phase: GamePhaseName; turnStep: TurnStepName | null; activePlayerId: string; territories: TerritoryInfo[]; troopsToPlace: number; priorityPlayerId?: string | null }) => {
      dispatch({ type: 'GAME_STATE_UPDATE', ...data });
    });

    socket.on('invasionStart', ({ attacking, defending }: { attacking: string; defending: string }) => {
      dispatch({ type: 'INVASION_START', attacking, defending });
    });

    socket.on('battleResult', (result: BattleResultInfo) => {
      dispatch({ type: 'BATTLE_RESULT', result });
    });

    socket.on('invasionEnd', () => {
      dispatch({ type: 'INVASION_END' });
    });

    socket.on('hand', (hand: CardInfo[]) => {
      dispatch({ type: 'HAND_UPDATE', hand });
    });

    socket.on('victoryChoices', (choices: CardInfo[]) => {
      dispatch({ type: 'VICTORY_CHOICES', choices });
    });

    socket.on('error', (msg: string) => {
      dispatch({ type: 'SET_MESSAGE', message: msg });
    });

    socket.on('savesList', (saves: SaveInfo[]) => {
      dispatch({ type: 'SAVES_LIST', saves });
    });

    socket.on('saveLoaded', ({ expectedPlayers }: { expectedPlayers: string[] }) => {
      dispatch({ type: 'SAVE_LOADED', expectedPlayers });
    });

    socket.on('gameSaved', ({ filename }: { filename: string }) => {
      dispatch({ type: 'GAME_SAVED', filename });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('joined');
      socket.off('players');
      socket.off('gameState');
      socket.off('invasionStart');
      socket.off('battleResult');
      socket.off('invasionEnd');
      socket.off('hand');
      socket.off('victoryChoices');
      socket.off('error');
      socket.off('savesList');
      socket.off('saveLoaded');
      socket.off('gameSaved');
      socket.disconnect();
    };
  }, []);

  // ── Socket emitters ────────────────────────────────────────────────────

  const join = (name: string) => socket.emit('join', { name });
  const ready = () => socket.emit('ready');
  const startGame = () => socket.emit('startGame');
  const placeReinforcements = (territory: string, count: number) => socket.emit('placeReinforcements', { territory, count });
  const finishStep = () => socket.emit('finishStep');
  const declareInvasion = (from: string, target: string) => socket.emit('declareInvasion', { from, target });
  const fight = (attackers: number, defenders: number) => socket.emit('fight', { attackers, defenders });
  const retreat = () => socket.emit('retreat');
  const maneuver = (from: string, to: string, troops: number) => socket.emit('maneuver', { from, to, troops });
  const drawCard = (type: string) => socket.emit('drawCard', { type });
  const playCard = (cardId: number, targetTerritory?: string) => socket.emit('playCard', { cardId, targetTerritory });
  const chooseVictoryCard = (cardId: number) => {
    socket.emit('chooseVictoryCard', { cardId });
    dispatch({ type: 'VICTORY_CHOICES', choices: [] }); // clear choices immediately
  };
  const undo = () => socket.emit('undo');
  const passPriority = () => socket.emit('passPriority');
  const setAutoPass = (enabled: boolean) => socket.emit('setAutoPass', { enabled });
  const setBreakpoints = (breakpoints: string[]) => socket.emit('setBreakpoints', { breakpoints });
  const saveGame = () => socket.emit('saveGame');
  const listSaves = () => socket.emit('listSaves');
  const loadSave = (filename: string) => socket.emit('loadSave', { filename });

  return (
    <GameContext.Provider value={{ state, dispatch, join, ready, startGame, placeReinforcements, finishStep, declareInvasion, fight, retreat, maneuver, drawCard, playCard, chooseVictoryCard, undo, passPriority, setAutoPass, setBreakpoints, saveGame, listSaves, loadSave }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
