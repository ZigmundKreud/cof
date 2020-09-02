export const registerSystemSettings = function() {

    // Register system settings
    // game.settings.register("cof", "macroShorthand", {
    //     name: "Shortened Macro Syntax",
    //     hint: "Enable a shortened macro syntax which allows referencing attributes directly, for example @str instead of @attributes.str.value. Disable this setting if you need the ability to reference the full attribute model, for example @attributes.str.label.",
    //     scope: "world",
    //     type: Boolean,
    //     default: true,
    //     config: true,
    //     onChange: mode => {}
    // });


    game.settings.register("cof", "useRecovery", {
        name: "Points de récupération",
        hint: "Utiliser la règle optionnelle des points de récupération",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: mode => {}
    });

    game.settings.register("cof", "useFortune", {
        name: "Points de chance",
        hint: "Utiliser la règle optionnelle des points de chance",
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
        onChange: mode => {}
    });

    game.settings.register("cof", "useMana", {
        name: "Points de Mana",
        hint: "Utiliser la règle optionnelle des points de mana",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: mode => {}
    });

    game.settings.register("cof", "useDamageResistance", {
        name: "Résistance aux dommages",
        hint: "Afficher la résistance aux dommages sur la feuille de personnage",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: mode => {}
    });

    game.settings.register("cof", "developerMode", {
        name: "Mode développeur",
        hint: "Permet d'accéder aux fonctionnalités de développement",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: mode => {}
    });

    game.settings.register("cof", "importData", {
        name: "Import des données",
        hint: "Mets à jour les données du système à partir des fichiers JSON",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: mode => {}
    });
};
