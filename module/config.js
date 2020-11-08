const System = {};

System.label = "Chroniques Oubliées Fantasy";
System.abbrev = "COF VTT";
System.name = "cof";
System.rootPath = "/systems/" + System.name;
System.dataPath = System.rootPath + "/_data";
System.templatesPath = System.rootPath + "/templates";
System.logPrefix = System.abbrev;
System.debugMode = true;
System.ASCII = `
   ******    *******   ********
  **////**  **/////** /**///// 
 **    //  **     //**/**      
/**       /**      /**/******* 
/**       /**      /**/**////  
//**    **//**     ** /**      
 //******  //*******  /**      
  //////    ///////   //`;

const COF = {};

COF.itemProperties = {
    "equipable": "COF.properties.equipable",
    "stackable": "COF.properties.stackable",
    "unique": "COF.properties.unique",
    "tailored": "COF.properties.tailored",
    "2h": "COF.properties.2H",
    "predilection": "COF.properties.predilection",
    "ranged": "COF.properties.ranged",
    "proficient": "COF.properties.proficient",
    "finesse": "COF.properties.finesse",
    "two-handed": "COF.properties.two-handed",
    "equipment": "COF.properties.equipment",
    "weapon": "COF.properties.weapon",
    "protection": "COF.properties.protection",
    "reloadable": "COF.properties.reloadable",
    "bow": "COF.properties.bow",
    "crossbow": "COF.properties.crossbow",
    "powder": "COF.properties.powder",
    "throwing": "COF.properties.throwing",
    "dr": "COF.properties.dr",
    "sneak": "COF.properties.sneak",
    "powerful": "COF.properties.powerful",
    "critscience": "COF.properties.critscience",
    "specialization": "COF.properties.specialization",
    "effects": "COF.properties.effects",
    "activable": "COF.properties.activable",
    "2H": "COF.properties.2H",
    "13strmin": "COF.properties.13strmin",
    "bashing": "COF.properties.bashing",
    "sling": "COF.properties.sling",
    "spell": "COF.properties.spell",
    "profile": "COF.properties.profile",
    "prestige": "COF.properties.prestige",
    "alternative": "COF.properties.alternative",
    "racial": "COF.properties.racial",
    "creature" : "COF.properties.creature"
};

COF.profiles = [];
COF.species = [];
COF.paths = [];
COF.capacities = [];

// Mise en cache des données de profil
COF.getProfiles = async function () {
    let profiles = await game.packs.get("cof.profiles").getContent().then(index => index.map(entity => entity.data));
    COF.profiles = profiles;
    console.debug("Profiles loaded");
};

// Mise en cache des données de races
COF.getSpecies = async function () {
    let species = await game.packs.get("cof.species").getContent().then(index => index.map(entity => entity.data));
    COF.species = species;
    console.debug("Species loaded");
};

// Mise en cache des données de voies
COF.getPaths = async function () {
    let paths = await game.packs.get("cof.paths").getContent().then(index => index.map(entity => entity.data));
    COF.paths = paths;
    console.debug("Paths loaded");
};

// Mise en cache des données de capacités
COF.getCapacities = async function () {
    let capacities = await game.packs.get("cof.capacities").getContent().then(index => index.map(entity => entity.data));
    COF.capacities = capacities;
    console.debug("Capacities loaded");
};

COF.itemTypes = {
    "species": "COF.category.species",
    "profile": "COF.category.profile",
    "capacity": "COF.category.capacity",
    "path": "COF.category.path",
    "trapping": "COF.category.trapping",
    "melee": "COF.category.melee",
    "armor": "COF.category.armor",
    "shield": "COF.category.shield",
    "ranged": "COF.category.ranged",
    "spell": "COF.category.spell"
};

