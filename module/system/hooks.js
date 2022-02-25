import { CofActor } from "../actors/actor.js";
import {Hitpoints} from "../controllers/hitpoints.js";
import {CharacterGeneration} from "../system/chargen.js";
import { COF } from "./config.js";

export default function registerHooks() {

    Hooks.on("getChatLogEntryContext", (html, options) => {
        let canApplyDamage = li => li.find("h2.damage").length;
        let canApplyHealing = li => li.find("h2.heal").length;
        options.push(
            {
                name: game.i18n.localize("COF.ui.applyDamage"),
                icon: '<i class="fas fa-user-minus"></i>',
                condition: canApplyDamage,
                callback: li => {
                    const dmg = parseInt(li.find(".dice-total").text());
                    Hitpoints.applyToTargets(-dmg);
                }
            },
            {
                name: game.i18n.localize("COF.ui.applyHalfDamage"),
                icon: '<i class="fas fa-user-shield"></i>',
                condition: canApplyDamage,
                callback: li => {
                    const dmg = Math.ceil(parseInt(li.find(".dice-total").text()) / 2);
                    Hitpoints.applyToTargets(-dmg);
                }
            },
            {
                name: game.i18n.localize("COF.ui.applyDoubleDamage"),
                icon: '<i class="fas fa-user-injured"></i>',
                condition: canApplyDamage,
                callback: li => {
                    const dmg = parseInt(li.find(".dice-total").text())*2;
                    Hitpoints.applyToTargets(-dmg);
                }
            },
            {
                name: game.i18n.localize("COF.ui.applyHealing"),
                icon: '<i class="fas fa-user-plus"></i>',
                condition: canApplyDamage,
                callback: li => {
                    const dmg = parseInt(li.find(".dice-total").text());
                    Hitpoints.applyToTargets(dmg);
                }
            },
            {
                name: game.i18n.localize("COF.ui.applyDamage"),
                icon: '<i class="fas fa-user-minus"></i>',
                condition: canApplyHealing,
                callback: li => {
                    const dmg = parseInt(li.find(".dice-total").text());
                    Hitpoints.applyToTargets(-dmg);
                }
            },            
            {
                name: game.i18n.localize("COF.ui.applyHealing"),
                icon: '<i class="fas fa-user-plus"></i>',
                condition: canApplyHealing,
                callback: li => {
                    const dmg = parseInt(li.find(".dice-total").text());
                    Hitpoints.applyToTargets(dmg);
                }
            }
        );
    });

    /**
     * Create a macro when dropping an entity on the hotbar
     * Item      - open roll dialog for item
     * Actor     - open actor sheet
     * Journal   - open journal sheet
     */

    Hooks.on("hotbarDrop", async (bar, data, slot) => {
        // Create item macro if rollable item - weapon, spell, prayer, trait, or skill
        if (data.type == "Item") {
            let item = data.data;
            let command = `let onlyDamage = false;\nlet customLabel = "";\nlet skillDescription = "";\nlet dmgDescription = "";\nlet withDialog = true;\n\nif (event) {\n  if (event.shiftKey) onlyDamage = true;\n}\n\ngame.cof.macros.rollItemMacro("${item._id}", "${item.name}", "${item.type}", 0, 0, 0, onlyDamage, customLabel, skillDescription, dmgDescription, withDialog);`;
            let macro = game.macros.contents.find(m => (m.name === item.name) && (m.data.command === command));
            if (!macro) {
                macro = await Macro.create({
                    name: item.name,
                    type : "script",
                    img: item.img,
                    command : command
                }, {displaySheet: false})
                game.user.assignHotbarMacro(macro, slot);
            }            
        }
        // Create a macro to open the actor sheet of the actor dropped on the hotbar
        else if (data.type == "Actor") {
            let actor = game.actors.get(data.id);
            let command = `game.actors.get("${data.id}").sheet.render(true)`;
            let macro = game.macros.contents.find(m => (m.name === actor.name) && (m.data.command === command));
            if (!macro) {
                macro = await Macro.create({
                    name: actor.data.name,
                    type: "script",
                    img: actor.data.img,
                    command: command
                }, {displaySheet: false});
                game.user.assignHotbarMacro(macro, slot);
            }
        }
        // Create a macro to open the journal sheet of the journal dropped on the hotbar
        else if (data.type == "JournalEntry") {
            let journal = game.journal.get(data.id);
            let command = `game.journal.get("${data.id}").sheet.render(true)`;
            let macro = game.macros.contents.find(m => (m.name === journal.name) && (m.data.command === command));
            if (!macro) {
                macro = await Macro.create({
                    name: journal.data.name,
                    type: "script",
                    img: (journal.data.img) ? journal.data.img : "icons/svg/book.svg",
                    command: command
                }, {displaySheet: false});
                game.user.assignHotbarMacro(macro, slot);
            }
        }
        else if (data.type == "Weapon"){
            let weapon = data.data;
            let command = `let weaponId = ${data.weaponId};\nlet onlyDamage = false;\nlet customLabel = "";\nlet skillDescription = "";\nlet dmgDescription = "";\nlet withDialog = true;\nlet tokenActor = game.cof.macros.getSpeakersActor();\n\nif (event) {\n  if (event.shiftKey) onlyDamage = true;\n}\n\nif (!tokenActor) {\n  ui.notifications.warn(game.i18n.localize("COF.notification.MacroNoTokenSelected"));\n}\nelse if(!tokenActor?.rollWeapon) {\n  ui.notifications.warn(game.i18n.localize("COF.notification.MacroNotAnEncounter"));\n}\nelse {\n  tokenActor.rollWeapon(weaponId, customLabel, onlyDamage, 0, 0, 0, skillDescription, dmgDescription, withDialog);\n}`;
            let macro = game.macros.contents.find(m => (m.name === weapon.name) && (m.data.command === command));
            if (!macro) {
                macro = await Macro.create({
                    name: weapon.name,
                    type : "script",
                    img: "systems/cof/ui/icons/attack.webp",
                    command : command
                }, {displaySheet: false});
                game.user.assignHotbarMacro(macro, slot);   
            }                     
        }
        return false;
    });


    /**
     * Intercepte les commandes de chat
     * /stat - Jet de caractéristique
     * /skill stat - Jet de caractéristique
     * /stats - Génère les caractéristiques d'un personnage
     */

    Hooks.on("chatMessage", (html, content, msg) => {
        let regExp;
        regExp = /(\S+)/g;
        let commands = content.match(regExp);
        let command = (commands.length>0 && commands[0].split("/").length > 0) ? commands[0].split("/")[1].trim() : null;
        let arg1 = (commands.length > 1) ? commands[1].trim() : null;
        const actor = game.cof.macros.getSpeakersActor();

        const validCommands = ["for", "str", "dex", "con", "int", "sag", "wis", "cha", "atc", "melee", "atd", "ranged", "atm", "magic"];

        if(command && validCommands.includes(command)) {
            game.cof.macros.rollStatMacro(actor, command, 0, 0, null);
            return false;
        }
        else if(command && command === "skill") {
            if(arg1 && validCommands.includes(arg1)) {
                game.cof.macros.rollStatMacro(actor, arg1, 0, 0, null);
            } else {
                ui.notifications.error(game.i18n.localize("COF.notification.chatHook.noSkillSelected"));
            }
            return false;
        }
        else if(command && command === "stats") {
            CharacterGeneration.statsCommand();
            return false;
        }
    });

    Hooks.on("renderChatMessage", (message, html, data) => {
        // Affiche ou non les boutons d'application des dommages
        if (game.settings.get("cof", "displayChatDamageButtonsToAll")) {
            html.find(".apply-dmg").click(ev => Hitpoints.onClickChatMessageApplyButton(ev, html, data));    
        }
        else {
            if (game.user.isGM){
                html.find(".apply-dmg").click(ev => Hitpoints.onClickChatMessageApplyButton(ev, html, data));    
            }
            else {
                html.find(".apply-dmg").each((i, btn) => {
                    btn.style.display = "none"
                  });
                html.find(".dr-checkbox").each((i, btn) => {
                    btn.style.display = "none"
                });
            }        
        }      
        
        // Affiche ou non la difficulté
        const displayDifficulty = game.settings.get("cof", "displayDifficulty");
        if (displayDifficulty === "none" || (displayDifficulty === "gm" && !game.user.isGM)) {
            html.find(".display-difficulty").each((i, elt) => {
                elt.remove();
            });
        }        
    });

    /**
     * Intercepte la création d'un active effect
     * Si l'effet provient d'un item équipable, on disable l'effet si l'item n'est pas équipé (par défaut il n'est pas équipé)
     * Il n'y as pas de preCreateActiveEffect pour les effets transférés depuis un item
     * On procède donc à une mise à jour de l'effet
     */
    Hooks.on("createActiveEffect", (activeEffect)=>{
        // Si l'effet ne s'applique pas à un actor, on quitte en laissant l'effet se créer normalement
        if (!activeEffect.parent instanceof CofActor) return;

        let origin = activeEffect.data.origin;
        // Si l'effet ne provient pas d'un item, on quitte en laissant l'effet se créer normalement
        if (!/Item\.[^.]+$/.test(origin)) return;

        let parts = origin.split('.');
        let item;

        // Récupération de l'item parent en fonction de si il vient d'un actor du compendium ou d'un token
        if (parts[0] === "Actor"){
            item = ActorDirectory.collection.get(parts[1])?.getEmbeddedDocument("Item",parts[3]);
        }
        else if (parts[0] === "Scene"){
            item = SceneDirectory.collection.get(parts[1])?.tokens.get(parts[3])?.getEmbeddedDocument("Item",parts[5]);
        }
        else return true;

        // Si l'item parent n'est pas équipable, on quitte en laissant l'effet se créer normalement
        let itemData = item.data;
        if (!itemData.data?.properties?.equipable) return;
        
        // Si l'effet est déjà à jour, on quitte
        if (activeEffect.data.disabled === !itemData.worn) return;

        // On met à jour l'effet en fonction du fait que l'item est équipé ou non
        activeEffect.update({disabled: !itemData.worn});
    });

    Hooks.on("pauseGame", async () => {
        let lockDuringPause = game.settings.get("cof", "lockDuringPause");
        if (!game.user.isGM && lockDuringPause) {
            updateApplicationToLockDuringPause();
        }
    });

    Hooks.on("updateSetting", async (setting) => {
        if (setting.data.key === "cof.lockDuringPause") {
            if (!game.user.isGM && game.paused) {
                updateApplicationToLockDuringPause();
            }
        }
    });
}

function updateApplicationToLockDuringPause(){
    Object.values(ui.windows).forEach((app)=>{
        COF.applicationsToLockDuringPause.forEach((appClass) => {
            if (app instanceof appClass) app.render();
        });
    });
}
