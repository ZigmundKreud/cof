/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {

    // Define template paths to load
    const templatePaths = [
        // ACTOR
        "systems/cof/templates/actors/character/parts/character-armor.hbs",
        "systems/cof/templates/actors/character/parts/character-attacks.hbs",
        "systems/cof/templates/actors/character/parts/character-attributes.hbs",
        "systems/cof/templates/actors/character/parts/character-capacities.hbs",
        "systems/cof/templates/actors/character/parts/character-combat.hbs",
        "systems/cof/templates/actors/character/parts/character-defence.hbs",
        "systems/cof/templates/actors/character/parts/character-description.hbs",
        "systems/cof/templates/actors/character/parts/character-init.hbs",
        "systems/cof/templates/actors/character/parts/character-inventory.hbs",
        "systems/cof/templates/actors/character/parts/character-melee.hbs",
        "systems/cof/templates/actors/character/parts/character-paths.hbs",
        "systems/cof/templates/actors/character/parts/character-ranged.hbs",
        "systems/cof/templates/actors/character/parts/character-recovery.hbs",
        "systems/cof/templates/actors/character/parts/character-resources.hbs",
        "systems/cof/templates/actors/character/parts/character-shield.hbs",
        "systems/cof/templates/actors/character/parts/character-spells.hbs",
        "systems/cof/templates/actors/character/parts/character-stats.hbs",
        "systems/cof/templates/actors/character/parts/character-vitality.hbs",

        // ENCOUNTER
        "systems/cof/templates/actors/encounter/parts/encounter-stats.hbs",
        "systems/cof/templates/actors/encounter/parts/encounter-attacks.hbs",
        "systems/cof/templates/actors/encounter/parts/encounter-details.hbs",
        "systems/cof/templates/actors/encounter/parts/encounter-combat.hbs",
        "systems/cof/templates/actors/encounter/parts/encounter-capacities.hbs",
        "systems/cof/templates/actors/encounter/parts/encounter-inventory.hbs",
        "systems/cof/templates/actors/encounter/parts/encounter-description.hbs",

        // ITEMS
        "systems/cof/templates/items/parts/item-def-stats.hbs",
        "systems/cof/templates/items/parts/item-price.hbs",
        "systems/cof/templates/items/parts/item-description.hbs",
        "systems/cof/templates/items/parts/item-header.hbs",
        "systems/cof/templates/items/parts/item-weapon-stats.hbs"
    ];

    // Load the template parts
    return loadTemplates(templatePaths);
};
