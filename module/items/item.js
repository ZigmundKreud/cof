/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */

export class CofItem extends Item {

    initialize() {
        try {
            this.prepareData();
        } catch(err) {
            console.error(`Failed to initialize data for ${this.constructor.name} ${this.id}:`);
            console.error(err);
        }
    }

    /** @override */
    prepareData() {
        super.prepareData();
        const itemData = this.data;
        // if(Object.keys(this.data.flags).length>0) console.log(this.data);
        // console.log(itemData);
        const actorData = (this.actor) ? this.actor.data : null;
        switch (itemData.type) {
            case "item" :
                this._prepareArmorData(itemData, actorData);
                this._prepareWeaponData(itemData, actorData);
                break;
            case "armor" :
                this._prepareArmorData(itemData, actorData);
                break;
            case "melee" :
            case "ranged" :
                this._prepareWeaponData(itemData, actorData);
                break;
            case "spell" :
            case "shield" :
                this._prepareArmorData(itemData, actorData);
                this._prepareWeaponData(itemData, actorData);
                break;
            case "capacity" :
                this._prepareCapacityData(itemData, actorData);
                break;
            case "path" :
                this._preparePathData(itemData, actorData);
                break;
            case "profile" :
                this._prepareProfileData(itemData, actorData);
                break;
            case "species" :
                this._prepareSpeciesData(itemData, actorData);
                break;
            case "trapping" :
                break;
            default :
                break;
        }
    }

    _prepareCapacityData(itemData, actorData) {
        // console.log(actorData);
        itemData.data.key = itemData.name.slugify({strict: true});
        // if (!itemData.data.key) {
            // if (itemData.data.path && itemData.data.rank) {
            //     const key = StringUtils.toKey(itemData.data.path + " " + itemData.data.rank);
            //     const existsInPack = COF.capacities.filter(item => item.data.key === key).length;
            //     const existsInGame = game.items.filter(item => item.data.key === key).length;
            //     if (existsInPack > 0 || existsInGame > 0) {
            //         const idx = existsInPack + existsInGame + 1;
            //         itemData.data.key = StringUtils.toKey(itemData.data.path + " " + itemData.data.rank) + "-" + idx;
            //     } else {
            //         itemData.data.key = StringUtils.toKey(itemData.data.path + " " + itemData.data.rank);
            //     }
            //     console.log(itemData.data.key);
            // }
        // }
    }

    _preparePathData(itemData, actorData) {
        // console.log(itemData);
        if (!itemData.data.key) itemData.data.key = itemData.name.slugify({strict: true});
        // let caps = COF.capacities.filter(c => {
        //     console.log(c);
        //     return c.data.path === itemData.data.key
        // });
        // console.log(caps);
    }

    _prepareArmorData(itemData, actorData) {
        itemData.data.def = parseInt(itemData.data.defBase, 10) + parseInt(itemData.data.defBonus, 10);
    }

    _prepareShieldData(itemData, actorData) {
        this._prepareArmorData(itemData, actorData);
        this._prepareWeaponData(itemData, actorData);
    }

    _prepareWeaponData(itemData, actorData) {
        itemData.data.skillBonus = (itemData.data.skillBonus) ? itemData.data.skillBonus : 0;
        itemData.data.dmgBonus = (itemData.data.dmgBonus) ? itemData.data.dmgBonus : 0;
        // console.log(actorData);
        if (actorData) {
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

    _prepareProfileData(itemData, actorData) {
        // console.log(itemData);
        if (!itemData.data.key) itemData.data.key = itemData.name.slugify({strict: true});
    }

    _prepareSpeciesData(itemData, actorData) {
        // console.log(itemData);
        if (!itemData.data.key) itemData.data.key = itemData.name.slugify({strict: true});
    }


}
