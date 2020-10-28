/**
 * A simple and flexible system for world-building using an arbitrary collection of character and item attributes
 * Author: Atropos
 * Software License: GNU GPLv3
 */

// Import Modules
import {CofActor} from "./actors/actor.js";
import {CofItem} from "./items/item.js";

import {CofItemSheet} from "./items/item-sheet.js";
import {CofCharacterSheet} from "./actors/character-sheet.js";
import {CofEncounterSheet} from "./actors/encounter-sheet.js";

import { preloadHandlebarsTemplates } from "./templates.js";
import { registerHandlebarsHelpers } from "./helpers.js";
import { registerSystemSettings } from "./settings.js";


Hooks.once("init", async function () {

    console.info("System Initializing...");

    /**
     * Set an initiative formula for the system
     * @type {String}
     */

    CONFIG.Combat.initiative = {
        formula: "@attributes.init.value + @stats.wis.value/100",
        decimals: 2
    };

    // Define custom Entity classes
    CONFIG.Actor.entityClass = CofActor;
    CONFIG.Item.entityClass = CofItem;

    // Create a namespace within the game global
    game.cof = {
        config: COF
    };

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Items.unregisterSheet("core", ItemSheet);

    // Register actor sheets
    Actors.registerSheet("cof", CofCharacterSheet, {types: ["character", "npc"], makeDefault: true});
    Actors.registerSheet("cof", CofEncounterSheet, {types: ["encounter"], makeDefault: true});
    // Register item sheets
    Items.registerSheet("cof", CofItemSheet, {types: ["capacity", "profile", "path", "species", "armor", "shield", "melee", "ranged", "spell", "trapping"], makeDefault: true});

    // Register System Settings
    registerSystemSettings();

    // Preload Handlebars Templates
    preloadHandlebarsTemplates();

    // Register Handlebars helpers
    registerHandlebarsHelpers();

});
