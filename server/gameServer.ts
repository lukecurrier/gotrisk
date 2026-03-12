// ─── GoTRisk Game Server ──────────────────────────────────────────────────────
//
// Authoritative game server. Clients send intents, server validates and
// broadcasts state. Run with: npx tsx server/gameServer.ts
//
// Sections:
//   1. Imports & setup
//   2. Server state
//   3. Serializers (game objects → JSON for clients)
//   4. Broadcast helpers
//   5. Auto-setup (random territory assignment)
//   6. Socket handlers
//   7. Start
// ──────────────────────────────────────────────────────────────────────────────

import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server, Socket } from "socket.io";

// ES modules don't have __dirname — derive it from import.meta.url
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { GameManager } from "../client/src/game/GameManager";
import { Player } from "../client/src/game/Player";
import { TurnPhase, InvasionPhase, TurnStep } from "../client/src/game/GamePhase";
import { GameSettings, getDefaultSettings, resetDefaultSettings } from "../client/src/game/LobbyManager";
import { Territory } from "../client/src/game/Board/Territory";
import { CardType, type Card, type TerritoryCard, type PlayableCard } from "../client/src/game/Cards";
import { GameTimeMarker, Token } from "../client/src/utils/types";
import { MAESTER_DESCRIPTIONS } from "../client/src/utils/CardDescriptions";

// ── 1. Express + Socket.io ───────────────────────────────────────────────────

const app = express();
const httpServer = createServer(app);

const PORT = parseInt(process.env.PORT || "3000", 10);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || [
      "http://localhost:5173",  // Vite dev server
      `http://localhost:${PORT}`, // production (same-origin)
    ],
  },
});
const PLAYER_COLORS = ["#e94560", "#4ade80", "#60a5fa", "#facc15", "#c084fc", "#fb923c"];

// Serve the built React client (production). In dev, Vite proxies to this server instead.
const clientDist = path.join(__dirname, "../client/dist");
app.use(express.static(clientDist));

// ── 2. Server state ──────────────────────────────────────────────────────────

interface ServerPlayer {
  socketId: string;
  player: Player;
  name: string;
  color: string;
  ready: boolean;
  autoPassPriority: boolean;
  breakpoints: Set<string>; // GameTimeMarker names where auto-pass is overridden
}

const lobby: Map<string, ServerPlayer> = new Map();
let gm: GameManager | null = null;

// Priority system state
let priorityQueue: string[] = [];  // socket IDs waiting for priority, in order
let priorityTimeMarker: GameTimeMarker | null = null;

// Per-turn card economy state
const CARD_DRAW_COST = 200;
let victoryBoughtThisTurn = false;
let victoryPlayedThisTurn = false;
let pendingVictoryChoices: { socketId: string; cards: any[] } | null = null;

// ── 3. Serializers ───────────────────────────────────────────────────────────

function serializePlayers(): object[] {
  return Array.from(lobby.values()).map(sp => ({
    id: sp.socketId,
    name: sp.name,
    color: sp.color,
    gold: sp.player.getGold(),
    victoryPoints: sp.player.getVictoryPoints(),
    territoryCount: sp.player.getTerritoryCount(),
    cardCount: sp.player.getTotalCardCount(),
    ready: sp.ready,
  }));
}

function serializeTerritories(): object[] {
  if (!gm) return [];
  return gm.territories.map(t => {
    const owner = t.hasOwner() ? findSocketIdSafe(t.getOwner()) : null;
    return {
      name: t.name,
      owner,
      troops: t.getTroops(),
      region: t.getRegion().name,
      coastal: t.coastal,
      port: t.port,
      castle: t.castle,
      knights: t.getKnights(),
      fortifications: t.getFortifications(),
      siegeEngines: t.getSiegeEngines(),
    };
  });
}

function serializeGameState(): object {
  if (!gm) return {};
  const phase = gm.getCurrentPhase();
  const turnStep = phase instanceof TurnPhase ? TurnStep[phase.turnStep] : null;
  const activeSocketId = findSocketIdSafe(gm.getActivePlayer());

  return {
    phase: phase.name,
    turnStep,
    activePlayerId: activeSocketId,
    territories: serializeTerritories(),
    troopsToPlace: phase instanceof TurnPhase ? phase.getTroopsToPlace() : 0,
    players: serializePlayers(),
    priorityPlayerId: priorityQueue.length > 0 ? priorityQueue[0] : null,
    victoryBoughtThisTurn,
    canUndo: undoUsesLeft > 0,
  };
}

// ── 4. Broadcast helpers ─────────────────────────────────────────────────────

function serializeCard(card: Card, includePlayable: boolean = false): object {
  const base: any = { id: card.id, name: card.name, type: CardType[card.cardType()] };

  // Add description/timing from lookup
  const desc = MAESTER_DESCRIPTIONS[card.name];
  if (desc) {
    base.description = desc.description;
    base.timing = desc.timing;
  }

  // Check playability (only for the owning player's hand)
  if (includePlayable) {
    try { base.isPlayable = card.isActive(); } catch { base.isPlayable = false; }
  }

  if (card.cardType() === CardType.Character || card.cardType() === CardType.Maester) {
    base.price = (card as any).price;
  }
  if (card.cardType() === CardType.Territory) {
    const tc = card as TerritoryCard;
    base.token = Token[tc.getToken()];
    base.territory = tc.territory.name;
  }
  if (card.cardType() === CardType.Victory) {
    base.value = (card as any).value;
  }
  return base;
}

