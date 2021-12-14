import { CofRoll } from "../controllers/roll.js";
import { CofHealingRoll } from "../controllers/healing-roll.js";
import { CofSkillRoll } from "../controllers/skill-roll.js";
import { CofDamageRoll } from "../controllers/dmg-roll.js";

export class Macros {

    /**
     * @name getSpeakersActor
     * @description
     * 
     * @returns 
     */
    static getSpeakersActor = function(){
        // Vérifie qu'un seul token est sélectionné
        const tokens = canvas.tokens.controlled;
        if (tokens.length > 1) {
            ui.notifications.warn(game.i18n.localize('COF.notification.MacroMultipleTokensSelected'));
            return null;
        }
        
        const speaker = ChatMessage.getSpeaker();
        let actor;
        // Si un token est sélectionné, le prendre comme acteur cible
        if (speaker.token) actor = game.actors.tokens[speaker.token];
        // Sinon prendre l'acteur par défaut pour l'utilisateur courrant
        if (!actor) actor = game.actors.get(speaker.actor);
        return actor;
    }

    /**
     * @anme rollStatMacro
     * @description
     * 
     * @param {*} actor 
     * @param {*} stat 
     * @param {*} bonus 
     * @param {*} malus 
     * @param {*} onEnter 
     * @param {*} label 
     * @param {*} description 
     * @param {*} dialog 
     * @param {*} dice 
     * @param {*} difficulty 
     * @returns 
     */
    static rollStatMacro = async function (actor, stat, bonus = 0, malus = 0, onEnter = "submit", label, description, dialog=true, dice="1d20", difficulty) {
        // Plusieurs tokens sélectionnés
        if (actor === null) return;
        // Aucun acteur cible
        if (actor === undefined) return ui.notifications.error(game.i18n.localize("COF.notification.MacroNoActorAvailable"));

        let statObj;
        switch(stat){
            case "for" :
            case "str" : statObj = eval(`actor.data.data.stats.str`); break;
            case "dex" : statObj = eval(`actor.data.data.stats.dex`); break;
            case "con" : statObj = eval(`actor.data.data.stats.con`); break;
            case "int" : statObj = eval(`actor.data.data.stats.int`); break;
            case "sag" :
            case "wis" : statObj = eval(`actor.data.data.stats.wis`); break;
            case "cha" : statObj = eval(`actor.data.data.stats.cha`); break;
            case "atc" :
            case "melee" : statObj = eval(`actor.data.data.attacks.melee`); break;
            case "atd" :
            case "ranged" : statObj = eval(`actor.data.data.attacks.ranged`); break;
            case "atm" :
            case "magic" : statObj = eval(`actor.data.data.attacks.magic`); break;
            default :
                ui.notifications.error(game.i18n.localize("COF.notification.MacroUnknownStat")); 
                break;
        }
        let mod = statObj.mod;

        // Caractéristiques
        if (stat === "for" || stat === "str" || stat === "dex") {
            
            // Prise en compte de la notion de PJ incompétent
            if (game.settings.get("cof", "useIncompetentPJ")) {
                malus += actor.getIncompetentSkillMalus(stat);
            }

            // Prise en compte de la notion d'encombrement
            malus += actor.getOverloadedSkillMalus(stat);

            // Prise en compte des bonus ou malus liés à la caractéristique
            let skillBonus = statObj.skillbonus;
            if (skillBonus) bonus += skillBonus;
            let skillMalus = statObj.skillmalus;
            if (skillMalus) malus += skillMalus;
        }
        if (dialog){
            CofRoll.skillRollDialog(actor, label && label.length > 0 ? label : game.i18n.localize(statObj.label), mod, bonus, malus, 20, statObj.superior, onEnter, description, actor.isWeakened());
        }
        else{
            return new CofSkillRoll(label && label.length > 0 ? label : game.i18n.localize(statObj.label), dice, "+" + +mod, bonus, malus, difficulty, "20", description).roll();
        }
    };

