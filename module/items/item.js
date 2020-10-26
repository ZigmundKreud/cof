/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */

export class CofItem extends Item {

    /** @override */
    prepareData() {
        super.prepareData();
        const itemData = this.data;
        // console.log(itemData);
        const actorData = (this.actor) ? this.actor.data : null;
        switch (itemData.type) {
            case "armor" :
                this._prepareArmorData(itemData, actorData);
                break;
            case "melee" :
            case "ranged" :
            case "spell" :
                this._prepareWeaponData(itemData, actorData);
                break;
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
            case "species" :
            case "item" :
            case "trapping" :
            default :
                break;
        }
    }

    _prepareCapacityData(itemData, actorData) {
        console.debug("_prepareCapacityData");
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
        console.debug("_preparePathData");
        // console.log(actorData);
        if (!itemData.data.key) itemData.data.key = itemData.name.slugify({strict: true});
    }

    _prepareArmorData(itemData, actorData) {
        console.debug("_prepareArmorData");
        itemData.data.def = parseInt(itemData.data.defBase, 10) + parseInt(itemData.data.defBonus, 10);
    }

    _prepareWeaponData(itemData, actorData) {
        console.debug("_prepareMeleeData");
        itemData.data.skillBonus = (itemData.data.skillBonus) ? itemData.data.skillBonus : 0;
        itemData.data.dmgBonus = (itemData.data.dmgBonus) ? itemData.data.dmgBonus : 0;
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
}
