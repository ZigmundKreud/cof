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
            await CofRoll.skillRollDialog(actor, game.i18n.localize(statObj.label), statObj.mod, bonus, 20, statObj.superior, onEnter);
        } else {
            ui.notifications.error("Vous devez sélectionner un token pour pouvoir exécuter cette macro.");
        }
    };

    static rollItemMacro = function (itemId, itemName, itemType, bonus = 0, dmgBonus=0) {
        const actor = this.getSpeakersActor()
        let item;
        console.log(actor);
        item = actor ? actor.items.find(i => i.id === itemId) : null;
        if (!item) return ui.notifications.warn(`${game.i18n.localize("COF.notification.MacroItemMissing")}: "${itemName}"`);
        const itemData = item.data;
        if(itemData.data.properties.weapon){
            if(itemData.data.worn){
                let label = itemData.name;
                let mod = itemData.data.mod;
                let critrange = itemData.data.critrange;
                let dmg = itemData.data.dmg;
                CofRoll.rollWeaponDialog(actor, label, mod, bonus, critrange, dmg, dmgBonus);
            }
            else return ui.notifications.warn(`${game.i18n.localize("COF.notification.MacroItemUnequiped")}: "${itemName}"`);
        }
        else{
            return item.sheet.render(true);
        }
    };


}
