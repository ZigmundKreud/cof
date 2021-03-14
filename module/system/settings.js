export const registerSystemSettings = function() {

    game.settings.register("cof", "useRecovery", {
        name: "Points de récupération",
        hint: "Utiliser la règle optionnelle des points de récupération",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: lang => window.location.reload()
    });

    game.settings.register("cof", "useFortune", {
        name: "Points de chance",
        hint: "Utiliser la règle optionnelle des points de chance",
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
        onChange: lang => window.location.reload()
    });

    game.settings.register("cof", "useMana", {
        name: "Points de Mana",
        hint: "Utiliser la règle optionnelle des points de mana",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: lang => window.location.reload()
    });

    game.settings.register("cof", "useDamageResistance", {
        name: "Résistance aux dommages",
        hint: "Afficher la résistance aux dommages sur la feuille de personnage",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: lang => window.location.reload()
    });

    game.settings.register("cof", "displayDifficulty", {
        name: "Affiche la difficulté",
        hint: "Active l'affichage de la difficulté sur les jets de compétences/attributs et d'armes.",
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
        onChange: lang => window.location.reload()
    });

    game.settings.register("cof", "hideDifficulty", {
        name: "Masque la difficulté de la cible",
        hint: "Cache l'affichage de la difficulté des jets d'armes lorsque l'on cible un ennemi.",
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
        onChange: lang => window.location.reload() 
    })

    game.settings.register("cof", "useComboRolls", {
        name: "Active les jets \"combo\"",
        hint: "Permet de lancer les jets d'attaque et de dommage simultanément.",
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
        onChange: lang => window.location.reload()
    });

    game.settings.register("cof", "useVarInit", {
        name: "Initiative variable",
        hint: "Utilise la règle d'initiative variable (p.173 du LdB) au lieu de la règle de base.",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: lang => window.location.reload()
    });
};