    /**
     * @name rollItemMacro
     * @description
     * 
     * @param {*} itemId 
     * @param {*} itemName 
     * @param {*} itemType 
     * @param {*} bonus 
     * @param {*} malus 
     * @param {*} dmgBonus 
     * @param {*} dmgOnly 
     * @param {*} customLabel 
     * @param {*} skillDescr 
     * @param {*} dmgDescr 
     * @returns 
     */
    static rollItemMacro = async function (itemId, itemName, itemType, bonus = 0, malus = 0, dmgBonus=0, dmgOnly=false, customLabel, skillDescr, dmgDescr, dialog=true) {
        const actor = this.getSpeakersActor();
        // Several tokens selected
        if (actor === null) return;
        // Aucun acteur cible
        if (actor === undefined) return ui.notifications.error(game.i18n.localize("COF.notification.MacroNoActorAvailable"));

        const item = actor.items.get(itemId);
        if (!item) return ui.notifications.warn(game.i18n.format('COF.notification.MacroItemMissing', {item:itemName}));

        const itemData = item.data;

        if((itemData.data.properties.weapon) || (itemData.data.properties.heal) || (itemData.data.properties.attack) || (itemData.data.properties.macro)){
            if (itemData.data.properties.weapon){
                if (itemData.data.properties.equipable && !itemData.data.worn) {
                    return ui.notifications.warn(game.i18n.format('COF.notification.MacroItemUnequiped', {item: itemName}));
                }
                const label =  customLabel && customLabel.length > 0 ? customLabel : itemData.name;                
                const critrange = itemData.data.critrange;              

                // Compute MOD
                const itemModStat = itemData.data.skill.split("@")[1];
                const itemModBonus = parseInt(itemData.data.skillBonus);
                const weaponCategory = item.getMartialCategory();
                
                let mod = actor.computeWeaponMod(itemModStat, itemModBonus, weaponCategory);

                // Compute DM
                const itemDmgBase = itemData.data.dmgBase;                        
                const itemDmgStat = itemData.data.dmgStat.split("@")[1];
                const itemDmgBonus = parseInt(itemData.data.dmgBonus);
                const skillDmgBonus = eval("actor.data.data." + itemModStat.replace('mod','dmBonus'));

                let dmg = actor.computeDm(itemDmgBase, itemDmgStat, itemDmgBonus, skillDmgBonus);

                if (dialog){
                    if (dmgOnly) CofRoll.rollDamageDialog(actor, label, dmg, 0, false, "submit", dmgDescr);
                    else CofRoll.rollWeaponDialog(actor, label, mod, bonus, malus, critrange, dmg, dmgBonus, "submit", skillDescr, dmgDescr);
                }
                    else{
                        let formula = dmgBonus ? dmg +  "+" + dmgBonus : dmg;
                        if (dmgOnly) new CofDamageRoll(label, formula, false, dmgDescr).roll(); 
                        else {        
                            let skillRoll = await new CofSkillRoll(label, "1d20", "+" + +mod, bonus, malus, null, critrange, skillDescr).roll();

                            let result = skillRoll.dice[0].results[0].result;
                            let critical = ((result >= critrange.split("-")[0]) || result == 20);
                            
                            new CofDamageRoll(label, formula, critical, dmgDescr).roll();                            
                        }
                    }                   
            }
            if (itemData.data.heal){
                // object
                if (item.type === "item") {
                    new CofHealingRoll(itemData.name, itemData.data.effects.heal.formula, false).roll(actor);
                }                
                // capacity
                else if (item.type === "capacity") {
                    actor.activateCapacity(item);
                }
                
            }
            if (itemData.data.activable && (itemData.data.attack || itemData.data.useMacro)){
                actor.activateCapacity(item);
            }
        }
        else { return item.sheet.render(true); }
    };

    static rollHealMacro = async function (label, healFormula, isCritical, title, showButtons=true, description){
        const actor = this.getSpeakersActor();
        // Several tokens selected
        if (actor === null) return;
        // No token selected
        if (actor === undefined) return ui.notifications.error(game.i18n.localize("COF.notification.MacroNoTokenSelected"));

        return new CofHealingRoll(label, healFormula, isCritical, title, showButtons, description).roll(actor);
    }

    static rollSkillMacro = async function(label, mod, bonus, malus, critRange, isSuperior = false, description){
        const actor = this.getSpeakersActor();

        // Several tokens selected
        if (actor === null) return;
        // Aucun acteur cible
        if (actor === undefined) return ui.notifications.error(game.i18n.localize("COF.notification.MacroNoActorAvailable"));

        let crit = parseInt(critRange);
        crit = !isNaN(crit) ? crit : 20;
        CofRoll.skillRollDialog(actor, label, mod, bonus, malus, crit, isSuperior, "submit", description);  
    }

    static rollDamageMacro = async function(label, dmgFormula, dmgBonus, isCritical, dmgDescr, dialog=true){
        const actor = this.getSpeakersActor();
        
        // Several tokens selected
        if (actor === null) return;
        // Aucun acteur cible
        if (actor === undefined) return ui.notifications.error(game.i18n.localize("COF.notification.MacroNoActorAvailable"));

        if (dialog){
            CofRoll.rollDamageDialog(actor, label, dmgFormula, dmgBonus, isCritical, "submit", dmgDescr);
        }
        else{
            let formula = dmgBonus ? `${dmgFormula} + ${dmgBonus}` : dmgFormula;
            return new CofDamageRoll(label, formula, isCritical, dmgDescr).roll();
        }          
    }
}
