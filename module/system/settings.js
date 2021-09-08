export const registerSystemSettings = function() {

    game.settings.register("cof", "useRecovery", {
        name: "Points de Récupération",
        hint: "Utiliser la règle optionnelle des Points de Récupération (PR).",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: lang => window.location.reload()
    });

    game.settings.register("cof", "useFortune", {
        name: "Points de Chance",
        hint: "Utiliser la règle optionnelle des Points de Chance (PC).",
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
        onChange: lang => window.location.reload()
    });

    game.settings.register("cof", "useMana", {
        name: "Points de Mana",
        hint: "Utiliser la règle optionnelle des Points de Mana (PM).",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: lang => window.location.reload()
    });

    game.settings.register("cof", "useDamageResistance", {
        name: "Résistance aux dommages",
        hint: "Afficher la résistance aux dommages sur la feuille de personnage.",
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

    game.settings.register("cof", "useComboRolls", {
        name: "Active les jets \"combo\"",
        hint: "Permet de lancer les jets d'attaque et de dommages simultanément.",
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

    game.settings.register("cof", "useIncompetentPJ", {
        name: "PJ incompétent",
        hint: "Utilise la règle du PJ Incompétent.",
        scope: "world",
        config: false,
        default: false,
        type: Boolean,
        onChange: lang => window.location.reload()
    });

    game.settings.register("cof", "displayChatDamageButtonsToAll", {
        name: "Affiche les boutons de dommages",
        hint: "Affiche les boutons d'application des dommages dans les messages de chat à tout le monde.",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: lang => window.location.reload()
    });
    
    game.settings.register("cof", "moveItem", {
        name: "Mode de déplacement des items",
        hint: "Comportement du drag & drop d'un item sur une fiche de personnage (Maintenir MAJ lors du drop pour inverser)",
        scope: "world",
        type: String,
        choices: {
            "0" : "Copier l'item (par défaut dans Foundry)",
            "1" : "Déplacer l'item"
        },
        default: "0",
        config: true,
        onChange: lang => window.location.reload()
    });    

    game.settings.register("cof", "lockItems",{
        name: "Verrouiller les items",
        hint: "Interdire aux joueurs de modifier les items",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: lang => window.location.reload()        
    });    
};
