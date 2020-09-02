/**
 * A simple and flexible system for world-building using an arbitrary collection of character and item attributes
 * Author: Atropos
 * Software License: GNU GPLv3
 */

// Import Modules
import {CofActor} from "../actors/actor.js";
import {CofItem} from "../items/item.js";
import {CofItemSheet} from "../items/item-sheet.js";
import {CofCapacitySheet} from "../items/capacity-sheet.js";
import {CofSpellSheet} from "../items/spell-sheet.js";
import {CofTrappingSheet} from "../items/trapping-sheet.js";
import {CofArmorSheet} from "../items/armor-sheet.js";
import {CofRangedSheet} from "../items/ranged-sheet.js";
import {CofMeleeSheet} from "../items/melee-sheet.js";
import {CofProfileSheet} from "../items/profile-sheet.js";
import {CofPathSheet} from "../items/path-sheet.js";
import {CofSpeciesSheet} from "../items/species-sheet.js";

import {CofCharacterSheet} from "../actors/character-sheet.js";
import {CofNpcSheet} from "../actors/npc-sheet.js";
import {CofEncounterSheet} from "../actors/encounter-sheet.js";
import {Logger} from "../logger.js";
import { preloadHandlebarsTemplates } from "../templates.js";
import { registerHandlebarsHelpers } from "../../helpers.js";
import { registerSystemSettings } from "../settings.js";


Hooks.once("init", async function () {

    Logger.info("System Initializing...");

    /**
     * Set an initiative formula for the system
     * @type {String}
     */

    CONFIG.Combat.initiative = {
        formula: "@attributes.init.value + @stats.4.value/100",
        decimals: 2
    };

    // Define custom Entity classes
    CONFIG.Actor.entityClass = CofActor;
    CONFIG.Item.entityClass = CofItem;

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Items.unregisterSheet("core", ItemSheet);

    // Register actor sheets
    Actors.registerSheet("cof", CofCharacterSheet, {types: ["character"], makeDefault: true});
    Actors.registerSheet("cof", CofNpcSheet, {types: ["npc"], makeDefault: true});
    Actors.registerSheet("cof", CofEncounterSheet, {types: ["encounter"], makeDefault: true});
    // Register item sheets
    Items.registerSheet("cof", CofItemSheet, {types: ["item"], makeDefault: true});
    Items.registerSheet("cof", CofCapacitySheet, {types: ["capacity"], makeDefault: true});
    Items.registerSheet("cof", CofTrappingSheet, {types: ["trapping"], makeDefault: true});
    Items.registerSheet("cof", CofArmorSheet, {types: ["armor", "shield"], makeDefault: true});
    Items.registerSheet("cof", CofRangedSheet, {types: ["ranged"], makeDefault: true});
    Items.registerSheet("cof", CofMeleeSheet, {types: ["melee"], makeDefault: true});
    Items.registerSheet("cof", CofSpellSheet, {types: ["spell"], makeDefault: true});
    Items.registerSheet("cof", CofProfileSheet, {types: ["profile"], makeDefault: true});
    Items.registerSheet("cof", CofPathSheet, {types: ["path"], makeDefault: true});
    Items.registerSheet("cof", CofSpeciesSheet, {types: ["species"], makeDefault: true});

    // Register System Settings
    registerSystemSettings();

    // Preload Handlebars Templates
    preloadHandlebarsTemplates();

    // Register Handlebars helpers
    registerHandlebarsHelpers();

    Logger.info("System Initialized.");
});
