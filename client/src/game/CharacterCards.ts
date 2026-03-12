import { GameTimeMarker } from "../utils/types";
import { CardChecks } from "./CardCheck";
import { PlayableCard, CardType } from "./Cards";

export const CharacterCards: PlayableCard[] = [
    new PlayableCard(
        "Ellaria Sand",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeDeclaringInvasions),
        CardChecks.isPlayerTurn()],
        100,
        (player) => null),

    new PlayableCard(
        "Robb Stark",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion),
        CardChecks.isPlayerTurn()],
        300,
        (player) => null),

    new PlayableCard(
        "Loras Tyrell",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion),
        CardChecks.isPlayerTurn()],
        200,
        (player) => null),

    new PlayableCard(
        "Tywin Lannister",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.AfterRollingDiceForABattle),
        CardChecks.not(CardChecks.isPlayerTurn())],
        200,
        (player) => null),

    new PlayableCard(
        "Jaime Lannister",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.AfterRollingDiceForABattle),
        CardChecks.isPlayerTurn()],
        200,
        (player) => null),

    new PlayableCard(
        "Stannis Baratheon",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion),
        CardChecks.not(CardChecks.isPlayerTurn())],
        300,
        (player) => null),

    new PlayableCard(
        "Davos Seaworth",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion),
            CardChecks.isPlayerTurn()],
        200,
        (player) => null),

    new PlayableCard(
        "Ned Stark",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.AfterRollingDiceForABattle),
            CardChecks.not(CardChecks.isPlayerTurn())],
        200,
        (player) => null),

    new PlayableCard(
        "Cersei Lannister",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.GetTerritoryCards),
            CardChecks.isPlayerTurn()],
        300,
        (player) => null),

    new PlayableCard(
        "Oberyn Martell",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion),
            CardChecks.isPlayerTurn()],
        200,
        (player) => null),

    new PlayableCard(
        "Jon Snow",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.Maneuver),
            CardChecks.isPlayerTurn()],
        100,
        (player) => null),

    new PlayableCard(
        "Brienne",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion),
            CardChecks.not(CardChecks.isPlayerTurn())],
        300,
        (player) => null),

    new PlayableCard(
        "Xaro Xhoan Daxos",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.GetTerritoryCards),
            CardChecks.isPlayerTurn()],
        100,
        (player) => null),

    new PlayableCard(
        "Margaery Tyrell",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.AfterRollingDiceForABattle)],
        100,
        (player) => null),

    new PlayableCard(
        "Jorah Mormont",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.GetTerritoryCards),
            CardChecks.isPlayerTurn()],
        200,
        (player) => null),

    new PlayableCard(
        "Renly Baratheon",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.Reinforcements),
            CardChecks.isPlayerTurn()],
        200,
        (player) => null),

    new PlayableCard(
        "Daenerys Targaryen",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion),
            CardChecks.isPlayerTurn()],
        300,
        (player) => null),

    new PlayableCard(
        "Grey Worm",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion)],
        200,
        (player) => null),

    new PlayableCard(
        "Doran Martell",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.GetTerritoryCards),
            CardChecks.isPlayerTurn()],
        300,
        (player) => null),

    new PlayableCard(
        "Hizdar Zo Loraq",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion),
            CardChecks.not(CardChecks.isPlayerTurn())],
        200,
        (player) => null),

    new PlayableCard(
        "Kraznys Mo Nakloz",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion),
            CardChecks.isPlayerTurn()],
        200,
        (player) => null),

    new PlayableCard(
        "Pyat Pree",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.AfterRollingDiceForABattle)],
        300,
        (player) => null),

    new PlayableCard(
        "Catelyn Stark",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion),
            CardChecks.not(CardChecks.isPlayerTurn())],
        200,
        (player) => null),

    new PlayableCard(
        "Barristan Selmy",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.AfterRollingDiceForABattle),
            CardChecks.not(CardChecks.isPlayerTurn())],
        100,
        (player) => null),

    new PlayableCard(
        "Tyrion Lannister",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.BuyMaesterCards),
            CardChecks.isPlayerTurn()],
        100,
        (player) => null),

    new PlayableCard(
        "Aero Hotah",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion),
            CardChecks.not(CardChecks.isPlayerTurn())],
        200,
        (player) => null),

    new PlayableCard(
        "Melisandre",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeDeclaringInvasions),
            CardChecks.isPlayerTurn()],
        200,
        (player) => null),

    new PlayableCard(
        "Sallador Saan",
        CardType.Character,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeDeclaringInvasions),
            CardChecks.isPlayerTurn()],
        100,
        (player) => null),
];
