/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */

export class CofItem extends Item {

    /** @override */
    prepareData() {
        super.prepareData();
        const itemData = this.data;
        const actorData = (this.actor) ? this.actor.data : null;
        // console.log(itemData);
        if(itemData.data.properties?.protection) this._prepareArmorData(itemData);
        if(itemData.data.properties?.weapon) this._prepareWeaponData(itemData, actorData);
        // itemData.data.key = itemData.name.slugify({strict: true});
    }

    _prepareArmorData(itemData) {
        itemData.data.def = parseInt(itemData.data.defBase, 10) + parseInt(itemData.data.defBonus, 10);
    }

    _prepareWeaponData(itemData, actorData) {
        // console.log(itemData.data.subtype);
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
