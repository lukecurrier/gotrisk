import { GameTimeMarker } from "../utils/types";
import { CardChecks } from "./CardCheck";
import { PlayableCard, CardType } from "./Cards";

export const MaesterCards: PlayableCard[] = [
    new PlayableCard(
        "Pirate Ship Fleet",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeDeclaringInvasions),
            CardChecks.isPlayerTurn()],
        100,
        (player) => null),

    new PlayableCard(
        "Desperate Ambush",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeABattle)],
        200,
        (player) => null),

    new PlayableCard(
        "Lead Into A Trap",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeABattle)],
        300,
        (player) => null),

    new PlayableCard(
        "Preparing For War",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.AnyTime)],
        200,
        (player) => null),

    new PlayableCard(
        "Reinforce Bulwarks",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.AnyTime)],
        100,
        (player) => null),

    new PlayableCard(
        "Spider's Sabotage",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.OpponentPlaysAMaesterCard)],
        200,
        (player) => null),

    new PlayableCard(
        "Bribery",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion)],
        200,
        (player) => null),

    new PlayableCard(
        "A Sworn Sword",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.AnyTime)],
        100,
        (player) => null),

    new PlayableCard(
        "Strength Of Steel",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion)],
        100,
        (player) => null),

    new PlayableCard(
        "Castle Walls",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion)],
        100,
        (player) => null),

    new PlayableCard(
        "Weapons of War",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.AnyTime)],
        100,
        (player) => null),

    new PlayableCard(
        "Sickness in the Ranks",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeDeclaringInvasions)],
        300,
        (player) => null),

    new PlayableCard(
        "Mass Desertion",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeDeclaringInvasions)],
        200,
        (player) => null),

    new PlayableCard(
        "A Web of Lies",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeDeclaringInvasions)],
        300,
        (player) => null),

    new PlayableCard(
        "Taken Captive",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion)],
        200,
        (player) => null),

    new PlayableCard(
        "Valryian Steel",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.AfterRollingDiceForAnyReason)],
        100,
        (player) => null),

    new PlayableCard(
        "Shifting Alliance",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeABattle)],
        400,
        (player) => null),

    new PlayableCard(
        "Establish the High Ground",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion)],
        200,
        (player) => null),

    new PlayableCard(
        "Confusion in the Ranks",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeDeclaringInvasions)],
        300,
        (player) => null),

    new PlayableCard(
        "Mourning the Fallen",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.StartOfTurn)],
        300,
        (player) => null),

    new PlayableCard(
        "Winter is Coming",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeDeclaringInvasions)],
        300,
        (player) => null),

    new PlayableCard(
        "Cut Off Supply Lines",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeDeclaringInvasions)],
        300,
        (player) => null),

    new PlayableCard(
        "Fortified Ports",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion)],
        100,
        (player) => null),

    new PlayableCard(
        "Hired Thieves",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.StartOfTurn)],
        200,
        (player) => null),

    new PlayableCard(
        "Best Laid Plans",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.StartOfTurn)],
        200,
        (player) => null),

    new PlayableCard(
        "Unplanned Losses",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion)],
        300,
        (player) => null),

    new PlayableCard(
        "A Call to Arms",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion)],
        300,
        (player) => null),

    new PlayableCard(
        "Raid the Countryside",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion)],
        100,
        (player) => null),

    new PlayableCard(
        "Valar Morghulis",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeDeclaringInvasions)],
        500,
        (player) => null),

    new PlayableCard(
        "Rally The Smallfolk",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeDeclaringInvasions)],
        300,
        (player) => null),

    new PlayableCard(
        "Wed for Peace",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion)],
        400,
        (player) => null),

    new PlayableCard(
        "Stragetic Withdrawl",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion)],
        100,
        (player) => null),

    new PlayableCard(
        "A Temporary Truce",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeAnInvasion)],
        200,
        (player) => null),

    new PlayableCard(
        "Freefolk Uprising",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.StartOfTurn)],
        300,
        (player) => null),

    new PlayableCard(
        "Blood Magic",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.BeforeDeclaringInvasions)],
        200,
        (player) => null),

    new PlayableCard(
        "Call in Your Banners",
        CardType.Maester,
        [CardChecks.isRightGameTime(GameTimeMarker.Reinforcements)],
        300,
        (player) => null),
];
