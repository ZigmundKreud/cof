/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {

    // Define template paths to load
    const templatePaths = [
        // ACTOR
        "systems/cof/templates/actors/character/parts/character-header.hbs",
        "systems/cof/templates/actors/character/parts/character-description.hbs",

        "systems/cof/templates/actors/character/parts/stats/character-attacks.hbs",
        "systems/cof/templates/actors/character/parts/stats/character-attributes.hbs",
        "systems/cof/templates/actors/character/parts/stats/character-recovery.hbs",
        "systems/cof/templates/actors/character/parts/stats/character-resources.hbs",
        "systems/cof/templates/actors/character/parts/stats/character-stats.hbs",
        "systems/cof/templates/actors/character/parts/stats/character-vitality.hbs",
        "systems/cof/templates/actors/character/parts/stats/character-defence.hbs",
        "systems/cof/templates/actors/character/parts/stats/character-init.hbs",

        "systems/cof/templates/actors/character/parts/capacities/character-capacities.hbs",
        "systems/cof/templates/actors/character/parts/capacities/character-paths.hbs",

        "systems/cof/templates/actors/character/parts/combat/character-combat.hbs",
        "systems/cof/templates/actors/character/parts/combat/character-combat-item.hbs",

        "systems/cof/templates/actors/character/parts/inventory/character-inventory.hbs",
        "systems/cof/templates/actors/character/parts/inventory/character-inventory-item.hbs",

        // ENCOUNTER
        "systems/cof/templates/actors/encounter/parts/encounter-combat.hbs",
        "systems/cof/templates/actors/encounter/parts/encounter-details.hbs",
        "systems/cof/templates/actors/encounter/parts/encounter-stats.hbs",

        // ITEMS PROPERTIES
        "systems/cof/templates/items/parts/properties/item-properties.hbs",
        "systems/cof/templates/items/parts/properties/capacity-properties.hbs",
        "systems/cof/templates/items/parts/properties/profile-properties.hbs",

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
