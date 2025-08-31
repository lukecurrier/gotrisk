export abstract class Phase {
  readonly name: string;
  readonly gameOngoing: boolean;
  //readonly phaseManager: PhaseManager
  
  //goNext(): void { this.phaseManager.signal(this) }
}

class PlaceCapitals extends Phase {
  
}