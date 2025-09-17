import { Player } from "./Player";
import { GameManager } from "./GameManager";

export type CardEffect = (player: Player) => void;

// MARK: Character Card Effects
export const CharacterCardEffects = new Map<string, CardEffect>([

    // Play before you declare any invasions
    // You may make your maneuver at any point during your turn
    ["Ellaria Sand", (player) => null],


    // Play when you declare an invasion
    // Add 1 to all your attack dice for the duration of the invasion
    ["Robb Stark", (player) => null],

    // Play when you declare an invasion
    // You win all ties for the duration of the invasion
    ["Loras Tyrell", (player) => null],

    // Play after rolling for a battle when you are the defender
    // Add 1 to all your defense dice for the battle
    ["Tywin Lannister", (player) => null],

    // Play after rolling for a battle when you are the attacker
    // Change any one attack die to its highest value
    ["Jaime Lannister", (player) => null],

    // Play when an opponent declares an invasion against you
    // Add 1 to all defense dice for the duration of the invasion
    ["Stannis Baratheon", (player) => null],

    // Play when you declare an invasion against a territory with a port
    // Add 1 to all attack dice for the duration of the invasion
    ["Davos Seaworth", (player) => null],

    // Play after rolling for a battle when you are the defender
    // Change any one defense die to its highest value
    ["Ned Stark", (player) => null],

    // Play if you conquered three or more territories this turn
    // You may draw an extra territory card
    ["Cersei Lannister", (player) => null],

    // Play when you declare an invasion
    // You may replace one six-sided die with an eight-sided die for the duration of the invasion
    ["Oberyn Martell", (player) => null],

    // Play at the start of your maneuver phase
    // You may make one extra maneuver this turn
    ["Jon Snow", (player) => null],

    // Play when an opponent declares an invasion against you
    // You may replace all 6 sided dice with eight-sided dice for the duration of the invasion
    ["Brienne", (player) => null],

    // Play when you draw a territory card
    // You may look at the top two cards; choose one to keep and discard the other
    ["Xaro Xhoan Daxos", (player) => null],

    // Play after rolling dice for a battle
    // You may force an opponent to re-roll one die of your choice once for the battle
    ["Margaery Tyrell", (player) => null],

    // Play if you conquered two or more territories with a castle or port this turn
    // You may draw an extra territory card
    ["Jorah Mormont", (player) => null],

    // Play when you deploy reinforcements
    // You may deploy an extra army to a territory with a castle
    ["Renly Baratheon", (player) => null],

    // Play when you declare an invasion
    // You may replace all six-sided dice with eight-sided dice for the duration of the invasion
    ["Daenerys Targaryen", (player) => null],

    // Play at the start of any invasion
    // You may re-roll all 1s once for the duration of the invasion
    ["Grey Worm", (player) => null],

    // Play at the end of your turn if you did not conquer any territories
    // You may draw a territory card this turn
    ["Doran Martell", (player) => null],

    // Play when an opponent declares an invasion against you
    // You may replace one six-sided die for the duration of the invasion
    ["Hizdar Zo Loraq", (player) => null],

    // Play when you declare an invasion
    // Add one to your highest attack die for the duration of the invasion
    ["Kraznys Mo Nakloz", (player) => null],

    // Play after rolling dice for a battle
    // Add one to all your dice for this battle
    ["Pyat Pree", (player) => null],

    // Play when an opponent declares an invasion against a territory you control with only one army
    // Add one army to that defending territory
    ["Catelyn Stark", (player) => null],

    // Play after rolling for a battle when you are the defender
    // You may re-roll any defense dice one for the battle
    ["Barristan Selmy", (player) => null],

    // Play when you buy a maester card
    // You may look at the top two cards; choose one to keep and discard the other
    ["Tyrion Lannister", (player) => null],

    // Play when an opponent declares an invasion against a territory you control with a castle or port
    // Add 1 to your highest defense die for the duration of the invasion
    ["Aero Hotah", (player) => null],

    // Play before you declare any invasions
    // Force an opponent to discard a maester card at random
    ["Melisandre", (player) => null],

    // Play before you declare any invasions
    // The first time you conquer a territory from an opponent this turn you steal 100 gold from them
    ["Sallador Saan", (player) => null],
]);



