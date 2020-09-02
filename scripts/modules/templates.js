/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {

    // Define template paths to load
    const templatePaths = [
        "systems/cof/templates/partials/actor-armor.hbs",
        "systems/cof/templates/partials/actor-attacks.hbs",
        "systems/cof/templates/partials/actor-attributes.hbs",
        "systems/cof/templates/partials/actor-capacities.hbs",
        "systems/cof/templates/partials/actor-combat.hbs",
        "systems/cof/templates/partials/actor-defence.hbs",
        "systems/cof/templates/partials/actor-description.hbs",
        "systems/cof/templates/partials/actor-init.hbs",
        "systems/cof/templates/partials/actor-inventory.hbs",
        "systems/cof/templates/partials/actor-melee.hbs",
        "systems/cof/templates/partials/actor-paths.hbs",
        "systems/cof/templates/partials/actor-ranged.hbs",
        "systems/cof/templates/partials/actor-recovery.hbs",
        "systems/cof/templates/partials/actor-resources.hbs",
        "systems/cof/templates/partials/actor-shield.hbs",
        "systems/cof/templates/partials/actor-spells.hbs",
        "systems/cof/templates/partials/actor-stats.hbs",
        "systems/cof/templates/partials/actor-vitality.hbs",
        "systems/cof/templates/partials/equipable-item.hbs",
        "systems/cof/templates/partials/npc-capacities.hbs",
        "systems/cof/templates/partials/npc-stats.hbs"
    ];

    // Load the template parts
    return loadTemplates(templatePaths);
};
