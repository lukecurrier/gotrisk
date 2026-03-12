import { CardEffect } from "./CardEffect";
import { Player } from "./Player";
import { Territory } from "./Board/Territory";
import { GameTimeMarker, Token } from "../utils/types";
import { BattleResult, territorySetValue } from "../utils/Utils";
import { TerritoryCard, CardType } from "./Cards";
import { GameManager } from "./GameManager";

export abstract class Phase {
  /*
  A phase is an object which holds values which may need to be referenced by the game.

  Phases are meant to act as the primary source of communication between the client and the backend.
  */
  abstract readonly name: string;
  abstract readonly gameOngoing: boolean;
  abstract readonly gameTimeMarker: GameTimeMarker;

  protected permanentEffects: CardEffect[] = [];
  protected turnCycleEffects: CardEffect[] = [];
  protected endOfTurnEffects: CardEffect[] = [];
  protected combatEffects: CardEffect[] = [];
  protected invasionEffects: CardEffect[] = [];
  protected battleEffects: CardEffect[] = [];

  enter?(): void;

  abstract next(): Phase;

  addPermanentEffect(e: CardEffect) { this.permanentEffects.push(e); }
  addTurnCycleEffect(e: CardEffect) { this.turnCycleEffects.push(e); }
  addEndOfTurnEffect(e: CardEffect) { this.endOfTurnEffects.push(e); }
  addInvasionEffect(e: CardEffect) { this.invasionEffects.push(e); }
  addBattleEffect(e: CardEffect) { this.battleEffects.push(e); }
}

export class PhaseManager {
  currentPhase: Phase;

  constructor() {
    this.currentPhase = new InitPhase();
  }

  getCurrentPhase() {
    return this.currentPhase;
  }

  advanceTo(phase: Phase) {
    this.currentPhase = phase;
    if (phase.enter) phase.enter();
  }

  /** Restore a phase without calling enter() (e.g. returning from invasion) */
  restoreTo(phase: Phase) {
    this.currentPhase = phase;
  }

  transitionPhases() {
    this.advanceTo(this.currentPhase.next());
  }
}

// ─── Pre-game: lobby / waiting for players ────────────────────────────────────

export class InitPhase extends Phase {
  readonly name = "Init";
  readonly gameOngoing = false;
  readonly gameTimeMarker = GameTimeMarker.AnyTime;

  next(): Phase {
    return new SetupPhase();
  }
}

// ─── Setup: draft territories, place capitals, place troops ───────────────────

export class SetupPhase extends Phase {
  readonly name = "Setup";
  readonly gameOngoing = true;
  readonly gameTimeMarker = GameTimeMarker.AnyTime;

  enter() {
    const gm = GameManager.instance;
    console.log("Setting up the game with players:", gm.players.map(p => p.name));
  }

  next(): Phase {
    return new TurnPhase();
  }
}

// ─── Turn phase: the core gameplay loop ───────────────────────────────────────

export enum TurnStep {
  StartOfTurn,
  TurnInTerritoryCards,
  Reinforce,
  BuyCards,
  DeclareInvasions,
  Maneuver,
  TurnInVictoryCards,
  EndOfTurn,
}

const TURN_STEP_TIME_MARKERS: Record<TurnStep, GameTimeMarker> = {
  [TurnStep.StartOfTurn]: GameTimeMarker.StartOfTurn,
  [TurnStep.TurnInTerritoryCards]: GameTimeMarker.TurnInTerritoryCards,
  [TurnStep.Reinforce]: GameTimeMarker.Reinforcements,
  [TurnStep.BuyCards]: GameTimeMarker.BuyMaesterCards,
  [TurnStep.DeclareInvasions]: GameTimeMarker.BeforeDeclaringInvasions,
  [TurnStep.Maneuver]: GameTimeMarker.Maneuver,
  [TurnStep.TurnInVictoryCards]: GameTimeMarker.TurnInVictoryCards,
  [TurnStep.EndOfTurn]: GameTimeMarker.EndOfTurn,
};

export class TurnPhase extends Phase {
  readonly name = "Turn";
  readonly gameOngoing = true;

  private _turnStep: TurnStep = TurnStep.StartOfTurn;

  // Reinforcement tracking
  private troopsToPlace: number = 0;
  private territoryCardBonusTroops: number = 0;

  // Invasion tracking
  private conqueredThisTurn: boolean = false;
  private hasManeuvered: boolean = false;

  get turnStep() { return this._turnStep; }
  get gameTimeMarker() { return TURN_STEP_TIME_MARKERS[this._turnStep]; }

  enter() {
    this._turnStep = TurnStep.StartOfTurn;
    this.conqueredThisTurn = false;
    this.hasManeuvered = false;
    this.territoryCardBonusTroops = 0;

    const gm = GameManager.instance;
    const player = gm.getActivePlayer();

    // Calculate start-of-turn income and troops
    const earnings = player.startOfTurnCount();
    player.earn(earnings.gold);
    this.troopsToPlace = earnings.troops;

    // Apply any permanent effects
    for (const effect of this.permanentEffects) { effect(player); }
    // Apply turn-cycle effects carried over
    for (const effect of this.turnCycleEffects) { effect(player); }

    this._turnStep = TurnStep.TurnInTerritoryCards;
  }