// MARK: Maester Card Effects TODO change to map
export const MaesterCardEffects = {
    
    // Play before you declare invasions for a turn
    // You may declare invasions from territories you control with a port against any territories with a coastline border this turn
    PirateShipFleet: (): CardEffect =>
        (player) => null,
    
    // Play after an opponent commits attacking armies against you
    // Roll a d6, destroy floor((rollResult + 1) / 2) attacking armies
    DesperateAmbush: (): CardEffect =>
        (player) => null,
    
    // Play after an opponent attacking armies to a battle against you
    // All attacking armies are destroyed
    LeadIntoATrap: (): CardEffect =>
        (player) => null,
    
    // Play at any time
    // Place three armies, one each in up to three different territories you control 
    PreparingForWar: (): CardEffect =>
        (player) => null,
    
    // Play at any time
    // Add a Fortification to a territory you control
    ReinforceBulwarks: (): CardEffect =>
        (player) => null,
    
    // Play when an opponent plays a Maester Card
    // Cancel that card's effect
    SpidersSabotage: (): CardEffect =>
        (player) => null,
    
    // Play when an opponent declares an invasion on a territory you control
    // Give that player 200 gold and that territory cannot be invaded this turn
    Bribery: (): CardEffect =>
        (player) => null,
    
    // Play at any time
    // Add a Knight to a territory you control
    ASwornSword: (): CardEffect =>
        (player) => null,
    
    // Play when you declare an invasion
    // Add 1 to your highest die roll for the duration of the invasion
    StrengthOfSteel: (): CardEffect =>
        (player) => null,
    
    // Play when an opponent declares an invasion against a territory you control with a castle
    // Add 1 to your highest defense die for the duration of the invasion
    CastleWalls: (): CardEffect =>
        (player) => null,
    
    // Play at any time
    // Add a Siege Engine to a territory you control
    WeaponsOfWar: (): CardEffect =>
        (player) => null,
    
    // Play before you declare invasions for a turn
    // Draw and discard a territory card. Destroy one army in each territory controlled by an opponent in that territory's region
    SicknessInTheRanks: (): CardEffect =>
        (player) => null,
    
    // Play before you declare invasions for a turn
    // Reveal the top two cards of the territory card deck. Destroy half of the armies in each of those territories, rounded down, if controlled by an opponent
    MassDesertion: (): CardEffect =>
        (player) => null,
    
    // Play before you declare invasions for a turn
    // Draw one maester card at random from an opponent and add it to your hand
    AWebOfLies: (): CardEffect =>
        (player) => null,
    
    // Play before you declare an invasion
    // Choose a character from the defending player's house. If you conquer the territory, you also capture that character.
    // Until that player pays you 500 gold as ransom to return the character, that character's ability cannot be used.
    TakenCaptive: (): CardEffect =>
        (player) => null,
    
    // Play after you roll dice for any reason
    // Change any one dice to its highest value
    ValyrianSteel: (): CardEffect =>
        (player) => null,
    
    // Play after an opponent commits attacking armies to a battle against a territory you control.
    // Destroy up to two attacking armies. Add two armies to teh defending territory.
    ShiftingAlliance: (): CardEffect =>
        (player) => null,
    
    // Play when an opponent declares an invasion on a territory you control
    // Add 1 to all your dice rolls this turn, until that opponent captures the defending territory
    EstablishTheHighGround: (): CardEffect =>
        (player) => null,
    
    // Play before you declare invasions for a turn
    // Each opponent must discard one maester card at random
    ConfusionInTheRanks: (): CardEffect =>
        (player) => null,
    
    // Play at the start of your turn
    // Costs to use character abilities and maester cards are doubled for all opopnents until the start of your next turn
    MourningTheFallen: (): CardEffect =>
        (player) => null,
    
    // Play beforer you declare invasions for a turn
    // Each opponent must destroy two of his armies, one at a time, in any order. 
    // Then you detroy one of your armies. One army must remain in each territory.
    WinterIsComing: (): CardEffect =>
        (player) => null,
    
    // Play before you declare invasions for a turn
    // Choose an opponent's territory adjacent to one you control. 
    // Roll a six sided die. Remove up to that many armies from the chosen territory. One must remain.
    CutOffSupplyLines: (): CardEffect =>
        (player) => null,
    
    // Play when an opponent declares an invasion on a territory you control with a port
    // Add one to your higtest defense die for the duration of the invasion
    FortifiedPorts: (): CardEffect =>
        (player) => null,
    
    // Play at the start of your turn
    // You may steal up to 200 gold from each opponent
    HiredThieves: (): CardEffect =>
        (player) => null,
    
    // Play at the start of your turn
    // All opponents roll a d6, lowest rollers lose 1 victory point
    BestLaidPlans: (): CardEffect =>
        (player) => null,
    
    // Play when an opponent declares an invasion against another opponent
    // Destroy up to 2 armies in the attacking territory and up to 2 armies in the defending territory
    // One army must remain 
    UnplannedLosses: (): CardEffect =>
        (player) => null,
    
    // Play when an opponent declares an invasion on a territory you control
    // Roll a d6, add that many armies to the defending territory
    ACallToArms: (): CardEffect =>
        (player) => null,
    
    // Play when you declare an invasion
    // If you conquer the territory, you also steal up to 300 gold from the opponent who controlled it
    RaidTheCountryside: (): CardEffect =>
        (player) => null,
    
    // Play before you declare invasions for a turn
    // Kill any one character, removing them from the game
    ValarMorghulis: (): CardEffect =>
        (player) => null,
    
    // Play before you declare invasions for a turn
    // Draw a territory card and place it face down with 5 armies on it. 
    // When you control this territory, you may reveal the card and place the armies on that territory
    RallyTheSmallfolk: (): CardEffect =>
        (player) => null,
    
    // Play when an opponent declares an invasion on a territory you control
    // Cancel the invasion, and that opponent cannot conquer any territories from you for the remainder of this turn
    WedForPeace: (): CardEffect =>
        (player) => null,
    
    // Play when an opponent declares an invasion on a territory you control
    // Remove all of your armies but one from the territory being invaded and place them on any other territory you control
    StrategicWithdrawl: (): CardEffect =>
        (player) => null,
    
    // Play when an opponent declares an invasion on a territory you control
    // That territory cannot be invaded this turn until that player conquers a territory from another player
    ATemporaryTruce: (): CardEffect =>
        (player) => null,
    
    // Play at the start of an opponent's turn before they collect gold or reinforcement armies
    // That player recieves only half their initial amount of gold / army income, rounded down
    FreefolkUprising: (): CardEffect =>
        (player) => null,
    
    // Play before you declare invasions for a turn
    // Choose a character and roll a d6. If you roll a 3 or higher, remove that character from the game.
    BloodMagic: (): CardEffect =>
        (player) => null,
    
    // Play when you collect reinforcement armies
    // Roll a d6, add that many armies to your reinforcement this turn
    CallInYourBanners: (): CardEffect =>
        (player) => null,
    
}

// MARK: Victory Effect
export const VictoryEffect = {

    VictoryPoints: (numPoints): CardEffect => 
        (player) => player.awardVictoryPoints(numPoints)

}