function serializeHand(player: Player): object[] {
  return player.getAllCards().map(c => serializeCard(c, true));
}

function broadcastPlayers() {
  io.emit("players", serializePlayers());
}

function emitState() {
  const state = serializeGameState();
  io.emit("gameState", state);
  io.emit("players", (state as any).players);
  for (const [sid, sp] of lobby) {
    const sock = io.sockets.sockets.get(sid);
    if (sock) sock.emit("hand", serializeHand(sp.player));
  }
}

function broadcastGameState() {
  emitState();

  // Auto-skip steps where the player has nothing to do (only when not in priority)
  if (priorityQueue.length === 0) {
    autoSkip();
  }

  // After everything settles, snapshot the current step start
  recordStepStart();
}

function autoSkip() {
  if (!gm) return;

  while (true) {
    const phase = gm.getCurrentPhase();
    if (!(phase instanceof TurnPhase)) return;

    const player = gm.getActivePlayer();
    let skipped = false;

    switch (phase.turnStep) {
      case TurnStep.TurnInTerritoryCards:
        if (player.getCardCount(CardType.Territory) === 0) {
          phase.finishTurnInCards();
          skipped = true;
        }
        break;
      case TurnStep.Reinforce:
        if (phase.getTroopsToPlace() === 0) {
          phase.finishReinforcements();
          skipped = true;
        }
        break;
      case TurnStep.Maneuver:
        if (phase.getHasManeuvered()) {
          phase.finishManeuver();
          skipped = true;
        }
        break;
      case TurnStep.TurnInVictoryCards:
        if (player.getCardCount(CardType.Victory) === 0) {
          phase.finishTurnInVictoryCards();
          skipped = true;
        }
        break;
      case TurnStep.EndOfTurn:
        gm.endCurrentTurn();
        victoryBoughtThisTurn = false;
        victoryPlayedThisTurn = false;
        skipped = true;
        break;
    }

    if (!skipped) return;
    emitState();
  }
}

// ── 5. Priority system ──────────────────────────────────────────────────────
//
// MTGO-style: at trigger moments, players with playable cards get priority.
// Game pauses until each priority holder plays or passes.

function checkPriority(timeMarker: GameTimeMarker) {
  if (!gm) return;
  if (priorityQueue.length > 0) return; // already in priority

  priorityTimeMarker = timeMarker;
  const queue: string[] = [];

  // Check each player in turn order (starting after active player)
  const playerCount = gm.players.length;
  const startIdx = (gm.activePlayerIndex + 1) % playerCount;
  for (let i = 0; i < playerCount; i++) {
    const idx = (startIdx + i) % playerCount;
    const player = gm.players[idx];
    let sid: string;
    try { sid = findSocketId(player); } catch { continue; }
    const sp = lobby.get(sid);
    if (!sp) continue;

    // Does this player have playable cards right now?
    const hasPlayable = sp.player.getAllCards().some(c => {
      try { return c.isActive(); } catch { return false; }
    });
    if (!hasPlayable) continue;

    // Check auto-pass vs breakpoints
    if (sp.autoPassPriority && !sp.breakpoints.has(GameTimeMarker[timeMarker])) continue;

    queue.push(sid);
  }

  if (queue.length === 0) {
    priorityTimeMarker = null;
    return; // no one needs priority
  }

  priorityQueue = queue;
  console.log(`[priority] ${GameTimeMarker[timeMarker]}: ${queue.map(s => lobby.get(s)?.name).join(', ')}`);
  broadcastGameState();
}

function advancePriority() {
  // Current holder passed — advance to next or end
  priorityQueue.shift();

  if (priorityQueue.length === 0) {
    priorityTimeMarker = null;
    console.log("[priority] all passed");
  }

  broadcastGameState();
}

function guardNoPriority() {
  if (priorityQueue.length > 0) {
    throw new Error("Waiting for priority response");
  }
}

// ── Snapshot / Undo system ──────────────────────────────────────────────────
//
// Before each state-changing action, take a snapshot. "Undo" restores it.

interface GameSnapshot {
  territories: { name: string; ownerPlayerIndex: number | null; troops: number; knights: number; fortifications: number; siegeEngines: number }[];
  players: { gold: number; vp: number; cardIds: number[] }[];
  activePlayerIndex: number;
  turnPhaseSnapshot: ReturnType<TurnPhase['getSnapshot']> | null;
  phaseName: string;
  territoryDeckIds: number[];
  maesterDeckIds: number[];
  victoryDeckIds: number[];
  victoryBoughtThisTurn: boolean;
  victoryPlayedThisTurn: boolean;
}

let stepStartSnapshot: GameSnapshot | null = null;
let prevStepStartSnapshot: GameSnapshot | null = null;
let undoUsesLeft = 0;
let lastSnapshotStep: string | null = null;

// Map from card id → Card object for restore
function buildCardIndex(): Map<number, any> {
  if (!gm) return new Map();
  const index = new Map<number, any>();

  // Cards in player hands
  for (const sp of lobby.values()) {
    for (const card of sp.player.getAllCards()) index.set(card.id, card);
  }
  // Cards in decks
  for (const c of gm.territoryCardDeck.cards) index.set(c.id, c);
  for (const c of gm.maesterCardDeck.cards) index.set(c.id, c);
  for (const c of gm.victoryCardDeck.cards) index.set(c.id, c);

  return index;
}

