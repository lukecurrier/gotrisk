import { CardChecks } from "./CardCheck";
import { CharacterCard, GameTimeMarker } from "./Cards";

export const CharacterCards: CharacterCard [] = [ //todo game time markers... see way below at last error
    // Play before you declare any invasions
    // You may make your maneuver at any point during your turn
    new CharacterCard(0, 
        "Ellaria Sand",
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeDeclaringInvasions),
        CardChecks.isPlayerTurn()],
        100,
        (player) => null),

    // Play when you declare an invasion
    // Add 1 to all your attack dice for the duration of the invasion
    new CharacterCard(0, 
        "Robb Stark",
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion),
        CardChecks.isPlayerTurn()],//todo this is how you say this is that players turn
        300,
        (player) => null),

    // Play when you declare an invasion
    // You win all ties for the duration of the invasion
    new CharacterCard(0, 
        "Loras Tyrell",
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion),
        CardChecks.isPlayerTurn()],
        200,
        (player) => null),

    // Play after rolling for a battle when you are the defender
    // Add 1 to all your defense dice for the battle
    new CharacterCard(0, 
        "Tywin Lannister",
        [CardChecks.isRightGameTime(GameTimeMarker.AfterRollingDiceForABattle), // todo and you are on defense in battle
        CardChecks.not(CardChecks.isPlayerTurn())],
        200,
        (player) => null),

    // Play after rolling for a battle when you are the attacker
    // Change any one attack die to its highest value
    new CharacterCard(0, 
        "Jaime Lannister",
        [CardChecks.isRightGameTime(GameTimeMarker.AfterRollingDiceForABattle),
        CardChecks.isPlayerTurn()],
        200,
        (player) => null),

    // Play when an opponent declares an invasion against you
    // Add 1 to all defense dice for the duration of the invasion
    new CharacterCard(0, 
        "Stannis Baratheon",
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion),
        CardChecks.not(CardChecks.isPlayerTurn())],
        300,
        (player) => null),

    // Play when you declare an invasion against a territory with a port
    // Add 1 to all attack dice for the duration of the invasion
    new CharacterCard(0, 
        "Davos Seaworth",
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion), //todo against port
            CardChecks.isPlayerTurn()],
        200,
        (player) => null),

    // Play after rolling for a battle when you are the defender
    // Change any one defense die to its highest value
    new CharacterCard(0, 
        "Ned Stark",
        [CardChecks.isRightGameTime(GameTimeMarker.AfterRollingDiceForABattle),
            CardChecks.not(CardChecks.isPlayerTurn())],
        200,
        (player) => null),

    // Play if you conquered three or more territories this turn
    // You may draw an extra territory card
    new CharacterCard(0, 
        "Cersei Lannister",
        [CardChecks.isRightGameTime(GameTimeMarker.GetTerritoryCards),
            CardChecks.isPlayerTurn()],
        300,
        (player) => null),

    // Play when you declare an invasion
    // You may replace one six-sided die with an eight-sided die for the duration of the invasion
    new CharacterCard(0, 
        "Oberyn Martell",
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion),
            CardChecks.isPlayerTurn()],
        200,
        (player) => null),

    // Play at the start of your maneuver phase
    // You may make one extra maneuver this turn
    new CharacterCard(0, 
        "Jon Snow",
        [CardChecks.isRightGameTime(GameTimeMarker.Maneuver),
            CardChecks.isPlayerTurn()],
        100,
        (player) => null),

    // Play when an opponent declares an invasion against you
    // You may replace all 6 sided dice with eight-sided dice for the duration of the invasion
    new CharacterCard(0, 
        "Brienne",
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion), //todo you are defender
            CardChecks.not(CardChecks.isPlayerTurn())],
        300,
        (player) => null),

    // Play when you draw a territory card
    // You may look at the top two cards; choose one to keep and discard the other
    new CharacterCard(0, 
        "Xaro Xhoan Daxos",
        [CardChecks.isRightGameTime(GameTimeMarker.GetTerritoryCards),
            CardChecks.isPlayerTurn()],
        100,
        (player) => null),

    // Play after rolling dice for a battle
    // You may force an opponent to re-roll one die of your choice once for the battle
    new CharacterCard(0, 
        "Margaery Tyrell",
        [CardChecks.isRightGameTime(GameTimeMarker.AfterRollingDiceForABattle)], //todo you are attacker or defender
        100,
        (player) => null),

    // Play if you conquered two or more territories with a castle or port this turn
    // You may draw an extra territory card
    new CharacterCard(0, 
        "Jorah Mormont",
        [CardChecks.isRightGameTime(GameTimeMarker.GetTerritoryCards),
            CardChecks.isPlayerTurn()],
        200,
        (player) => null),

    // Play when you deploy reinforcements
    // You may deploy an extra army to a territory with a castle
    new CharacterCard(0, 
        "Renly Baratheon",
        [CardChecks.isRightGameTime(GameTimeMarker.Reinforcements),
            CardChecks.isPlayerTurn()],
        200,
        (player) => null),

    // Play when you declare an invasion
    // You may replace all six-sided dice with eight-sided dice for the duration of the invasion
    new CharacterCard(0, 
        "Daenerys Targaryen",
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion),
            CardChecks.isPlayerTurn()],
        300,
        (player) => null),

    // Play at the start of any invasion
    // You may re-roll all 1s once for the duration of the invasion
    new CharacterCard(0, 
        "Grey Worm",
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion)],
        200,
        (player) => null),

    // Play at the end of your turn if you did not conquer any territories
    // You may draw a territory card this turn
    new CharacterCard(0, 
        "Doran Martell",
        [CardChecks.isRightGameTime(GameTimeMarker.GetTerritoryCards),
            CardChecks.isPlayerTurn()],
        300,
        (player) => null),

    // Play when an opponent declares an invasion against you
    // You may replace one six-sided die for the duration of the invasion
    new CharacterCard(0, 
        "Hizdar Zo Loraq",
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion),
            CardChecks.not(CardChecks.isPlayerTurn())],
        200,
        (player) => null), //todo maybe these are just another check rather than a field

    // Play when you declare an invasion
    // Add one to your highest attack die for the duration of the invasion
    new CharacterCard(0, 
        "Kraznys Mo Nakloz",
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion),
            CardChecks.isPlayerTurn()],
        200,
        (player) => null),

    // Play after rolling dice for a battle
    // Add one to all your dice for this battle
    new CharacterCard(0, 
        "Pyat Pree",
        [CardChecks.isRightGameTime(GameTimeMarker.AfterRollingDiceForABattle)], //todo you are attacker or defender
        300,
        (player) => null),

    // Play when an opponent declares an invasion against a territory you control with only one army
    // Add one army to that defending territory
    new CharacterCard(0, 
        "Catelyn Stark",
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion),
            CardChecks.not(CardChecks.isPlayerTurn())],
        200,
        (player) => null),

    // Play after rolling for a battle when you are the defender
    // You may re-roll any defense dice one for the battle
    new CharacterCard(0, 
        "Barristan Selmy", 
        [CardChecks.isRightGameTime(GameTimeMarker.AfterRollingDiceForABattle),
            CardChecks.not(CardChecks.isPlayerTurn())],
        100,
        (player) => null),

    // Play when you buy a maester card
    // You may look at the top two cards; choose one to keep and discard the other
    new CharacterCard(0, 
        "Tyrion Lannister",
        [CardChecks.isRightGameTime(GameTimeMarker.BuyMaesterCards),
            CardChecks.isPlayerTurn()],
        100,
        (player) => null),

    // Play when an opponent declares an invasion against a territory you control with a castle or port
    // Add 1 to your highest defense die for the duration of the invasion
    new CharacterCard(0, 
        "Aero Hotah",
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion),
            //todo add these description strings inside the card objects so they can be shown
            CardChecks.not(CardChecks.isPlayerTurn())],
        200,
        (player) => null),

    // Play before you declare any invasions
    // Force an opponent to discard a maester card at random
    new CharacterCard(0, 
        "Melisandre",
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeDeclaringInvasions),
            CardChecks.isPlayerTurn()],
        200,
        (player) => null),

    // Play before you declare any invasions
    // The first time you conquer a territory from an opponent this turn you steal 100 gold from them
    new CharacterCard(0, 
        "Sallador Saan",
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeDeclaringInvasions),
            CardChecks.isPlayerTurn()],
        100,
        (player) => null),
];