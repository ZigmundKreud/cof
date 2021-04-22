import {CofRoll} from "../controllers/roll.js";

export class Macros {

    static getSpeakersActor = function(){
        const speaker = ChatMessage.getSpeaker();
        let actor;
        // if a token is selected take it as target actor
        if (speaker.token) actor = game.actors.tokens[speaker.token];
        // otherwise take the default actor for current user
        if (!actor) actor = game.actors.get(speaker.actor);
        return actor;
    }

    static rollStatMacro = async function (actor, stat, bonus = 0, onEnter = "submit") {
        if(actor){
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
                    ui.notifications.error("La compétence à tester n'a pas été reconnue.");
                    break;
            }
            let mod = statObj.mod;
            // Prise en compte de la notion de PJ incompétent
            if (game.settings.get("cof", "useIncompetentPJ")) {
                mod = mod + actor.getIncompetentSkillMalus(stat);
            }
            await CofRoll.skillRollDialog(actor, game.i18n.localize(statObj.label), mod, bonus, malus, 20, statObj.superior, onEnter);
        } else {
            ui.notifications.error("Vous devez sélectionner un token pour pouvoir exécuter cette macro.");
        }
    };

    static rollItemMacro = function (itemId, itemName, itemType, bonus = 0, malus = 0, dmgBonus=0, dmgOnly=false) {
        const actor = this.getSpeakersActor()
        let item;
        item = actor ? actor.items.find(i => i.id === itemId) : null;
        if (!item) return ui.notifications.warn(`${game.i18n.localize("COF.notification.MacroItemMissing")}: "${itemName}"`);
        const itemData = item.data;
        if(itemData.data.properties.weapon){
            if(itemData.data.worn){
                const label = itemData.name;                
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

                 let dmg = actor.computeDm(itemDmgBase, itemDmgStat, itemDmgBonus)

                if (dmgOnly) { CofRoll.rollDamageDialog(actor, label, dmg, 0); }
                else CofRoll.rollWeaponDialog(actor, label, mod, bonus, malus, critrange, dmg, dmgBonus);
            }
            else return ui.notifications.warn(`${game.i18n.localize("COF.notification.MacroItemUnequiped")}: "${itemName}"`);
        }
        else { return item.sheet.render(true); }
    };
}
