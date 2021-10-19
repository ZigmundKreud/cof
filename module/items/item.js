/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
import { CofHealingRoll } from "../controllers/healing-roll.js";
import { CofRoll } from "../controllers/roll.js";
import { CofSkillRoll }  from "../controllers/skill-roll.js";
import { COF } from "../system/config.js"; 

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

    getProperty(property) {
        const itemData = this.data;
        if (itemData.type === "capacity") {
            return itemData.data[property];
        }
        else {
            return itemData.data.properties[property];
        }
    }

    getHealFormula() {
        const itemData = this.data;
        if (itemData.type === "capacity") {
            return itemData.data.properties.heal.formula;
        }
        else {
            return itemData.data.effects.heal.formula;
        }
    }

    applyEffects(actor) {
        // Capacité de soin
        if(this.getProperty("heal")) {
            const r = new CofHealingRoll(this.data.name, this.getHealFormula(), false);
            r.roll(actor);
            return r;
        }

        // Capacité d'attaque
        if (this.getProperty("attack")) {
            return CofRoll.rollAttackCapacity(actor, this);
        }
    }
    
    getMartialCategory() {
        if (!this.data.data.properties?.weapon) return;
        return ;
    }

    getQuantity(){
        if(this.data.data.properties.stackable) return this.data.data.qty;
        else return 1;
    }
    
    modifyQuantity(increment, isDecrease) {
        if(this.data.data.properties.stackable) {
            let itemData = duplicate(this.data);
            const qty = itemData.data.qty;
            increment = Math.abs(increment);

            if(isDecrease) {
                itemData.data.qty = Math.max(0, qty - increment);
                if (itemData.data.deleteWhen0 && itemData.data.qty === 0) return this.delete();
            }
            else itemData.data.qty = itemData.data.stacksize ? Math.min(itemData.data.stacksize, qty + increment) : qty + increment;

            if(itemData.data.price){
                const qty = (itemData.data.qty) ? itemData.data.qty : 1;
                itemData.data.value = qty * itemData.data.price;
            }
            return this.update(itemData);
        }
    }

    modifyUse(increment, isDecrease) {
        if(this.data.data.limitedUsage) {
            let itemData = duplicate(this.data);
            const qty = itemData.data.properties.limitedUsage.use;
            if (isDecrease) itemData.data.properties.limitedUsage.use = qty - increment;
            else itemData.data.properties.limitedUsage.use = qty + increment;
            if (itemData.data.properties.limitedUsage.use < 0) itemData.data.properties.limitedUsage.use = 0;
            return this.update(itemData);
        }
    }

}