function takeSnapshot(): GameSnapshot | null {
  if (!gm) return null;

  const phase = gm.getCurrentPhase();
  const players = Array.from(lobby.values());

  return {
    territories: gm.territories.map(t => ({
      name: t.name,
      ownerPlayerIndex: t.hasOwner() ? gm!.players.indexOf(t.getOwner()) : null,
      troops: t.getTroops(),
      knights: t.getKnights(),
      fortifications: t.getFortifications(),
      siegeEngines: t.getSiegeEngines(),
    })),
    players: players.map(sp => ({
      gold: sp.player.getGold(),
      vp: sp.player.getVictoryPoints(),
      cardIds: sp.player.getCardIds(),
    })),
    activePlayerIndex: gm.activePlayerIndex,
    turnPhaseSnapshot: phase instanceof TurnPhase ? phase.getSnapshot() : null,
    phaseName: phase.name,
    territoryDeckIds: gm.territoryCardDeck.cards.map(c => c.id),
    maesterDeckIds: gm.maesterCardDeck.cards.map(c => c.id),
    victoryDeckIds: gm.victoryCardDeck.cards.map(c => c.id),
    victoryBoughtThisTurn,
    victoryPlayedThisTurn,
  };
}

function recordStepStart() {
  if (!gm) return;
  const phase = gm.getCurrentPhase();
  const currentStep = phase instanceof TurnPhase ? TurnStep[phase.turnStep] : phase.name;
  if (currentStep !== lastSnapshotStep) {
    prevStepStartSnapshot = stepStartSnapshot;
    stepStartSnapshot = takeSnapshot();
    lastSnapshotStep = currentStep;
    undoUsesLeft = 2;
  }
}

function restoreSnapshot(snap: GameSnapshot) {
  if (!gm) return;

  const cardIndex = buildCardIndex();
  const players = Array.from(lobby.values());

  // Restore territories (bypass normal changeOwner to avoid side effects)
  for (const tSnap of snap.territories) {
    const t = gm.territories.find(t => t.name === tSnap.name);
    if (!t) continue;
    const newOwner = tSnap.ownerPlayerIndex != null ? gm.players[tSnap.ownerPlayerIndex] : undefined;
    t.setOwnerDirect(newOwner);
    t.setTroopsDirect(tSnap.troops);
    t.setKnights(tSnap.knights);
    t.setFortifications(tSnap.fortifications);
    t.setSiegeEngines(tSnap.siegeEngines);
  }

  // Rebuild player territory lists from territory ownership
  for (const p of gm.players) {
    const owned = gm.territories.filter(t => t.hasOwner() && t.getOwner() === p);
    p.setTerritoriesDirect(owned);
  }

  // Restore player state
  for (let i = 0; i < players.length; i++) {
    const sp = players[i];
    const pSnap = snap.players[i];
    sp.player.setGold(pSnap.gold);
    sp.player.setVictoryPoints(pSnap.vp);

    // Restore cards
    sp.player.clearCards();
    for (const cid of pSnap.cardIds) {
      const card = cardIndex.get(cid);
      if (card) sp.player.addCard(card);
    }
  }

  // Restore active player
  gm.activePlayerIndex = snap.activePlayerIndex;

  // Restore phase
  const phase = gm.getCurrentPhase();
  if (phase instanceof TurnPhase && snap.turnPhaseSnapshot) {
    phase.restoreSnapshot(snap.turnPhaseSnapshot);
  }

  // Restore decks
  gm.territoryCardDeck.cards = snap.territoryDeckIds.map(id => cardIndex.get(id)).filter(Boolean);
  gm.maesterCardDeck.cards = snap.maesterDeckIds.map(id => cardIndex.get(id)).filter(Boolean);
  gm.victoryCardDeck.cards = snap.victoryDeckIds.map(id => cardIndex.get(id)).filter(Boolean);

  // Restore server flags
  victoryBoughtThisTurn = snap.victoryBoughtThisTurn;
  victoryPlayedThisTurn = snap.victoryPlayedThisTurn;

  // Clear priority
  priorityQueue = [];
  priorityTimeMarker = null;
  pendingVictoryChoices = null;
}

// ── Save / Load system ───────────────────────────────────────────────────────

const SAVES_DIR = path.join(__dirname, "../saves");

interface GameSave {
  timestamp: string;
  players: {
    name: string;
    color: string;
    gold: number;
    victoryPoints: number;
    cardNames: { name: string; type: string }[];
  }[];
  territories: {
    name: string;
    ownerName: string | null;
    troops: number;
    knights: number;
    fortifications: number;
    siegeEngines: number;
  }[];
  activePlayerName: string;
  turnStep: string | null;
  turnPhaseState: {
    troopsToPlace: number;
    territoryCardBonusTroops: number;
    conqueredThisTurn: boolean;
    hasManeuvered: boolean;
  } | null;
  territoryDeckNames: string[];
  maesterDeckNames: string[];
  victoryDeckNames: string[];
  victoryBoughtThisTurn: boolean;
  victoryPlayedThisTurn: boolean;
}

let pendingSave: GameSave | null = null;

