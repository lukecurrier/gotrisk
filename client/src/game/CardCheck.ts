import { Player } from "./Player";
import { GameManager } from "./GameManager";
import { GameTimeMarker } from "../utils/types";
import { InvasionPhase } from "./GamePhase";

export type CardCheck = (player: Player) => boolean;

// Example checks
export const CardChecks = {
    playerHasEnoughGold: (amount: number): CardCheck =>
        (player) => player.canSpend(amount),

    isPlayerTurn: (): CardCheck =>
        (player) => GameManager.instance.getActivePlayer() === player,

    not: (c: CardCheck): CardCheck =>
        (player) => !c(player),

    isAttackingPlayer: (): CardCheck =>
        (player) => {
            const phase = GameManager.instance.getCurrentPhase();
            return phase instanceof InvasionPhase && phase.getAttacker() === player;
        },

    isDefendingPlayer: (): CardCheck =>
        (player) => {
            const phase = GameManager.instance.getCurrentPhase();
            return phase instanceof InvasionPhase && phase.getDefender() === player;
        },

    isRightGameTime: (timeMarker: GameTimeMarker): CardCheck =>
        (player) => timeMarker == GameTimeMarker.AnyTime || GameManager.instance.getGameTimeMarker() == timeMarker,

    playerOwnsCastles: (count: number): CardCheck =>
        (player) => player.getCastleCount() >= count,

    playerOwnsPorts: (count: number): CardCheck =>
        (player) => player.getPortCount() >= count,

    playerOwnsAllTokens: (): CardCheck =>
        (player) => player.hasAllTokens(),

    playerControlsRegions: (count: number): CardCheck =>
        (player) => GameManager.instance.regions.filter((r) => r.owned(player)).length >= count,

    playerControlsTerritories: (count: number): CardCheck =>
        (player) => player.getTerritoryCount() >= count,
};
