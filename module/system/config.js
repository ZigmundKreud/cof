export const System = {};

System.label = "Chroniques Oubliées Fantasy";
System.abbrev = "COF VTT";
System.name = "cof";
System.rootPath = "/systems/" + System.name;
System.dataPath = System.rootPath + "/_data";
System.templatesPath = System.rootPath + "/templates";
System.logPrefix = System.abbrev;
System.debugMode = true;
System.DEV_MODE = false;

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

COF.itemSlots = {
    hand: "COF.slot.hand",
    head: "COF.slot.head",
    ear: "COF.slot.ear",
    neck: "COF.slot.neck",
    shoulders: "COF.slot.shoulders",
    chest: "COF.slot.chest",
    back: "COF.slot.back",
    arm: "COF.slot.arm",
    finger: "COF.slot.finger",
    wrist: "COF.slot.wrist",
    waist: "COF.slot.waist",
    legs: "COF.slot.legs",
    feet: "COF.slot.feet",
    belt: "COF.slot.belt",
    bakpack: "COF.slot.backpack",
    quiver: "COF.slot.quiver"
}

COF.itemRarityStackable = {
    common: "COF.rarity.common",
    moderate: "COF.rarity.moderate",
    rare: "COF.rarity.rare",
    "very-rare": "COF.rarity.very-rare"
}

COF.itemRarity = {
    common: "COF.rarity.common",
    moderate: "COF.rarity.moderate",
    rare: "COF.rarity.rare",
    "very-rare": "COF.rarity.very-rare",
    unique: "COF.rarity.unique"
}

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
    "d4": "icons/dice/d4black.svg",
    "d6": "icons/dice/d6black.svg",
    "d8": "icons/dice/d8black.svg",
    "d10": "icons/dice/d10black.svg",
    "d12": "icons/dice/d12black.svg",
    "d20": "icons/dice/d20black.svg"
}

COF.activeEffectChanges = {
    "system.stats.str.bonus": "COF.stats.str.label",
    "system.stats.dex.bonus": "COF.stats.dex.label",
    "system.stats.con.bonus": "COF.stats.con.label",
    "system.stats.int.bonus": "COF.stats.int.label",
    "system.stats.wis.bonus": "COF.stats.wis.label",
    "system.stats.cha.bonus": "COF.stats.cha.label",
    "system.stats.str.skillbonus": "COF.stats.str.skill.label",
    "system.stats.dex.skillbonus": "COF.stats.dex.skill.label",
    "system.stats.con.skillbonus": "COF.stats.con.skill.label",
    "system.stats.int.skillbonus": "COF.stats.int.skill.label",
    "system.stats.wis.skillbonus": "COF.stats.wis.skill.label",
    "system.stats.cha.skillbonus": "COF.stats.cha.skill.label",
    "system.attacks.melee.bonus": "COF.attacks.melee.label",
    "system.attacks.ranged.bonus": "COF.attacks.ranged.label",
    "system.attacks.magic.bonus": "COF.attacks.magic.label",
    "system.attacks.melee.dmBonus": "COF.attacks.melee.dmBonus",
    "system.attacks.ranged.dmBonus": "COF.attacks.ranged.dmBonus",
    "system.attacks.magic.dmBonus": "COF.attacks.magic.dmBonus",
    "system.attributes.hp.bonus": "COF.attributes.hp.max.label",
    "system.attributes.def.bonus": "COF.attributes.def.label",
    "system.attributes.init.bonus": "COF.attributes.init.label",
    "system.attributes.dr.bonus.value": "COF.attributes.dr.label",
    "system.attributes.rp.bonus": "COF.attributes.rp.label",
    "system.attributes.fp.bonus": "COF.attributes.fp.label",
    "system.attributes.mp.bonus": "COF.attributes.mp.label"
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

COF.DICE_VALUES = {
    "1d4": "1d4",
    "1d6": "1d6",
    "1d8": "1d8",
    "1d10": "1d10",
    "1d12": "1d12",
    "1d20": "1d20"
};

COF.DAMAGE_STAT = {
    "@stats.str.mod": "COF.stats.str.label",
    "@stats.dex.mod": "COF.stats.dex.label",
    "@stats.con.mod": "COF.stats.con.label",
    "@stats.int.mod": "COF.stats.int.label",
    "@stats.wis.mod": "COF.stats.wis.label",
    "@stats.cha.mod": "COF.stats.cha.label"
};

COF.SKILL = {
    "@attacks.melee.mod": "COF.attacks.melee.label",
    "@attacks.ranged.mod": "COF.attacks.ranged.label",
    "@attacks.magic.mod": "COF.attacks.magic.label"
};

COF.DURATION = {
    rounds: "COF.ui.rounds",
    minutes: "COF.ui.minutes",
    hours: "COF.ui.hours",
    days: "COF.ui.days"
};

COF.RELOAD = {
    s: "COF.ui.simpleAction",
    l: "COF.ui.limitedAction"
};

COF.ATTACK_SKILLS = {
    "auto": "COF.ui.automatic",
    "@attacks.melee.mod": "COF.attacks.melee.label",
    "@attacks.ranged.mod": "COF.attacks.ranged.label",
    "@attacks.magic.mod": "COF.attacks.magic.label",
    "@stats.str.mod": "COF.stats.str.label",
    "@stats.dex.mod": "COF.stats.dex.label",
    "@stats.con.mod": "COF.stats.con.label",
    "@stats.int.mod": "COF.stats.int.label",
    "@stats.wis.mod": "COF.stats.wis.label",
    "@stats.cha.mod": "COF.stats.cha.label"
};

COF.SPELLCASTING = {
    int: "COF.stats.int.label",
    wis: "COF.stats.wis.label",
    cha: "COF.stats.cha.label"
};

COF.MP_FACTOR = {
    "0": "0",
    "1": "x1",
    "2": "x2"
};