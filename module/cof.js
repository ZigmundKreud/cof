/**
 * A simple and flexible system for world-building using an arbitrary collection of character and item attributes
 * Author: Atropos
 * Software License: GNU GPLv3
 */

// Import Modules
import { CofActor } from "./actors/actor.js";
import { CofItem } from "./items/item.js";

import { CofItemSheet } from "./items/item-sheet.js";
import { CofActorSheet } from "./actors/actor-sheet.js";

import { preloadHandlebarsTemplates } from "./system/templates.js";
import { registerHandlebarsHelpers } from "./system/helpers.js";
import { registerSystemSettings } from "./system/settings.js";

import { System, COF } from "./system/config.js";
import { Macros } from "./system/macros.js";
import registerHooks from "./system/hooks.js";
import { CofLootSheet } from "./actors/loot-sheet.js";
import { COFActiveEffectConfig } from "./system/active-effect-config.js";
import { EffectsModifications, customizeStatusEffects } from "./effects/effects.js";

Hooks.once("init", async function () {

    console.info("COF | System Initializing...");
    console.info(System.ASCII);

    // Register System Settings
    registerSystemSettings();

    /**
     * Set an initiative formula for the system
     * @type {String}
     */

    if(game.settings.get("cof", "useVarInit")){
        CONFIG.Combat.initiative = {
            formula: "1d6x + @attributes.init.value + @stats.wis.value/100",
            decimals: 2
        };
    }
    else {
        CONFIG.Combat.initiative = {
            formula: "@attributes.init.value + @stats.wis.value/100",
            decimals: 2
        };
    }

    // Record Configuration Values
    CONFIG.COF = COF;

    // Define custom Entity classes
    CONFIG.Actor.documentClass = CofActor;
    CONFIG.Item.documentClass = CofItem;
    CONFIG.ActiveEffect.sheetClass = COFActiveEffectConfig;
    
    // Create a namespace within the game global
    game.cof = {
        skin : "base",
        macros : Macros,
        config: COF
    };

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Items.unregisterSheet("core", ItemSheet);

    // Register actor sheets
    Actors.registerSheet("cof", CofActorSheet, {
        types: ["character", "npc", "encounter"],
        makeDefault: true,
        label: "COF.sheet.character"
    });
    // Register actor sheets
    Actors.registerSheet("cof", CofLootSheet, {
        types: ["loot"],
        makeDefault: true,
        label: "COF.sheet.loot"
    });
    // Register item sheets
    Items.registerSheet("cof", CofItemSheet, {
        types: ["item", "capacity", "profile", "path", "species"],
        makeDefault: true,
        label: "COF.sheet.item"
    });

    // Preload Handlebars Templates
    preloadHandlebarsTemplates();

    // Register Handlebars helpers
    registerHandlebarsHelpers();

    // Register hooks
    registerHooks();

    // Customize Status Effects
    customizeStatusEffects();
});

Hooks.once("setup", function() {

	// Localize CONFIG objects once up-front
	const toLocalize = ["stats","skills","actorSizes","encounterArchetypes","encounterBossRanks","encounterBossTypes","encounterCategories"];
	// Exclude some from sorting where the default order matters
	const noSort = ["stats","skills","actorSizes","encounterArchetypes","encounterBossRanks","encounterBossTypes","encounterCategories"];

	// Localize and sort CONFIG objects
	for ( let o of toLocalize ) {
		const localized = Object.entries(CONFIG.COF[o]).map(e => {
		  return [e[0], game.i18n.localize(e[1])];
		});
		if ( !noSort.includes(o) ) localized.sort((a, b) => a[1].localeCompare(b[1]));
		CONFIG.COF[o] = localized.reduce((obj, e) => {
		  obj[e[0]] = e[1];
		  return obj;
		}, {});
	}
});

/**
 * Ready hook loads tables, and override's foundry's entity link functions to provide extension to pseudo entities
 */

Hooks.once("ready", async () => {
    console.info("COF | System Initialized.");
});