  // ── Turn In Territory Cards ──────────────────────────────────────────────

  turnInTerritoryCards(cards: TerritoryCard[]): number {
    this.guardStep(TurnStep.TurnInTerritoryCards);

    const setValue = territorySetValue(cards);
    if (setValue === -1) {
      throw new Error("Not a valid territory card set!");
    }

    const gm = GameManager.instance;
    const player = gm.getActivePlayer();

    // Remove cards from player hand
    for (const card of cards) {
      player.removeCard(card);
    }

    // Bonus troops for owning a territory that matches a turned-in card
    let bonusTroops = 0;
    for (const card of cards) {
      if (card.territory.getOwner() === player) {
        bonusTroops += 2;
      }
    }

    this.troopsToPlace += setValue;
    this.territoryCardBonusTroops += bonusTroops;

    return setValue + bonusTroops;
  }

  finishTurnInCards() {
    this.guardStep(TurnStep.TurnInTerritoryCards);
    this._turnStep = TurnStep.Reinforce;
  }

  // ── Reinforce ────────────────────────────────────────────────────────────

  getTroopsToPlace(): number {
    return this.troopsToPlace + this.territoryCardBonusTroops;
  }

  placeReinforcements(territory: Territory, count: number) {
    this.guardStep(TurnStep.Reinforce);

    const gm = GameManager.instance;
    const player = gm.getActivePlayer();

    if (territory.getOwner() !== player) {
      throw new Error("Cannot reinforce a territory you don't own!");
    }

    const available = this.troopsToPlace + this.territoryCardBonusTroops;
    if (count > available) {
      throw new Error(`Not enough troops! Have ${available}, tried to place ${count}`);
    }
    if (count <= 0) {
      throw new Error("Must place at least 1 troop");
    }

    territory.placeTroops(count);

    // Deduct from bonus first, then regular
    if (count <= this.territoryCardBonusTroops) {
      this.territoryCardBonusTroops -= count;
    } else {
      const remainder = count - this.territoryCardBonusTroops;
      this.territoryCardBonusTroops = 0;
      this.troopsToPlace -= remainder;
    }
  }

  finishReinforcements() {
    this.guardStep(TurnStep.Reinforce);

    const remaining = this.troopsToPlace + this.territoryCardBonusTroops;
    if (remaining > 0) {
      throw new Error(`Must place all troops before advancing! ${remaining} remaining.`);
    }

    this._turnStep = TurnStep.BuyCards;
  }

  // ── Buy Cards ────────────────────────────────────────────────────────────

  finishBuyingCards() {
    this.guardStep(TurnStep.BuyCards);
    this._turnStep = TurnStep.DeclareInvasions;
  }

  // ── Invasions (Attack) ──────────────────────────────────────────────────

  declareInvasion(from: Territory, target: Territory): InvasionPhase {
    this.guardStep(TurnStep.DeclareInvasions);

    const gm = GameManager.instance;
    const player = gm.getActivePlayer();

    if (from.getOwner() !== player) {
      throw new Error("You don't own the attacking territory!");
    }
    if (!from.canAttack(target)) {
      throw new Error("Cannot attack this territory!");
    }

    return new InvasionPhase(this, from, target);
  }

  recordConquest() {
    this.conqueredThisTurn = true;
  }

  finishInvasions() {
    this.guardStep(TurnStep.DeclareInvasions);
    this._turnStep = TurnStep.Maneuver;
  }

  // ── Maneuver ─────────────────────────────────────────────────────────────

  getHasManeuvered(): boolean { return this.hasManeuvered; }

  maneuver(from: Territory, to: Territory, troops: number) {
    this.guardStep(TurnStep.Maneuver);

    if (this.hasManeuvered) {
      throw new Error("Already maneuvered this turn!");
    }

    const gm = GameManager.instance;
    const player = gm.getActivePlayer();

    if (from.getOwner() !== player) {
      throw new Error("You don't own the source territory!");
    }

    from.maneuver(to, troops);
    this.hasManeuvered = true;
  }

  finishManeuver() {
    this.guardStep(TurnStep.Maneuver);
    this._turnStep = TurnStep.TurnInVictoryCards;
  }

  // ── Turn In Victory Cards ───────────────────────────────────────────────

  finishTurnInVictoryCards() {
    this.guardStep(TurnStep.TurnInVictoryCards);
    this._turnStep = TurnStep.EndOfTurn;
  }

  // ── End of Turn ──────────────────────────────────────────────────────────

  endTurn() {
    this.guardStep(TurnStep.EndOfTurn);

    const gm = GameManager.instance;
    const player = gm.getActivePlayer();

    // Apply end-of-turn effects
    for (const effect of this.endOfTurnEffects) { effect(player); }

    // Award a territory card if player conquered at least one territory
    if (this.conqueredThisTurn) {
      gm.drawTerritoryCard(player);
    }

    // Clear turn-cycle effects (they last one full cycle around the table)
    this.turnCycleEffects = [];
  }

