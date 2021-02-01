export const System = {};

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

export const COF = {};

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
    "consumable": "COF.properties.consumable",
    "racial": "COF.properties.racial",
    "creature" : "COF.properties.creature"
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

