// Pure type/enum definitions. No imports from game logic — this prevents circular deps.

export type Port = 0 | 1 | 2 | 3

export enum Token {
    Fortification,
    Knight,
    SiegeEngine,
}

export enum GameTimeMarker {
    AnyTime,
    OpponentPlaysAMaesterCard,
    StartOfTurn,
    TurnInTerritoryCards,
    Reinforcements,
    BeforeBuyingCards,
    GetTerritoryCards,
    BuyMaesterCards,
    BeforeDeclaringInvasions,
    BeforeAnInvasion,
    BeforeABattle,
    AfterRollingDiceForAnyReason,
    AfterRollingDiceForABattle,
    Maneuver,
    TurnInVictoryCards,
    EndOfTurn
}
