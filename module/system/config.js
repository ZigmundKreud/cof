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

COF.stats = {
    "str": "COF.stats.str.label",
    "dex": "COF.stats.dex.label",
    "con": "COF.stats.con.label",
    "int": "COF.stats.int.label",
    "wis": "COF.stats.wis.label",
    "cha": "COF.stats.cha.label"
};

COF.skills = {
    "melee": "COF.attacks.melee.label",
    "ranged": "COF.attacks.ranged.label",
    "magic": "COF.attacks.magic.label"
};

COF.statAbbreviations = {
    "str": "COF.stats.str.abbrev",
    "dex": "COF.stats.dex.abbrev",
    "con": "COF.stats.con.abbrev",
    "int": "COF.stats.int.abbrev",
    "wis": "COF.stats.wis.abbrev",
    "cha": "COF.stats.cha.abbrev"
};

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
    "creature": "COF.properties.creature"
};

COF.itemCategories = {
    "other": "COF.category.other",
    "armor": "COF.category.armor",
    "shield": "COF.category.shield",
    "melee": "COF.category.melee",
    "ranged": "COF.category.ranged",
    "spell": "COF.category.spell",
    "jewel": "COF.category.jewel",
    "scroll": "COF.category.scroll",
    "wand": "COF.category.wand",
    "ammunition": "COF.category.ammunition",
    "consumable": "COF.category.consumable",
    "container": "COF.category.container",
    "mount": "COF.category.mount",
    "currency": "COF.category.currency",
    "trapping": "COF.category.trapping"
}

COF.itemIcons = {
    "item": "icons/containers/chest/chest-worn-oak-tan.webp",
    "capacity": "icons/sundries/scrolls/scroll-plain-tan-red.webp",
    "species": "icons/environment/people/group.webp",
    "profile": "icons/sundries/documents/blueprint-axe.webp",
    "path": "icons/sundries/books/book-embossed-gold-red.webp"
}

COF.actorIcons = {
    "npc": "icons/environment/people/commoner.webp",
    "encounter": "systems/cof/ui/icons/creature.webp",
    "loot": "icons/containers/bags/sack-simple-leather-brown.webp"
}

COF.actorsAllowedItems = {
    "character": [
        "item",
        "capacity",
        "species",
        "profile",
        "path"
    ],
    "npc": [
        "item",
        "capacity",
        "species",
        "profile",
        "path"
    ],
    "encounter": [
        "item",
        "capacity",
        "path"
    ],
    "loot": [
        "item"
    ]
}

COF.diceIcon = {
    "d4":"icons/dice/d4black.svg",
    "d6":"icons/dice/d6black.svg",
    "d8":"icons/dice/d8black.svg",
    "d10":"icons/dice/d10black.svg",
    "d12":"icons/dice/d12black.svg",
    "d20":"icons/dice/d20black.svg"
}

COF.debug = false;