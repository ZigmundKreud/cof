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

COF.capacityProperties = {
    "limited": "COF.ui.limited",
    "spell": "COF.ui.spell",
    "ranged": "COF.properties.ranged",
    "limitedUsage": "COF.ui.limitedUsage",
    "save": "COF.ui.save",
    "activable": "COF.properties.activable",
    "heal": "COF.ui.heal",
    "attack": "COF.ui.attack",
    "buff": "COF.ui.buff",
    "useMacro": "COF.capacity.useMacro"
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

COF.activeEffectChanges = {
    "data.stats.str.bonus": "COF.stats.str.label",
    "data.stats.dex.bonus": "COF.stats.dex.label",
    "data.stats.con.bonus": "COF.stats.con.label",
    "data.stats.int.bonus": "COF.stats.int.label",
    "data.stats.wis.bonus": "COF.stats.wis.label",
    "data.stats.cha.bonus": "COF.stats.cha.label",
    "data.stats.str.skillbonus": "COF.stats.str.skill.label",
    "data.stats.dex.skillbonus": "COF.stats.dex.skill.label",
    "data.stats.con.skillbonus": "COF.stats.con.skill.label",
    "data.stats.int.skillbonus": "COF.stats.int.skill.label",
    "data.stats.wis.skillbonus": "COF.stats.wis.skill.label",
    "data.stats.cha.skillbonus": "COF.stats.cha.skill.label",
    "data.attacks.melee.bonus": "COF.attacks.melee.label",
    "data.attacks.ranged.bonus": "COF.attacks.ranged.label",
    "data.attacks.magic.bonus": "COF.attacks.magic.label",
    "data.attacks.melee.dmBonus": "COF.attacks.melee.dmBonus",
    "data.attacks.ranged.dmBonus": "COF.attacks.ranged.dmBonus",
    "data.attacks.magic.dmBonus": "COF.attacks.magic.dmBonus",
    "data.attributes.hp.bonus": "COF.attributes.hp.max.label",
    "data.attributes.def.bonus": "COF.attributes.def.label",
    "data.attributes.init.bonus": "COF.attributes.init.label",    
    "data.attributes.dr.bonus.value": "COF.attributes.dr.label",
    "data.attributes.rp.bonus": "COF.attributes.rp.label",
    "data.attributes.fp.bonus": "COF.attributes.fp.label",
    "data.attributes.mp.bonus": "COF.attributes.mp.label"
}

COF.applicationsToLockDuringPause = [
    ActorSheet,
    ItemSheet,
    ActiveEffectConfig
];

/**
 * Creature sizes.
 * @enum {string}
 */
 COF.actorSizes = {
    tiny: "COF.encounter.size.tiny",
    small: "COF.encounter.size.small",
    short: "COF.encounter.size.short",
    med: "COF.encounter.size.medium",
    big: "COF.encounter.size.big",
    huge: "COF.encounter.size.huge",
    colossal: "COF.encounter.size.colossal"
};
  
/**
 * Default token image size for the values of `COF.actorSizes`.
 * @enum {number}
 */
COF.tokenSizes = {
    tiny: 0.25,
    small: 0.5,
    short: 0.8,
    med: 1,
    big: 2,
    huge: 3,
    colossal: 4
};

/**
 * Encounter archetype.
 * @enum {string}
 */
 COF.encounterArchetypes = {
    standard: "COF.encounter.archetype.standard",
    fast: "COF.encounter.archetype.fast",
    powerful: "COF.encounter.archetype.powerful",
    lesser: "COF.encounter.archetype.lesser"
};

/**
 * Encounter category.
 * @enum {string}
 */
 COF.encounterCategories = {
    living: "COF.encounter.category.living",
    humanoid: "COF.encounter.category.humanoid",
    plant: "COF.encounter.category.plant",
    unliving: "COF.encounter.category.unliving"
};

/**
 * Encounter Boss Rank.
 * @enum {string}
 */
 COF.encounterBossRanks = {
    "1": "COF.encounter.boss.rank.remarkable",
    "2": "COF.encounter.boss.rank.superior",
    "3": "COF.encounter.boss.rank.major",
    "4": "COF.encounter.boss.rank.exceptional",
    "5": "COF.encounter.boss.rank.legendary"
};

/**
 * Encounter Boss Type.
 * @enum {string}
 */
 COF.encounterBossTypes = {
    fast: "COF.encounter.boss.type.fast",
    powerful: "COF.encounter.boss.type.powerful",
    berserk: "COF.encounter.boss.type.berserk",
    resistant: "COF.encounter.boss.type.resistant"
};

COF.debug = false;
