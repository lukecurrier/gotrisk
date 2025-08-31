import { Player } from "./Player";
import { GameManager } from "./GameManager";

export type CardCheck = (player: Player) => boolean;

// Example checks
export const CardChecks = {
    playerHasEnoughGold: (amount: number): CardCheck => 
        (player) => player.canSpend(amount),

    // isPlayerTurn: (): CardCheck =>
    //     (player, game) => game.currentPlayer === player,

    // isGamePhase: (phase: GamePhase): CardCheck =>
    //     (_player, game) => game.phase === phase,

    // playerOwnsCastles: (count: number): CardCheck =>
    //     (player, _game) => player.getCastles().length >= count,

    // playerOwnsPorts: (count: number): CardCheck =>
    //     (player, _game) => player.getPorts().length >= count,

    // playerConqueredTerritoriesThisTurn: (count: number): CardCheck =>
    //     (player, game) => game.turnLog.conqueredBy(player).length >= count,

    // playerConqueredTerritoriesFromPlayerThisTurn: (count: number): CardCheck =>
    //     (player, game) => game.turnLog.conqueredFrom(player).length >= count,

    // playerDestroyedArmiesThisTurn: (count: number): CardCheck =>
    //     (player, game) => game.turnLog.destroyedArmiesBy(player) >= count,

    // playerOwnsPortOnAllCoasts: (): CardCheck =>
    //     (player, _game) => player.portsOnAllCoasts(),

    // playerOwnsAllTokens: (): CardCheck =>
    //     (player, _game) => player.hasAllTokens(),

    // playerControlsRegions: (count: number): CardCheck =>
    //     (player, _game) => player.getControlledRegions().length >= count,

    // playerControlsTerritories: (count: number): CardCheck =>
    //     (player, _game) => player.getControlledTerritories().length >= count,

    // playerControlsTerritoriesInDifferentRegions: (counts: number[]): CardCheck =>
    //     (player, _game) => {
    //         const regions = player.getControlledTerritoriesByRegion();
    //         return counts.every((needed, i) => (regions[i] ?? 0) >= needed);
    //     }
};