function createGameSave(): GameSave | null {
  if (!gm) return null;
  const phase = gm.getCurrentPhase();
  const players = Array.from(lobby.values());

  return {
    timestamp: new Date().toISOString(),
    players: players.map(sp => ({
      name: sp.name,
      color: sp.color,
      gold: sp.player.getGold(),
      victoryPoints: sp.player.getVictoryPoints(),
      cardNames: sp.player.getAllCards().map(c => ({
        name: c.name,
        type: CardType[c.cardType()],
      })),
    })),
    territories: gm.territories.map(t => ({
      name: t.name,
      ownerName: t.hasOwner() ? findPlayerName(t.getOwner()) : null,
      troops: t.getTroops(),
      knights: t.getKnights(),
      fortifications: t.getFortifications(),
      siegeEngines: t.getSiegeEngines(),
    })),
    activePlayerName: findPlayerName(gm.getActivePlayer()),
    turnStep: phase instanceof TurnPhase ? TurnStep[phase.turnStep] : null,
    turnPhaseState: phase instanceof TurnPhase ? {
      troopsToPlace: phase.getSnapshot().troopsToPlace,
      territoryCardBonusTroops: phase.getSnapshot().territoryCardBonusTroops,
      conqueredThisTurn: phase.getSnapshot().conqueredThisTurn,
      hasManeuvered: phase.getSnapshot().hasManeuvered,
    } : null,
    territoryDeckNames: gm.territoryCardDeck.cards.map(c => c.name),
    maesterDeckNames: gm.maesterCardDeck.cards.map(c => c.name),
    victoryDeckNames: gm.victoryCardDeck.cards.map(c => c.name),
    victoryBoughtThisTurn,
    victoryPlayedThisTurn,
  };
}

function findPlayerName(player: Player): string {
  for (const sp of lobby.values()) {
    if (sp.player === player) return sp.name;
  }
  return "unknown";
}

function restoreFromSave(save: GameSave, players: Player[]) {
  // Force fresh settings (fresh decks, fresh board, new card instances)
  resetDefaultSettings();
  const settings = getDefaultSettings();

  gm = GameManager.create(settings, players, 0,
    settings.territoryDeck, settings.maesterDeck, settings.victoryDeck);

  // Start the game to get into TurnPhase (Init → Setup → Turn)
  gm.startGame();
  gm.startGame();

  // Build card lookup: name+type → Card (pull from all decks)
  const allCards = [
    ...gm.territoryCardDeck.cards,
    ...gm.maesterCardDeck.cards,
    ...gm.victoryCardDeck.cards,
  ];
  const cardsByKey = new Map<string, typeof allCards>();
  for (const card of allCards) {
    const key = `${card.name}|${CardType[card.cardType()]}`;
    if (!cardsByKey.has(key)) cardsByKey.set(key, []);
    cardsByKey.get(key)!.push(card);
  }

  function takeCard(name: string, type: string) {
    const key = `${name}|${type}`;
    const pool = cardsByKey.get(key);
    if (!pool || pool.length === 0) {
      console.warn(`[load] Card not found: ${name} (${type})`);
      return null;
    }
    return pool.shift()!;
  }

  // Restore territory state
  const playersByName = new Map<string, { sp: ServerPlayer; player: Player }>();
  const lobbyArr = Array.from(lobby.values());
  for (const sp of lobbyArr) {
    playersByName.set(sp.name, { sp, player: sp.player });
  }

  for (const tSave of save.territories) {
    const t = gm.territories.find(t => t.name === tSave.name);
    if (!t) { console.warn(`[load] Territory not found: ${tSave.name}`); continue; }

    if (tSave.ownerName) {
      const owner = playersByName.get(tSave.ownerName);
      if (owner) {
        t.setOwnerDirect(owner.player);
      }
    } else {
      t.setOwnerDirect(undefined);
    }
    t.setTroopsDirect(tSave.troops);
    t.setKnights(tSave.knights);
    t.setFortifications(tSave.fortifications);
    t.setSiegeEngines(tSave.siegeEngines);
  }

  // Rebuild player territory lists
  for (const p of gm.players) {
    const owned = gm.territories.filter(t => t.hasOwner() && t.getOwner() === p);
    p.setTerritoriesDirect(owned);
  }

  // Restore player state and cards
  for (const pSave of save.players) {
    const entry = playersByName.get(pSave.name);
    if (!entry) continue;
    const { player } = entry;

    player.setGold(pSave.gold);
    player.setVictoryPoints(pSave.victoryPoints);

    // Clear any cards from the TurnPhase.enter() income
    player.clearCards();

    // Add saved cards (removes them from deck pools via takeCard)
    for (const cSave of pSave.cardNames) {
      const card = takeCard(cSave.name, cSave.type);
      if (card) {
        // Remove from the deck
        gm.territoryCardDeck.cards = gm.territoryCardDeck.cards.filter(c => c !== card);
        gm.maesterCardDeck.cards = gm.maesterCardDeck.cards.filter(c => c !== card);
        gm.victoryCardDeck.cards = gm.victoryCardDeck.cards.filter(c => c !== card);
        player.addCard(card);
      }
    }
  }

  // Restore deck order (cards remaining after player distribution)
  function reorderDeck<T extends { name: string }>(deck: { cards: T[] }, savedOrder: string[]) {
    const byName = new Map<string, T[]>();
    for (const c of deck.cards) {
      if (!byName.has(c.name)) byName.set(c.name, []);
      byName.get(c.name)!.push(c);
    }
    const reordered: T[] = [];
    for (const name of savedOrder) {
      const pool = byName.get(name);
      if (pool && pool.length > 0) reordered.push(pool.shift()!);
    }
    deck.cards = reordered;
  }

  reorderDeck(gm.territoryCardDeck, save.territoryDeckNames);
  reorderDeck(gm.maesterCardDeck, save.maesterDeckNames);
  reorderDeck(gm.victoryCardDeck, save.victoryDeckNames);

  // Restore active player
  const activeEntry = playersByName.get(save.activePlayerName);
  if (activeEntry) {
    gm.activePlayerIndex = gm.players.indexOf(activeEntry.player);
  }

  // Restore turn phase state
  const phase = gm.getCurrentPhase();
  if (phase instanceof TurnPhase && save.turnPhaseState && save.turnStep) {
    const stepEnum = TurnStep[save.turnStep as keyof typeof TurnStep];
    phase.restoreSnapshot({
      turnStep: stepEnum,
      troopsToPlace: save.turnPhaseState.troopsToPlace,
      territoryCardBonusTroops: save.turnPhaseState.territoryCardBonusTroops,
      conqueredThisTurn: save.turnPhaseState.conqueredThisTurn,
      hasManeuvered: save.turnPhaseState.hasManeuvered,
      permanentEffects: [],
      turnCycleEffects: [],
      endOfTurnEffects: [],
    });
  }

  // Restore server flags
  victoryBoughtThisTurn = save.victoryBoughtThisTurn;
  victoryPlayedThisTurn = save.victoryPlayedThisTurn;

  // Reset undo/priority state
  stepStartSnapshot = null;
  prevStepStartSnapshot = null;
  undoUsesLeft = 0;
  lastSnapshotStep = null;
  priorityQueue = [];
  priorityTimeMarker = null;
  pendingVictoryChoices = null;
}

