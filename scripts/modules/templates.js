/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {

    // Define template paths to load
    const templatePaths = [
        // ACTOR
        "systems/cof/templates/partials/actor/actor-armor.hbs",
        "systems/cof/templates/partials/actor/actor-attacks.hbs",
        "systems/cof/templates/partials/actor/actor-attributes.hbs",
        "systems/cof/templates/partials/actor/actor-capacities.hbs",
        "systems/cof/templates/partials/actor/actor-combat.hbs",
        "systems/cof/templates/partials/actor/actor-defence.hbs",
        "systems/cof/templates/partials/actor/actor-description.hbs",
        "systems/cof/templates/partials/actor/actor-init.hbs",
        "systems/cof/templates/partials/actor/actor-inventory.hbs",
        "systems/cof/templates/partials/actor/actor-melee.hbs",
        "systems/cof/templates/partials/actor/actor-paths.hbs",
        "systems/cof/templates/partials/actor/actor-ranged.hbs",
        "systems/cof/templates/partials/actor/actor-recovery.hbs",
        "systems/cof/templates/partials/actor/actor-resources.hbs",
        "systems/cof/templates/partials/actor/actor-shield.hbs",
        "systems/cof/templates/partials/actor/actor-spells.hbs",
        "systems/cof/templates/partials/actor/actor-stats.hbs",
        "systems/cof/templates/partials/actor/actor-vitality.hbs",

        // ENCOUNTER
        "systems/cof/templates/partials/encounter/encounter-stats.hbs",
        "systems/cof/templates/partials/encounter/encounter-combat.hbs",
        "systems/cof/templates/partials/encounter/encounter-paths.hbs",
        "systems/cof/templates/partials/encounter/encounter-inventory.hbs",
        "systems/cof/templates/partials/encounter/encounter-description.hbs",

        // ENCOUNTER
        "systems/cof/templates/partials/item/item-header.hbs",

        // MISC
        "systems/cof/templates/partials/equipable-item.hbs"
    ];

    // Load the template parts
    return loadTemplates(templatePaths);
};
