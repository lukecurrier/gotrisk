import { Player } from "./Player";
import { GameManager } from "./GameManager";

export type CardEffect = (player: Player) => void;

// MARK: Card Effects
export const CardEffects = {

    //Todo this file can probably be removed unless we want to save common effects / functions?
    //this funciton is a duplicate
    VictoryPoints: (numPoints): CardEffect => 
        (player) => player.awardVictoryPoints(numPoints),

}

