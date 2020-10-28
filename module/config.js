const System = {};

System.label = "Chroniques Oubliées Fantasy";
System.abbrev = "COF VTT";
System.name = "cof";
System.rootPath = "/systems/" + System.name;
System.dataPath = System.rootPath + "/_data";
System.templatesPath = System.rootPath + "/templates";
System.logPrefix = System.abbrev;
System.debugMode = true;

const COF = {};

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