// ── 6. Lookup helpers ────────────────────────────────────────────────────────

function findSocketId(player: Player): string {
  for (const [sid, sp] of lobby) {
    if (sp.player === player) return sid;
  }
  throw new Error("Player not found in lobby");
}

/** Like findSocketId but returns null instead of throwing for disconnected players */
function findSocketIdSafe(player: Player): string | null {
  for (const [sid, sp] of lobby) {
    if (sp.player === player) return sid;
  }
  return null;
}

function getServerPlayer(socket: Socket): ServerPlayer {
  const sp = lobby.get(socket.id);
  if (!sp) throw new Error("Not in lobby");
  return sp;
}

function findTerritory(name: string): Territory {
  if (!gm) throw new Error("Game not started");
  const t = gm.territories.find(t => t.name === name);
  if (!t) throw new Error(`Unknown territory: ${name}`);
  return t;
}

function guardActivePlayer(socket: Socket) {
  if (!gm) throw new Error("Game not started");
  const sp = getServerPlayer(socket);
  if (gm.getActivePlayer() !== sp.player) {
    throw new Error("Not your turn");
  }
}

// ── 6. Auto-setup ────────────────────────────────────────────────────────────
//
// Randomly distributes territories among players with starting troops.

function autoSetup(gameManager: GameManager, players: Player[]) {
  const territories = [...gameManager.territories];

  // Shuffle territories
  for (let i = territories.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [territories[i], territories[j]] = [territories[j], territories[i]];
  }

  // Deal territories round-robin
  for (let i = 0; i < territories.length; i++) {
    const player = players[i % players.length];
    territories[i].changeOwner(player);
    territories[i].placeTroops(3); // 3 starting troops each
  }

  console.log(`[setup] Distributed ${territories.length} territories among ${players.length} players`);
  for (const p of players) {
    console.log(`  ${p.name}: ${p.getTerritoryCount()} territories`);
  }
}

// ── 7. Socket handlers ──────────────────────────────────────────────────────

