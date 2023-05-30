/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {

    // Define template paths to load
    const templatePaths = [
        // ACTOR
        "systems/cof/templates/actors/actor-sheet.hbs",
        "systems/cof/templates/actors/loot-sheet.hbs",
        "systems/cof/templates/actors/parts/actor-details.hbs",
        "systems/cof/templates/actors/parts/actor-tabs.hbs",
        "systems/cof/templates/actors/parts/actor-description.hbs",
        "systems/cof/templates/actors/parts/capacities/actor-capacities.hbs",
        "systems/cof/templates/actors/parts/capacities/actor-paths.hbs",
        "systems/cof/templates/actors/parts/combat/actor-combat.hbs",
        "systems/cof/templates/actors/parts/combat/actor-combat-item.hbs",
        "systems/cof/templates/actors/parts/combat/encounter-combat.hbs",
        "systems/cof/templates/actors/parts/details/actor-details.hbs",
        "systems/cof/templates/actors/parts/details/encounter-details.hbs",
        "systems/cof/templates/actors/parts/inventory/actor-inventory.hbs",
        "systems/cof/templates/actors/parts/inventory/actor-inventory-item.hbs",
        "systems/cof/templates/actors/parts/stats/actor-stats.hbs",
        "systems/cof/templates/actors/parts/stats/encounter-stats.hbs",

        "systems/cof/templates/actors/parts/stats/actor-attacks.hbs",
        "systems/cof/templates/actors/parts/stats/actor-attributes.hbs",
        "systems/cof/templates/actors/parts/stats/actor-recovery.hbs",
        "systems/cof/templates/actors/parts/stats/actor-resources.hbs",
        "systems/cof/templates/actors/parts/stats/actor-vitality.hbs",
        "systems/cof/templates/actors/parts/stats/actor-defence.hbs",
        "systems/cof/templates/actors/parts/stats/actor-init.hbs",
        
        // EFFECTS
        "systems/cof/templates/effects/effects.hbs",
        "systems/cof/templates/effects/effects-item.hbs",
        "systems/cof/templates/effects/active-effect-config.hbs",

        // DIALOGS
        "systems/cof/templates/dialogs/parts/roll-dmg-fields.hbs",

        // ITEMS PROPERTIES
        "systems/cof/templates/items/parts/properties/item-properties.hbs",

        // ITEMS DETAILS
        "systems/cof/templates/items/parts/details/item-details.hbs",
        "systems/cof/templates/items/parts/details/capacity-details.hbs",
        "systems/cof/templates/items/parts/details/path-details.hbs",
        "systems/cof/templates/items/parts/details/profile-details.hbs",
        "systems/cof/templates/items/parts/details/ranged-details.hbs",
        "systems/cof/templates/items/parts/details/species-details.hbs",
        "systems/cof/templates/items/parts/details/equipment-details.hbs",
        "systems/cof/templates/items/parts/details/protection-details.hbs",
        "systems/cof/templates/items/parts/details/spell-details.hbs",
        "systems/cof/templates/items/parts/details/weapon-details.hbs",
        "systems/cof/templates/items/parts/details/usage-details.hbs",
        "systems/cof/templates/items/parts/details/effects-details.hbs",
    ];

    // Load the template parts
    return loadTemplates(templatePaths);
};
