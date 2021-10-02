/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
import {CofHealingRoll} from "../controllers/healing-roll.js";
import {COF} from "../system/config.js"; 

export class CofItem extends Item {

    /* -------------------------------------------- */
    /*  Constructor                                 */
    /* -------------------------------------------- */
    /* Définition de l'image par défaut             */
    /* -------------------------------------------- */   
    constructor(...args) {
        let data = args[0];
        if (!data.img && COF.itemIcons[data.type]) data.img = COF.itemIcons[data.type];

        super(...args);
    }	

    /** @override */
    prepareData() {
        super.prepareData();
        const itemData = this.data;
        const actorData = (this.actor) ? this.actor.data : null;
        if(itemData.data.price){
            const qty = (itemData.data.qty) ? itemData.data.qty : 1;
            itemData.data.value = qty * itemData.data.price;
        }
        if(itemData.data.properties?.protection) this._prepareArmorData(itemData);
        if(itemData.data.properties?.weapon) this._prepareWeaponData(itemData, actorData);
        // utilisé par les capacités : ne pas effacer
        if(!itemData.data.key) itemData.data.key = itemData.name.slugify({strict: true});
    }

    _prepareArmorData(itemData) {
        itemData.data.def = parseInt(itemData.data.defBase, 10) + parseInt(itemData.data.defBonus, 10);
    }

    _prepareWeaponData(itemData, actorData) {
        itemData.data.skillBonus = (itemData.data.skillBonus) ? itemData.data.skillBonus : 0;
        itemData.data.dmgBonus = (itemData.data.dmgBonus) ? itemData.data.dmgBonus : 0;
        if (actorData && actorData.type !== "loot") {

            // Compute skill mod
            const skillMod = eval("actorData.data." + itemData.data.skill.split("@")[1]);
            itemData.data.mod = parseInt(skillMod) + parseInt(itemData.data.skillBonus);

            // Compute damage mod
            const dmgStat = eval("actorData.data." + itemData.data.dmgStat.split("@")[1]);
            const dmgBonus = (dmgStat) ? parseInt(dmgStat) + parseInt(itemData.data.dmgBonus) : parseInt(itemData.data.dmgBonus);
            if (dmgBonus < 0) itemData.data.dmg = itemData.data.dmgBase + " - " + parseInt(-dmgBonus);
            else if (dmgBonus === 0) itemData.data.dmg = itemData.data.dmgBase;
            else itemData.data.dmg = itemData.data.dmgBase + " + " + dmgBonus;
        }
    }

    applyEffects(actor){
        const itemData = this.data;

        if(itemData.data.properties.heal){
            const heal = itemData.data.effects.heal;
            const r = new CofHealingRoll(itemData.name, heal.formula, false);
            r.roll(actor);
        }
    }

    getMartialCategory() {
        if (!this.data.data.properties?.weapon) return;
        return ;
    }
}