  // Advance to next player's turn
  next(): Phase {
    const gm = GameManager.instance;
    gm.nextTurn();

    const nextTurn = new TurnPhase();
    // Carry over permanent effects
    nextTurn.permanentEffects = [...this.permanentEffects];
    return nextTurn;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private guardStep(expected: TurnStep) {
    if (this._turnStep !== expected) {
      throw new Error(`Wrong turn step! Expected ${TurnStep[expected]}, currently in ${TurnStep[this._turnStep]}`);
    }
  }

  // ── Snapshot support ───────────────────────────────────────────────────

  getSnapshot() {
    return {
      turnStep: this._turnStep,
      troopsToPlace: this.troopsToPlace,
      territoryCardBonusTroops: this.territoryCardBonusTroops,
      conqueredThisTurn: this.conqueredThisTurn,
      hasManeuvered: this.hasManeuvered,
      permanentEffects: [...this.permanentEffects],
      turnCycleEffects: [...this.turnCycleEffects],
      endOfTurnEffects: [...this.endOfTurnEffects],
    };
  }

  restoreSnapshot(snap: ReturnType<TurnPhase['getSnapshot']>) {
    this._turnStep = snap.turnStep;
    this.troopsToPlace = snap.troopsToPlace;
    this.territoryCardBonusTroops = snap.territoryCardBonusTroops;
    this.conqueredThisTurn = snap.conqueredThisTurn;
    this.hasManeuvered = snap.hasManeuvered;
    this.permanentEffects = [...snap.permanentEffects];
    this.turnCycleEffects = [...snap.turnCycleEffects];
    this.endOfTurnEffects = [...snap.endOfTurnEffects];
  }
}

// ─── Invasion phase: resolving a single attack ────────────────────────────────

export class InvasionPhase extends Phase {
  readonly name = "Invasion";
  readonly gameOngoing = true;
  readonly gameTimeMarker = GameTimeMarker.BeforeAnInvasion;

  private parentTurn: TurnPhase;
  readonly attackingTerritory: Territory;
  readonly defendingTerritory: Territory;

  constructor(parentTurn: TurnPhase, from: Territory, target: Territory) {
    super();
    this.parentTurn = parentTurn;
    this.attackingTerritory = from;
    this.defendingTerritory = target;
  }

  getAttacker(): Player {
    return this.attackingTerritory.getOwner();
  }

  getDefender(): Player {
    return this.defendingTerritory.getOwner();
  }

  enter() {
    // Apply any invasion effects
    const attacker = this.getAttacker();
    for (const effect of this.invasionEffects) { effect(attacker); }
  }

  /**
   * Fight a single battle within this invasion.
   * The attacker chooses how many troops to attack with (1-3),
   * the defender chooses how many to defend with (1-2).
   */
  fight(attackingTroops: number, defendingTroops: number): BattleResult {
    const from = this.attackingTerritory;
    const target = this.defendingTerritory;

    // Validate troop counts
    const maxAttackers = Math.min(3, from.getTroops() - 1);
    if (attackingTroops < 1 || attackingTroops > maxAttackers) {
      throw new Error(`Invalid attacker count: ${attackingTroops}. Max: ${maxAttackers}`);
    }

    const maxDefenders = Math.min(2, target.getTroops());
    if (defendingTroops < 1 || defendingTroops > maxDefenders) {
      throw new Error(`Invalid defender count: ${defendingTroops}. Max: ${maxDefenders}`);
    }

    // Gather tokens
    const attackTokens: Token[] = [];
    for (let i = 0; i < from.getKnights(); i++) attackTokens.push(Token.Knight);
    for (let i = 0; i < from.getSiegeEngines(); i++) attackTokens.push(Token.SiegeEngine);

    const defendTokens: Token[] = [];
    for (let i = 0; i < target.getFortifications(); i++) defendTokens.push(Token.Fortification);
    for (let i = 0; i < target.getKnights(); i++) defendTokens.push(Token.Knight);
    for (let i = 0; i < target.getSiegeEngines(); i++) defendTokens.push(Token.SiegeEngine);

    const battle = new BattleResult(attackingTroops, defendingTroops, attackTokens, defendTokens);

    // Apply pre-battle effects
    for (const effect of this.battleEffects) { effect(this.getAttacker()); }

    battle.fight();

    // Resolve the battle on the territories
    target.resolveAttack(from, battle);

    // Check if territory was conquered
    if (target.getOwner() === from.getOwner()) {
      this.parentTurn.recordConquest();
    }

    return battle;
  }

  /**
   * Can the attacker continue attacking this territory?
   */
  canContinue(): boolean {
    return this.attackingTerritory.canAttack(this.defendingTerritory);
  }

  /**
   * Was the territory conquered?
   */
  wasConquered(): boolean {
    return this.defendingTerritory.getOwner() === this.attackingTerritory.getOwner();
  }

  /**
   * Retreat or finish — return to the parent TurnPhase.
   */
  next(): Phase {
    return this.parentTurn;
  }
}
