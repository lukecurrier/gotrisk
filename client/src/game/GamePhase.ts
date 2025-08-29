
// I want to have an easily-queryable and lightweight struct here that holds the gamephase. 
// For example, if we're in the middle of a game and somene is doing their attack phase, the State would be {3.6.0} (or somethin)

export enum Phase {
  PreGame = 0,
  Lobby = 1,
  Opening = 2,
  Turns = 3,
  Wrapup = 4,
}
enum PreGameSub {

}

enum LobbySub {

}

enum OpeningSub {

}

enum TurnSub {
  Start = 0,
}

enum Sub {
  None = 0,
}