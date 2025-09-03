import { Player } from "./Player";

export abstract class Phase {
  /*
  A phase is an object which holds values which may need to be referenced by the game.

  Phases are meant to act as the primary source of communication between the client and the backend. 
  */
  abstract readonly name: string;
  abstract readonly gameOngoing: boolean;

  enter?(): void;
  exit?(): void;

  abstract next(): Phase;
}

export class PhaseManager {
  playerAcks: Record<string, boolean>;
  currentPhase: Phase;

  constructor(players: Player[]) {
    this.currentPhase = new InitPhase();
    this.playerAcks = Object.fromEntries(players.map(p => [p.id, false]));
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

