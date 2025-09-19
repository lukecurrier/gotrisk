import { MaesterCard } from "./Cards";

export const MaesterCards: MaesterCard [] = [
    // Play before you declare invasions for a turn
    // You may declare invasions from territories you control with a port against any territories with a coastline border this turn
    new MaesterCard(0,
        "Pirate Ship Fleet",
        [],
        100,
        (player) => null),
    
    // Play after an opponent commits attacking armies against you
    // Roll a d6, destroy floor((rollResult + 1) / 2) attacking armies
    new MaesterCard(0,
        "Desperate Ambush",
        [],
        200,
        (player) => null),
    
    // Play after an opponent attacking armies to a battle against you
    // All attacking armies are destroyed
    new MaesterCard(0,
        "Lead Into A Trap",
        [],
        300,
        (player) => null),
    
    // Play at any time
    // Place three armies, one each in up to three different territories you control 
    new MaesterCard(0,
        "Preparing For War",
        [],
        200,
        (player) => null),
    
    // Play at any time
    // Add a Fortification to a territory you control
    new MaesterCard(0,
        "Reinforce Bulwarks",
        [],
        100,
        (player) => null),
    
    // Play when an opponent plays a Maester Card
    // Cancel that card's effect
    new MaesterCard(0,
        "Spider's Sabotage",
        [],
        200,
        (player) => null),
    
    // Play when an opponent declares an invasion on a territory you control
    // Give that player 200 gold and that territory cannot be invaded this turn
    new MaesterCard(0,
        "Bribery",
        [],
        200,
        (player) => null),
    
    // Play at any time
    // Add a Knight to a territory you control
    new MaesterCard(0,
        "A Sworn Sword",
        [],
        100,
        (player) => null),
    
    // Play when you declare an invasion
    // Add 1 to your highest die roll for the duration of the invasion
    new MaesterCard(0,
        "Strength Of Steel",
        [],
        100,
        (player) => null),
    
    // Play when an opponent declares an invasion against a territory you control with a castle
    // Add 1 to your highest defense die for the duration of the invasion
    new MaesterCard(0,
        "Castle Walls",
        [],
        100,
        (player) => null),
    
    // Play at any time
    // Add a Siege Engine to a territory you control
    new MaesterCard(0,
        "Weapons of War",
        [],
        100,
        (player) => null),
    
    // Play before you declare invasions for a turn
    // Draw and discard a territory card. Destroy one army in each territory controlled by an opponent in that territory's region
    new MaesterCard(0,
        "Sickness in the Ranks",
        [],
        300,
        (player) => null),
    
    // Play before you declare invasions for a turn
    // Reveal the top two cards of the territory card deck. Destroy half of the armies in each of those territories, rounded down, if controlled by an opponent
    new MaesterCard(0,
        "Mass Desertion",
        [],
        200,
        (player) => null),
    
    // Play before you declare invasions for a turn
    // Draw one maester card at random from an opponent and add it to your hand
    new MaesterCard(0,
        "A Web of Lies",
        [],
        300,
        (player) => null),
    
    // Play before you declare an invasion
    // Choose a character from the defending player's house. If you conquer the territory, you also capture that character.
    // Until that player pays you 500 gold as ransom to return the character, that character's ability cannot be used.
    new MaesterCard(0,
        "Taken Captive",
        [],
        200,
        (player) => null),
    
    // Play after you roll dice for any reason
    // Change any one dice to its highest value
    new MaesterCard(0,
        "Valryian Steel",
        [],
        100,
        (player) => null),
    
    // Play after an opponent commits attacking armies to a battle against a territory you control.
    // Destroy up to two attacking armies. Add two armies to teh defending territory.
    new MaesterCard(0,
        "Shifting Alliance",
        [],
        400,
        (player) => null),
    
    // Play when an opponent declares an invasion on a territory you control
    // Add 1 to all your dice rolls this turn, until that opponent captures the defending territory
    new MaesterCard(0,
        "Establish the High Ground",
        [],
        200,
        (player) => null),
    
    // Play before you declare invasions for a turn
    // Each opponent must discard one maester card at random
    new MaesterCard(0,
        "Confusion in the Ranks",
        [],
        300,
        (player) => null),
    
    // Play at the start of your turn
    // Costs to use character abilities and maester cards are doubled for all opopnents until the start of your next turn
    new MaesterCard(0,
        "Mourning the Fallen",
        [],
        300,
        (player) => null),
    
    // Play beforer you declare invasions for a turn
    // Each opponent must destroy two of his armies, one at a time, in any order. 
    // Then you detroy one of your armies. One army must remain in each territory.
    new MaesterCard(0,
        "Winter is Coming",
        [],
        300,
        (player) => null),
    
    // Play before you declare invasions for a turn
    // Choose an opponent's territory adjacent to one you control. 
    // Roll a six sided die. Remove up to that many armies from the chosen territory. One must remain.
    new MaesterCard(0,
        "Cut Off Supply Lines",
        [],
        300,
        (player) => null),
    
    // Play when an opponent declares an invasion on a territory you control with a port
    // Add one to your higtest defense die for the duration of the invasion
    new MaesterCard(0,
        "Fortified Ports",
        [],
        100,
        (player) => null),
    
    // Play at the start of your turn
    // You may steal up to 200 gold from each opponent
    new MaesterCard(0,
        "Hired Thieves",
        [],
        200,
        (player) => null),
    
    // Play at the start of your turn
    // All opponents roll a d6, lowest rollers lose 1 victory point (10% of victory total)
    new MaesterCard(0,
        "Best Laid Plans",
        [],
        200,
        (player) => null),
    
    // Play when an opponent declares an invasion against another opponent
    // Destroy up to 2 armies in the attacking territory and up to 2 armies in the defending territory
    // One army must remain 
    new MaesterCard(0,
        "Unplanned Losses",
        [],
        300,
        (player) => null),
    
    // Play when an opponent declares an invasion on a territory you control
    // Roll a d6, add that many armies to the defending territory
    new MaesterCard(0,
        "A Call to Arms",
        [],
        300,
        (player) => null),
    
    // Play when you declare an invasion
    // If you conquer the territory, you also steal up to 300 gold from the opponent who controlled it
    new MaesterCard(0,
        "Raid the Countryside",
        [],
        100,
        (player) => null),
    
    // Play before you declare invasions for a turn
    // Kill any one character, removing them from the game
    new MaesterCard(0,
        "Valar Morghulis",
        [],
        500,
        (player) => null),
    
    // Play before you declare invasions for a turn
    // Draw a territory card and place it face down with 5 armies on it. 
    // When you control this territory, you may reveal the card and place the armies on that territory
    new MaesterCard(0,
        "Rally The Smallfolk",
        [],
        300,
        (player) => null),
    
    // Play when an opponent declares an invasion on a territory you control
    // Cancel the invasion, and that opponent cannot conquer any territories from you for the remainder of this turn
    new MaesterCard(0,
        "Wed for Peace",
        [],
        400,
        (player) => null),
    
    // Play when an opponent declares an invasion on a territory you control
    // Remove all of your armies but one from the territory being invaded and place them on any other territory you control
    new MaesterCard(0,
        "Stragetic Withdrawl",
        [],
        100,
        (player) => null),
    
    // Play when an opponent declares an invasion on a territory you control
    // That territory cannot be invaded this turn until that player conquers a territory from another player
    new MaesterCard(0,
        "A Temporary Truce",
        [],
        200,
        (player) => null),
    
    // Play at the start of an opponent's turn before they collect gold or reinforcement armies
    // That player recieves only half their initial amount of gold / army income, rounded down
    new MaesterCard(0,
        "Freefolk Uprising",
        [],
        300,
        (player) => null),
    
    // Play before you declare invasions for a turn
    // Choose a character and roll a d6. If you roll a 3 or higher, remove that character from the game.
    new MaesterCard(0,
        "Blood Magic",
        [],
        200,
        (player) => null),
    
    // Play when you collect reinforcement armies
    // Roll a d6, add that many armies to your reinforcement this turn
    new MaesterCard(0,
        "Call in Your Banners",
        [],
        300,
        (player) => null),
];