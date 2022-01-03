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

    /**
     * @name applyEffects
     * @description Active les effets d'un objet
     *  Pour les types Soin, Attaque, useMacro et Buff
     * @param {*} actor 
     * @returns 
     */
    async applyEffects(actor) {
        const itemData = this.data;

        // Capacité de soin
        if(this.getProperty("heal")) {
            // S'il n'a pas de formule
            if (itemData.data.properties.heal.formula === "") return;
            const r = new CofHealingRoll(itemData.name, this.getHealFormula(), false);
            r.roll(actor);
            return r;
        }

        // Capacité d'attaque
        if (this.getProperty("attack")) {
            return CofRoll.rollAttackCapacity(actor, this);
        }

        // Capacité de buff
        if (this.getProperty("buff")) {
            // Parcourt les effects de l'acteur pour trouver ceux fournis par la capacité
            let effectsData = actor.getEffectsFromItemId(this.id)?.map(effect=> duplicate(effect.data));
            if (effectsData.length > 0) {
                effectsData.forEach(effect => effect.disabled = !this.data.data.properties.buff.activated);
                actor.updateEmbeddedDocuments("ActiveEffect", effectsData);
            }
        }

        // Capacité utilisant une macro
        if (this.getProperty("useMacro")) {
           let macro;
           // Recherche de la macro avec l'ID
           if (itemData.data.properties.macro.id !== null && itemData.data.properties.macro.id != "") {
               macro = game.macros.get(itemData.data.properties.macro.id);
               if (macro !== undefined) {
                   return macro.execute();
               }

               // Recherche dans le compendium
               if (itemData.data.properties.macro.pack != null && itemData.data.properties.macro.pack != "") {
                    const pack = game.packs.get(itemData.data.properties.macro.pack);
                    const item = pack.index.get(itemData.data.properties.macro.id);                
                    let itemId = item != undefined ? item._id : null;
                    if (itemId) {
                        macro = await pack.getDocument(itemId);
                    }
    
                    if (macro != undefined) {
                        return macro.execute();
                    }
               }

            }
            // Recherche de la macro avec le nom
            else {                
                let macro;

                // Recherche dans le monde
                macro = game.macros.getName(itemData.data.properties.macro.name);
                if (macro != undefined) {
                    return macro.execute();
                }

                // Recherche dans le compendium des macros
                const pack = game.packs.get("cof.macros");
                const item = pack.index.getName(itemData.data.properties.macro.name);                
                let itemId = item != undefined ? item._id : null;
                if (itemId) {
                    macro = await pack.getDocument(itemId);
                }

                if (macro != undefined) {
                    return macro.execute();
                }                
            }
            
        }        

    }
    
    getMartialCategory() {
        if (!this.data.data.properties?.weapon) return;
        return ;
    }

    getQuantity() {
        if(this.data.data.properties.stackable) return this.data.data.qty;
        else return 1;
    }
    
    modifyQuantity(increment, isDecrease) {
        if(this.data.data.properties.stackable) {
            let itemData = duplicate(this.data);
            const qty = itemData.data.qty;
            increment = Math.abs(increment);

            if (isDecrease) {
                itemData.data.qty = Math.max(0, qty - increment);
                if (itemData.data.deleteWhen0 && itemData.data.qty === 0) return this.delete();
            }
            else itemData.data.qty = itemData.data.stacksize ? Math.min(itemData.data.stacksize, qty + increment) : qty + increment;

            if (itemData.data.price) {
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
            if (isDecrease) itemData.data.properties.limitedUsage.use = Math.max(0, qty - increment);
            else itemData.data.properties.limitedUsage.use = Math.min(itemData.data.properties.limitedUsage.maxUse, qty + increment)
            if (itemData.data.properties.limitedUsage.use < 0) itemData.data.properties.limitedUsage.use = 0;
            return this.update(itemData);
        }
    }

}
