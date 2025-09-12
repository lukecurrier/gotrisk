import { Player } from "./Player";
import { GameManager } from "./GameManager";

export type CardCheck = (gameManager: GameManager, player: Player) => boolean;

// Example checks
export const CardChecks = {
    playerHasEnoughGold: (amount: number): CardCheck => 
        (gameManager, player) => player.canSpend(amount),

    isPlayerTurn: (): CardCheck =>
        (gameManager, player) => gameManager.getActivePlayer() === player,

    //isGamePhase: (phase: GamePhase): CardCheck => //This should just compare phase types right?
    //    (gameManager, player) => gameManager.getPhaseManager().currentPhase === phase,

    playerOwnsCastles: (count: number): CardCheck =>
        (gameManager, player) => player.getCastleCount() >= count,

    playerOwnsPorts: (count: number): CardCheck =>
        (gameManager, player) => player.getPortCount() >= count,

    //playerConqueredTerritoriesThisTurn: (count: number): CardCheck =>
    //    (player, game) => game.turnLog.conqueredBy(player).length >= count,

    // playerConqueredTerritoriesFromPlayerThisTurn: (count: number): CardCheck =>
    //     (player, game) => game.turnLog.conqueredFrom(player).length >= count,

    // playerDestroyedArmiesThisTurn: (count: number): CardCheck =>
    //     (player, game) => game.turnLog.destroyedArmiesBy(player) >= count,

    // playerOwnsPortOnAllCoasts: (): CardCheck =>
    //     (player, _game) => player.portsOnAllCoasts(),

    playerOwnsAllTokens: (): CardCheck =>
        (gameManager, player) => player.hasAllTokens(),

    playerControlsRegions: (count: number): CardCheck =>
        (gameManager, player) => gameManager.regions.filter((r, index, list) => r.owned(player)).length >= count,

    playerControlsTerritories: (count: number): CardCheck =>
        (gameManager, player) => player.getTerritoryCount() >= count,

    // playerControlsTerritoriesInDifferentRegions: (counts: number[]): CardCheck =>
    //     (player, _game) => {
    //         const regions = player.getControlledTerritoriesByRegion();
    //         return counts.every((needed, i) => (regions[i] ?? 0) >= needed);
    //     }
};
