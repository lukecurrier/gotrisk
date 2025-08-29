import { Continent } from './Continent.js';
import { Region } from './Region.js';
import { Territory } from './Territory.js';

// MARK: The North
export const bearIsland = new Territory("Bear Island", [], true, false, false);
export const theGift = new Territory("The Gift", [], true, false, false);
export const karhold = new Territory("Karhold", [], false, false, false);
export const widowsWatch = new Territory("Widow's Watch", [], true, true, false);
export const whiteHarbor = new Territory("White Harbor", [], true, true, false);
export const stoneyShore = new Territory("Stoney Shore", [], true, false, false);
export const wolfswood = new Territory("Wolfswood", [], true, true, false);
export const winterfell = new Territory("Winterfell", [], true, false, true);
export const theDreadfort = new Territory("The Dreadfort", [], true, false, true);
export const barrowlands = new Territory("Barrowlands", [], true, false, true);
export const capeKraken = new Territory("Cape Kraken", [], true, true, false)
export const theNeck = new Territory("The Neck", [], true, false, false);
export const skagos = new Territory("Skagos", [], true, false, false)

export const theNorthTerritories: Territory[] = [
    bearIsland, theGift, karhold, widowsWatch, whiteHarbor,
    stoneyShore, wolfswood, winterfell, theDreadfort, barrowlands, 
    capeKraken, theNeck, skagos
];
export const theNorth = new Region("The North", 5, theNorthTerritories, "grey");

// MARK: The Vale
export const mountainsOfTheMoon = new Territory("Mountains of the Moon", [], true, false, false);
export const theFingers = new Territory("The Fingers", [], true, false, false);
export const theEyrie = new Territory("The Eyrie", [], true, false, true);
export const gulltown = new Territory("Gulltown", [], true, true, false)

export const theValeTerritories: Territory[] = [mountainsOfTheMoon, theFingers, theEyrie, gulltown];
export const theVale = new Region("The Vale", 1, theValeTerritories, "darkgreen");

// MARK: The Riverlands
export const theTwins = new Territory("The Twins", [], true, false, true);
export const theTrident = new Territory("The Trident", [], true, true, false);
export const harrenhall = new Territory("Harrenhall", [], true, false, true);
export const rivverrun = new Territory("Rivverrun", [], true, false, true)
export const stoneySept = new Territory("Stoney Sept", [], false, false, false);

export const theRiverlandsTerritories: Territory[] = [theTwins, theTrident, harrenhall, rivverrun, stoneySept];
export const theRiverlands = new Region("The Riverlands", 2, theRiverlandsTerritories, "blue");

// MARK: The Iron Islands
export const harlaw = new Territory("Harlaw", [], true, true, false);
export const pyke = new Territory("Pyke", [], true, true, true);

export const theIronIslandsTerritories: Territory[] = [harlaw, pyke];
export const theIronIslands = new Region("The Iron Islands", 1, theIronIslandsTerritories, "darkgrey");

// MARK: The Crownlands
export const theCrownlandsTerritories: Territory[] = [];
export const theCrownlands = new Region("The Crownlands", 2, theCrownlandsTerritories, "gold");

// MARK: The Westerlands
export const theWesterlandsTerritories: Territory[] = [];
export const theWesterlands = new Region("The Westerlands", 2, theWesterlandsTerritories, "maroon");

// MARK: The Stormlands
export const theStormlandsTerritories: Territory[] = [];
export const theStormlands = new Region("The Stormlands", 1, theStormlandsTerritories, "brown");

// MARK: The Reach
export const theReachTerritories: Territory[] = [];
export const theReach = new Region("The Reach", 4, theReachTerritories, "lightgreen");

// MARK: Dorne
export const dorneTerritories: Territory[] = [];
export const dorne = new Region("Dorne", 1, dorneTerritories, "orange");

// MARK: Westeros
export const westerosRegions: Region[] = [
    theNorth,
];

export const WESTEROS = new Continent("Westeros", westerosRegions);


//MARK: Essos
export const essosRegions: Region[] = [
    
];

export const ESSOS = new Continent("Essos", essosRegions);

export const CONTINENTS = [WESTEROS, ESSOS];