io.on("connection", (socket) => {
  console.log(`[connect] ${socket.id}`);

  // Send current state if game is running (reconnect-friendly)
  if (gm) {
    broadcastGameState();
  }

  // ── Join ──────────────────────────────────────────────────────────────

  socket.on("join", ({ name }: { name: string }) => {
    if (!name?.trim()) return emitError(socket, "Name required");
    if (gm) return emitError(socket, "Game already in progress");

    for (const sp of lobby.values()) {
      if (sp.name === name) return emitError(socket, "Name taken");
    }

    // If a save is loaded, only allow matching player names
    if (pendingSave) {
      const expectedNames = pendingSave.players.map(p => p.name);
      if (!expectedNames.includes(name)) {
        return emitError(socket, `Save expects players: ${expectedNames.join(", ")}`);
      }
    }

    // Use saved color if restoring, otherwise assign from palette
    const savedPlayer = pendingSave?.players.find(p => p.name === name);
    const color = savedPlayer?.color ?? PLAYER_COLORS[lobby.size % PLAYER_COLORS.length];
    const player = new Player(lobby.size, name, color);
    lobby.set(socket.id, { socketId: socket.id, player, name, color, ready: false, autoPassPriority: false, breakpoints: new Set(["BeforeAnInvasion"]) });

    socket.emit("joined", { playerId: socket.id, playerName: name });
    broadcastPlayers();
    console.log(`[join] ${name} (${socket.id})`);
  });

  // ── Ready ─────────────────────────────────────────────────────────────

  socket.on("ready", () => {
    try {
      const sp = getServerPlayer(socket);
      sp.ready = true;
      broadcastPlayers();
    } catch (e: any) {
      emitError(socket, e.message);
    }
  });

  // ── Start Game ────────────────────────────────────────────────────────

  socket.on("startGame", () => {
    try {
      if (gm) throw new Error("Game already started");
      if (lobby.size < 2) throw new Error("Need at least 2 players");

      const allReady = Array.from(lobby.values()).every(sp => sp.ready);
      if (!allReady) throw new Error("Not all players ready");

      const players = Array.from(lobby.values()).map(sp => sp.player);

      if (pendingSave) {
        // ── Restore from save ──
        const save = pendingSave;
        pendingSave = null;

        // Validate all saved players are present
        const joinedNames = new Set(Array.from(lobby.values()).map(sp => sp.name));
        for (const pSave of save.players) {
          if (!joinedNames.has(pSave.name)) {
            throw new Error(`Waiting for player: ${pSave.name}`);
          }
        }

        restoreFromSave(save, players);
        console.log("[game loaded from save]");
      } else {
        // ── New game ──
        const settings = getDefaultSettings();
        gm = GameManager.create(settings, players, 0,
          settings.territoryDeck, settings.maesterDeck, settings.victoryDeck);

        autoSetup(gm, players);

        // Reset undo state
        stepStartSnapshot = null;
        prevStepStartSnapshot = null;
        undoUsesLeft = 0;
        lastSnapshotStep = null;

        gm.startGame();  // Init → Setup
        gm.startGame();  // Setup → Turn
        console.log("[game started]");
      }

      broadcastGameState();
    } catch (e: any) {
      console.error("[startGame error]", e);
      emitError(socket, e.message);
    }
  });

  // ── Save Game ──────────────────────────────────────────────────────────

  socket.on("saveGame", () => {
    try {
      if (!gm) throw new Error("No game in progress");
      guardActivePlayer(socket);

      const save = createGameSave();
      if (!save) throw new Error("Failed to create save");

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `${timestamp}.json`;
      const filepath = path.join(SAVES_DIR, filename);

      fs.writeFileSync(filepath, JSON.stringify(save, null, 2));
      socket.emit("gameSaved", { filename });
      console.log(`[save] ${getServerPlayer(socket).name} saved game: ${filename}`);
    } catch (e: any) {
      emitError(socket, e.message);
    }
  });

  // ── List Saves ──────────────────────────────────────────────────────────

  socket.on("listSaves", () => {
    try {
      if (!fs.existsSync(SAVES_DIR)) {
        socket.emit("savesList", []);
        return;
      }
      const files = fs.readdirSync(SAVES_DIR)
        .filter(f => f.endsWith(".json"))
        .sort()
        .reverse(); // newest first

      const saves = files.map(f => {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(SAVES_DIR, f), "utf-8")) as GameSave;
          return {
            filename: f,
            timestamp: data.timestamp,
            playerNames: data.players.map(p => p.name),
            playerCount: data.players.length,
          };
        } catch {
          return null;
        }
      }).filter(Boolean);

      socket.emit("savesList", saves);
    } catch (e: any) {
      emitError(socket, e.message);
    }
  });

  // ── Load Save ──────────────────────────────────────────────────────────

  socket.on("loadSave", ({ filename }: { filename: string }) => {
    try {
      if (gm) throw new Error("Game already in progress");

      const filepath = path.join(SAVES_DIR, filename);
      if (!fs.existsSync(filepath)) throw new Error("Save file not found");

      const save = JSON.parse(fs.readFileSync(filepath, "utf-8")) as GameSave;
      pendingSave = save;

      const expectedNames = save.players.map(p => p.name);
      io.emit("saveLoaded", { filename, expectedPlayers: expectedNames });
      console.log(`[load] Save loaded: ${filename}, expecting: ${expectedNames.join(", ")}`);
    } catch (e: any) {
      emitError(socket, e.message);
    }
  });

  // ── Place Reinforcements ──────────────────────────────────────────────

  socket.on("placeReinforcements", ({ territory, count }: { territory: string; count: number }) => {
    try {
      guardActivePlayer(socket);

      const phase = gm!.getCurrentPhase();
      if (!(phase instanceof TurnPhase)) throw new Error("Not in turn phase");

      const t = findTerritory(territory);
      phase.placeReinforcements(t, count);
      broadcastGameState();
    } catch (e: any) {
      emitError(socket, e.message);
    }
  });

  // ── Finish Step ───────────────────────────────────────────────────────

  socket.on("finishStep", () => {
    try {
      guardActivePlayer(socket);

      const phase = gm!.getCurrentPhase();
      if (!(phase instanceof TurnPhase)) throw new Error("Not in turn phase");

      switch (phase.turnStep) {
        case TurnStep.TurnInTerritoryCards:
          phase.finishTurnInCards();
          break;
        case TurnStep.Reinforce:
          phase.finishReinforcements();
          break;
        case TurnStep.BuyCards:
          phase.finishBuyingCards();
          break;
        case TurnStep.DeclareInvasions:
          phase.finishInvasions();
          break;
        case TurnStep.Maneuver:
          phase.finishManeuver();
          break;
        case TurnStep.TurnInVictoryCards:
          phase.finishTurnInVictoryCards();
          break;
        case TurnStep.EndOfTurn:
          gm!.endCurrentTurn();
          victoryBoughtThisTurn = false;
          victoryPlayedThisTurn = false;
          break;
        default:
          throw new Error("Nothing to advance");
      }

      broadcastGameState();
    } catch (e: any) {
      emitError(socket, e.message);
    }
  });

  // ── Draw Card ───────────────────────────────────────────────────────

  socket.on("drawCard", ({ type }: { type: string }) => {
    try {
      guardActivePlayer(socket);
      const sp = getServerPlayer(socket);
      const phase = gm!.getCurrentPhase();
      if (!(phase instanceof TurnPhase) || phase.turnStep !== TurnStep.BuyCards) {
        throw new Error("Can only draw cards during the Buy step");
      }
      if (!sp.player.canSpend(CARD_DRAW_COST)) {
        throw new Error(`Need ${CARD_DRAW_COST}g to draw a card`);
      }

      switch (type) {
        case "Maester": {
          if (gm!.maesterCardDeck.isEmpty()) throw new Error("Maester deck is empty");
          sp.player.spend(CARD_DRAW_COST);
          gm!.drawMaesterCard(sp.player);
          console.log(`[drawCard] ${sp.name} drew a Maester card (gold: ${sp.player.getGold()})`);
          broadcastGameState();
          break;
        }
        case "Victory": {
          if (victoryBoughtThisTurn) throw new Error("Already bought a victory card this turn");
          if (gm!.victoryCardDeck.isEmpty()) throw new Error("Victory deck is empty");

          sp.player.spend(CARD_DRAW_COST);

          // Draw up to 2 cards for the player to choose from
          const card1 = gm!.victoryCardDeck.draw();
          const card2 = gm!.victoryCardDeck.draw();

          if (!card1) throw new Error("Victory deck is empty");

          if (!card2) {
            // Only 1 card left — auto-add it
            sp.player.addCard(card1);
            victoryBoughtThisTurn = true;
            console.log(`[drawCard] ${sp.name} drew victory card: ${card1.name} (only 1 available)`);
            broadcastGameState();
          } else {
            // 2 cards — player must choose
            pendingVictoryChoices = { socketId: socket.id, cards: [card1, card2] };
            const sock = io.sockets.sockets.get(socket.id);
            if (sock) {
              sock.emit("victoryChoices", [card1, card2].map(c => serializeCard(c)));
            }
            console.log(`[drawCard] ${sp.name} choosing between: ${card1.name} / ${card2.name}`);
            // Don't broadcast yet — wait for choice
          }
          break;
        }
        default:
          throw new Error(`Unknown card type: ${type}`);
      }
    } catch (e: any) {
      emitError(socket, e.message);
    }
  });

  // ── Choose Victory Card ───────────────────────────────────────────

  socket.on("chooseVictoryCard", ({ cardId }: { cardId: number }) => {
    try {
      if (!pendingVictoryChoices || pendingVictoryChoices.socketId !== socket.id) {
        throw new Error("No pending victory choice");
      }

      const chosen = pendingVictoryChoices.cards.find((c: any) => c.id === cardId);
      if (!chosen) throw new Error("Invalid choice");

      const returned = pendingVictoryChoices.cards.find((c: any) => c.id !== cardId);

      const sp = getServerPlayer(socket);
      sp.player.addCard(chosen);

      // Return unchosen card to bottom of deck
      if (returned) {
        gm!.victoryCardDeck.cards.unshift(returned);
      }

      victoryBoughtThisTurn = true;
      pendingVictoryChoices = null;

      console.log(`[chooseVictory] ${sp.name} chose: ${chosen.name}`);
      broadcastGameState();
    } catch (e: any) {
      emitError(socket, e.message);
    }
  });

  // ── Play Card ──────────────────────────────────────────────────────

  socket.on("playCard", ({ cardId, targetTerritory }: { cardId: number; targetTerritory?: string }) => {
    try {
      if (!gm) throw new Error("Game not started");
      const sp = getServerPlayer(socket);

      // During priority, only the priority holder can play cards
      if (priorityQueue.length > 0 && priorityQueue[0] !== socket.id) {
        throw new Error("Not your priority");
      }

      // Find the card in the player's hand by unique ID
      const card = sp.player.getAllCards().find(c => c.id === cardId);
      if (!card) throw new Error("Card not in hand");

      // Victory card: one per turn limit
      if (card.cardType() === CardType.Victory) {
        if (victoryPlayedThisTurn) throw new Error("Already played a victory card this turn");
      }

      // Validate the card can be played right now
      if (!card.isActive()) throw new Error("Card cannot be played right now");

      // Execute the card
      card.play();
      sp.player.removeCard(card);

      if (card.cardType() === CardType.Victory) {
        victoryPlayedThisTurn = true;
      }

      console.log(`[playCard] ${sp.name} played ${card.name}`);

      broadcastGameState();
    } catch (e: any) {
      emitError(socket, e.message);
    }
  });

  // ── Declare Invasion ──────────────────────────────────────────────────

  socket.on("declareInvasion", ({ from, target }: { from: string; target: string }) => {
    try {
      guardActivePlayer(socket);
      guardNoPriority();

      const fromT = findTerritory(from);
      const targetT = findTerritory(target);

      gm!.enterInvasion(fromT, targetT);

      io.emit("invasionStart", { attacking: from, defending: target });
      broadcastGameState();

      // Give priority to players with BeforeAnInvasion cards
      checkPriority(GameTimeMarker.BeforeAnInvasion);
    } catch (e: any) {
      emitError(socket, e.message);
    }
  });

  // ── Fight ─────────────────────────────────────────────────────────────

  socket.on("fight", ({ attackers, defenders }: { attackers: number; defenders: number }) => {
    try {
      guardActivePlayer(socket);
      guardNoPriority();

      const phase = gm!.getCurrentPhase();
      if (!(phase instanceof InvasionPhase)) throw new Error("Not in invasion");

      const result = phase.fight(attackers, defenders);
      const outcome = result.outcome();

      io.emit("battleResult", {
        attackerRolls: result.attackDice.map(d => d.view()),
        defenderRolls: result.defendDice.map(d => d.view()),
        attackerLosses: outcome.attackerLosses,
        defenderLosses: outcome.defenderLosses,
        conquered: phase.wasConquered(),
      });

      broadcastGameState();
    } catch (e: any) {
      emitError(socket, e.message);
    }
  });

  // ── Retreat / End Invasion ────────────────────────────────────────────

  socket.on("retreat", () => {
    try {
      guardActivePlayer(socket);
      guardNoPriority();

      gm!.resolveInvasion();
      io.emit("invasionEnd");
      broadcastGameState();
    } catch (e: any) {
      emitError(socket, e.message);
    }
  });

  // ── Maneuver ──────────────────────────────────────────────────────────

  socket.on("maneuver", ({ from, to, troops }: { from: string; to: string; troops: number }) => {
    try {
      guardActivePlayer(socket);

      const phase = gm!.getCurrentPhase();
      if (!(phase instanceof TurnPhase)) throw new Error("Not in turn phase");

      phase.maneuver(findTerritory(from), findTerritory(to), troops);
      broadcastGameState();
    } catch (e: any) {
      emitError(socket, e.message);
    }
  });

  // ── Undo ─────────────────────────────────────────────────────────────

  socket.on("undo", () => {
    try {
      guardActivePlayer(socket);

      if (undoUsesLeft >= 2 && stepStartSnapshot) {
        restoreSnapshot(stepStartSnapshot);
        undoUsesLeft = 1;
      } else if (undoUsesLeft === 1 && prevStepStartSnapshot) {
        restoreSnapshot(prevStepStartSnapshot);
        // We're now at the previous step — update tracking
        // Keep stepStartSnapshot pointing here so future undos can return to it
        stepStartSnapshot = prevStepStartSnapshot;
        prevStepStartSnapshot = null;
        const phase = gm!.getCurrentPhase();
        lastSnapshotStep = phase instanceof TurnPhase ? TurnStep[phase.turnStep] : phase.name;
        // Still 1 use left: can undo back to this step start again after taking actions
        undoUsesLeft = 1;
      } else {
        throw new Error("Nothing to undo");
      }

      console.log(`[undo] ${getServerPlayer(socket).name} undid (${undoUsesLeft} uses left)`);
      // Emit state directly — don't call broadcastGameState to avoid re-snapshotting
      emitState();
    } catch (e: any) {
      emitError(socket, e.message);
    }
  });

  // ── Priority ─────────────────────────────────────────────────────────

  socket.on("passPriority", () => {
    try {
      if (priorityQueue.length === 0 || priorityQueue[0] !== socket.id) {
        throw new Error("You don't have priority");
      }
      const sp = lobby.get(socket.id);
      console.log(`[priority] ${sp?.name} passed`);
      advancePriority();
    } catch (e: any) {
      emitError(socket, e.message);
    }
  });

  socket.on("setAutoPass", ({ enabled }: { enabled: boolean }) => {
    const sp = lobby.get(socket.id);
    if (sp) {
      sp.autoPassPriority = enabled;
      console.log(`[settings] ${sp.name} auto-pass: ${enabled}`);
    }
  });

  socket.on("setBreakpoints", ({ breakpoints }: { breakpoints: string[] }) => {
    const sp = lobby.get(socket.id);
    if (sp) {
      sp.breakpoints = new Set(breakpoints);
      console.log(`[settings] ${sp.name} breakpoints: ${breakpoints.join(', ')}`);
    }
  });

  // ── Disconnect ────────────────────────────────────────────────────────

  socket.on("disconnect", () => {
    const sp = lobby.get(socket.id);
    if (sp) {
      console.log(`[disconnect] ${sp.name}`);
      lobby.delete(socket.id);
      if (!gm) broadcastPlayers();
      // TODO: handle mid-game disconnects
    }
  });
});

// ── Error helper ─────────────────────────────────────────────────────────────

function emitError(socket: Socket, msg: string) {
  console.warn(`[error → ${socket.id}]`, msg);
  socket.emit("error", msg);
}

// ── 8. Start ─────────────────────────────────────────────────────────────────

// SPA catch-all: any route that didn't match a static file gets index.html,
// so client-side routing works on page refresh.
app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

httpServer.listen(PORT, () => {
  console.log(`GoTRisk server running on http://localhost:${PORT}`);
});
