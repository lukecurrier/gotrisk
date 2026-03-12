// Card descriptions and timing info for UI display.
// Keyed by card name (case-sensitive, matches card definitions).

export interface CardDesc {
  description: string;
  timing: string;
}

export const MAESTER_DESCRIPTIONS: Record<string, CardDesc> = {
  "Pirate Ship Fleet": {
    timing: "Before declaring invasions",
    description: "You may declare invasions from your port territories against any coastal territory this turn.",
  },
  "Desperate Ambush": {
    timing: "After opponent commits attackers against you",
    description: "Roll a d6, destroy floor((result+1)/2) attacking armies.",
  },
  "Lead Into A Trap": {
    timing: "After opponent commits attackers against you",
    description: "All attacking armies are destroyed.",
  },
  "Preparing For War": {
    timing: "Any time (your turn)",
    description: "Place three armies, one each in up to three different territories you control.",
  },
  "Reinforce Bulwarks": {
    timing: "Any time (your turn)",
    description: "Add a Fortification token to a territory you control.",
  },
  "Spider's Sabotage": {
    timing: "When opponent plays a Maester card",
    description: "Cancel that card's effect.",
  },
  "Bribery": {
    timing: "When opponent invades your territory",
    description: "Give that player 200 gold. That territory cannot be invaded this turn.",
  },
  "A Sworn Sword": {
    timing: "Any time (your turn)",
    description: "Add a Knight token to a territory you control.",
  },
  "Strength Of Steel": {
    timing: "When you declare an invasion",
    description: "Add 1 to your highest die roll for the duration of the invasion.",
  },
  "Castle Walls": {
    timing: "When opponent invades your castle territory",
    description: "Add 1 to your highest defense die for the duration of the invasion.",
  },
  "Weapons of War": {
    timing: "Any time (your turn)",
    description: "Add a Siege Engine token to a territory you control.",
  },
  "Sickness in the Ranks": {
    timing: "Before declaring invasions",
    description: "Draw and discard a territory card. Destroy one army in each opponent territory in that card's region.",
  },
  "Mass Desertion": {
    timing: "Before declaring invasions",
    description: "Reveal top two territory cards. Destroy half the armies (rounded down) in each if controlled by an opponent.",
  },
  "A Web of Lies": {
    timing: "Before declaring invasions",
    description: "Draw one maester card at random from an opponent and add it to your hand.",
  },
  "Taken Captive": {
    timing: "Before you declare an invasion",
    description: "If you conquer the territory, capture a character from the defender. Until 500g ransom is paid, that character can't be used.",
  },
  "Valryian Steel": {
    timing: "After rolling dice for any reason",
    description: "Change any one die to its highest value.",
  },
  "Shifting Alliance": {
    timing: "After opponent commits attackers against you",
    description: "Destroy up to two attacking armies. Add two armies to the defending territory.",
  },
  "Establish the High Ground": {
    timing: "When opponent invades your territory",
    description: "Add 1 to all your dice rolls until that opponent captures the defending territory.",
  },
  "Confusion in the Ranks": {
    timing: "Before declaring invasions",
    description: "Each opponent must discard one maester card at random.",
  },
  "Mourning the Fallen": {
    timing: "Start of your turn",
    description: "Card costs are doubled for all opponents until the start of your next turn.",
  },
  "Winter is Coming": {
    timing: "Before declaring invasions",
    description: "Each opponent destroys two armies, then you destroy one. One army must remain per territory.",
  },
  "Cut Off Supply Lines": {
    timing: "Before declaring invasions",
    description: "Choose an adjacent opponent territory. Roll a d6, remove up to that many armies. One must remain.",
  },
  "Fortified Ports": {
    timing: "When opponent invades your port territory",
    description: "Add 1 to your highest defense die for the duration of the invasion.",
  },
  "Hired Thieves": {
    timing: "Start of your turn",
    description: "Steal up to 200 gold from each opponent.",
  },
  "Best Laid Plans": {
    timing: "Start of your turn",
    description: "All opponents roll a d6. Lowest rollers lose 1 victory point.",
  },
  "Unplanned Losses": {
    timing: "When opponent invades another opponent",
    description: "Destroy up to 2 armies in the attacking territory and up to 2 in the defending territory. One must remain.",
  },
  "A Call to Arms": {
    timing: "When opponent invades your territory",
    description: "Roll a d6, add that many armies to the defending territory.",
  },
  "Raid the Countryside": {
    timing: "When you declare an invasion",
    description: "If you conquer the territory, steal up to 300 gold from the previous owner.",
  },
  "Valar Morghulis": {
    timing: "Before declaring invasions",
    description: "Kill any one character, removing them from the game permanently.",
  },
  "Rally The Smallfolk": {
    timing: "Before declaring invasions",
    description: "Draw a territory card and place it face down with 5 armies. When you control that territory, reveal and place armies.",
  },
  "Wed for Peace": {
    timing: "When opponent invades your territory",
    description: "Cancel the invasion. That opponent cannot conquer any territories from you this turn.",
  },
  "Stragetic Withdrawl": {
    timing: "When opponent invades your territory",
    description: "Move all armies but one from the invaded territory to another territory you control.",
  },
  "A Temporary Truce": {
    timing: "When opponent invades your territory",
    description: "That territory cannot be invaded this turn until that player conquers from another player.",
  },
  "Freefolk Uprising": {
    timing: "Start of an opponent's turn",
    description: "That player receives only half their gold and army income, rounded down.",
  },
  "Blood Magic": {
    timing: "Before declaring invasions",
    description: "Choose a character and roll d6. On 3+, remove that character from the game.",
  },
  "Call in Your Banners": {
    timing: "When you collect reinforcements",
    description: "Roll a d6, add that many armies to your reinforcement this turn.",
  },
};

// Lookup any card description by name
export function getCardDescription(name: string): CardDesc | null {
  return MAESTER_DESCRIPTIONS[name] ?? null;
}
