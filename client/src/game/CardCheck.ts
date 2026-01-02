import { Player } from "./Player";
import { GameManager } from "./GameManager";
import { GameTimeMarker } from "../utils/Utils";

export type CardCheck = (player: Player) => boolean;

// Example checks
export const CardChecks = {
    playerHasEnoughGold: (amount: number): CardCheck => 
        (player) => player.canSpend(amount),

    isPlayerTurn: (): CardCheck =>
        (player) => GameManager.instance.getActivePlayer() === player,

    not: (c: CardCheck): CardCheck => 
        (player) => !c(player),

    isAttackingPlayer: (): CardCheck => //todo find a way to check phase type and then attack / defend
        (player) => GameManager.instance.getPhaseManager().getCurrentPhase().name == "Invasion", //or battle etc?
        //then cast to invasion or batle phase and get the attacker and compare

    //isGamePhase: (phase: GamePhase): CardCheck => //This should just compare phase types right?
    //    (player) => gameManager.getPhaseManager().currentPhase === phase,
    isRightGameTime: (timeMarker: GameTimeMarker): CardCheck =>
        (player) => timeMarker == GameTimeMarker.AnyTime || GameManager.instance.getGameTimeMarker() == timeMarker,

    playerOwnsCastles: (count: number): CardCheck =>
        (player) => player.getCastleCount() >= count,

    playerOwnsPorts: (count: number): CardCheck =>
        (player) => player.getPortCount() >= count,

    //playerConqueredTerritoriesThisTurn: (count: number): CardCheck =>
    //    (player) => game.turnLog.conqueredBy(player).length >= count,

    // playerConqueredTerritoriesFromPlayerThisTurn: (count: number): CardCheck =>
    //     (player) => game.turnLog.conqueredFrom(player).length >= count,

    // playerDestroyedArmiesThisTurn: (count: number): CardCheck =>
    //     (player) => game.turnLog.destroyedArmiesBy(player) >= count,

    // playerOwnsPortOnAllCoasts: (): CardCheck =>
    //     (player) => player.portsOnAllCoasts(),

    playerOwnsAllTokens: (): CardCheck =>
        (player) => player.hasAllTokens(),

    playerControlsRegions: (count: number): CardCheck =>
        (player) => GameManager.instance.regions.filter((r, index, list) => r.owned(player)).length >= count,

    playerControlsTerritories: (count: number): CardCheck =>
        (player) => player.getTerritoryCount() >= count,

    // playerControlsTerritoriesInDifferentRegions: (counts: number[]): CardCheck =>
    //     (player, _game) => {
    //         const regions = player.getControlledTerritoriesByRegion();
    //         return counts.every((needed, i) => (regions[i] ?? 0) >= needed);
    //     }
};
