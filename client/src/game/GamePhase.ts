import { CardEffect, CardEffects } from "./CardEffect";
import { Player } from "./Player";

export abstract class Phase {
  /*
  A phase is an object which holds values which may need to be referenced by the game.

  Phases are meant to act as the primary source of communication between the client and the backend. 
  */
  abstract readonly name: string;
  abstract readonly gameOngoing: boolean;
  protected permanentEffects: CardEffect[] | undefined;
  protected turnCycleEffects: CardEffect[] | undefined;
  protected endOfTurnEffects: CardEffect[] | undefined;
  protected invasionEffects: CardEffect[] | undefined;
  protected battleEffects: CardEffect[] | undefined;


  enter?(): void;
  exit?(): void;

  abstract next(): Phase;

  addPermanentEffect(e: CardEffect) {
    if (this.permanentEffects === null || this.permanentEffects === undefined) {
      this.permanentEffects = [];
    }
    this.permanentEffects.push(e);
  }

  addTurnCycleEffect(e: CardEffect) {
    if (this.turnCycleEffects === null || this.turnCycleEffects === undefined) {
      this.turnCycleEffects = [];
    }
    this.turnCycleEffects.push(e);
  }

  addEndOfTurnEffect(e: CardEffect) {
    if (this.endOfTurnEffects === null || this.endOfTurnEffects === undefined) {
      this.endOfTurnEffects = [];
    }
    this.endOfTurnEffects.push(e);
  }

  addInvasionEffect(e: CardEffect) {
    if (this.invasionEffects === null || this.invasionEffects === undefined) {
      this.invasionEffects = [];
    }
    this.invasionEffects.push(e);
  }

  addBattleEffect(e: CardEffect) {
    if (this.battleEffects === null || this.battleEffects === undefined) {
      this.battleEffects = [];
    }
    this.battleEffects.push(e);
  }
}

export class PhaseManager {
  playerAcks: Record<string, boolean>;
  currentPhase: Phase;

  constructor(players: Player[]) {
    this.currentPhase = new InitPhase("Init", true);
    this.playerAcks = Object.fromEntries(players.map(p => [p.id, false]));
  }

  getCurrentPhase() {
    return this.currentPhase;
  }

  acknowledge(player: Player) {
    this.playerAcks[player.id] = true;

    if (Object.values(this.playerAcks).every(v => v)) {
      this.transitionPhases();
    }
  }

  needsAction(player:Player) {
    this.playerAcks[player.id] = false;
  }

  transitionPhases() {
    this.currentPhase = this.currentPhase.next();

    for (const id in this.playerAcks) {
      this.playerAcks[id] = false;
    }
  }
}


export class InitPhase extends Phase {
  name: string;
  gameOngoing: boolean;

  constructor(name: string, gameOngoing: boolean) {
    super();
    this.name = name;
    this.gameOngoing = gameOngoing;
  }

  next(): Phase {
    throw new Error("Method not implemented.");
  }
  
}

export class SetupPhase extends Phase {
  readonly name = "Setup";
  readonly gameOngoing = true;

  constructor(private players: Player[]) {
    super();
  }

  enter() {
    console.log("Setting up the game with players:", this.players.map(p => p.name));
  }

  next(): Phase {
    return new SetupPhase(this.players); // TODO: This is self referential lol add the rest of em
  }
}

export class InvasionPhase extends Phase {
  readonly name = "Setup";
  readonly gameOngoing = true;
  private attacker: Player;
  private defender: Player;

  constructor(attacker: Player, defender: Player) {
    super();
    this.attacker = attacker;
    this.defender = defender;
  }

  getAttacker() {
    return this.attacker;
  }

  getDefender() {
    return this.defender;
  }

  enter() {
    console.log("Invasion phase");
  }

  next(): Phase {
    return new InitPhase("aaa", false); // TODO: fixnthis placeholder
  }

}

