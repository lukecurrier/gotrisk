import { CardEffect, CardEffects } from "./CardEffect";
import { GameManager } from "./GameManager";
import { Player } from "./Player";

export abstract class Phase {
  /*
  A phase is an object which holds values which may need to be referenced by the game.

  Phases are meant to act as the primary source of communication between the client and the backend. 
  */
  abstract readonly name: string;
  abstract readonly gameOngoing: boolean;

  //protected players: Player[];

  protected permanentEffects: CardEffect[] | undefined;
  protected turnCycleEffects: CardEffect[] | undefined;
  protected endOfTurnEffects: CardEffect[] | undefined;
  protected combatEffects: CardEffect[] | undefined;
  protected invasionEffects: CardEffect[] | undefined;
  protected battleEffects: CardEffect[] | undefined;

  enter?(): void;

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

  //not sure if players are stored in phase... should be in game manager
  // we add players in lobby and add them to game manager from there
  // Phases start once lobby is assembled and game settings (map etc) chosen?
  /*addPlayer(p: Player) {
    this.players.push(p);
  }

  getPlayers() {
    return this.players;
  }*/
}

export class PhaseManager {
  currentPhase: Phase;

  constructor(players: Player[]) {
    this.currentPhase = new InitPhase();
  }

  getCurrentPhase() {
    return this.currentPhase;
  }

  transitionPhases() {
    // prompt player responses
    this.currentPhase = this.currentPhase.next();
    // now that we're in a new phase, prompt again
  }
}

// This phase comprises the setup - players getting into the lobby, etc. 
// Once all players have been added and the Start Game button is pressed with everyone readied up, the game starts
export class InitPhase extends Phase {
  readonly name = "Init"
  readonly gameOngoing = false;

  next(): Phase {
    //return new SetupPhase(this.getPlayers()); 
    return new SetupPhase(); 
  }
}

/* This phase is for players to: 
  - Pick player order (should this be lobby?)
  - Assign/draft house or characters
  - Assign/draft territories
  - Place capitols
  - Place troops
  - Give turn order handicaps
*/
export class SetupPhase extends Phase {
  readonly name = "Setup";
  readonly gameOngoing = true;

  /*constructor(players: Player[]) {
    super();
    for (const player of players) {
      this.addPlayer(player);
    }
  }*/

  constructor() {
    super();
  }

  enter() {
    
    console.log("Setting up the game with players:", GameManager.instance.players.map(p=> p.name));
    //console.log("Setting up the game with players:", this.players.map(p => p.name));
  }

  next(): Phase {
    return new TurnPhase("aaa", false);//todo fix
  }
}

export class TurnPhase extends Phase { //todo need to know whose turn it is in the phase, player object?
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

export class InvasionPhase extends Phase {
  readonly name = "Setup";
  readonly gameOngoing = true;
  private attacker: Player;
  private defender: Player;

  constructor(attacker: Player, defender: Player) { //todo this should probably be attacking to defending territory...
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
    return new InitPhase(); 
  }

}

