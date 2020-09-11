/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */

export class CofItem extends Item {

    /** @override */
    prepareData() {
        super.prepareData();

        const itemData = this.data;
        switch (itemData.type) {
            case "capacity" : this._prepareCapacityData(itemData); break;
            case "profile" :
            case "species" :
            case "path" : this._preparePathData(itemData); break;
            case "melee" :
            case "ranged" :
            case "shield" :
            case "spell" :
            case "armor" :
            case "item" :
            case "trapping" :
            default : break;
        }
    }

    _prepareCapacityData(itemData) {
        // if(!itemData.data.key){
        if(itemData.data.path && itemData.data.rank){
            // const key = StringUtils.toKey(itemData.data.path + " " + itemData.data.rank);
            // const existsInPack = COF.capacities.filter(item => item.data.key === key).length;
            // const existsInGame = game.items.filter(item => item.data.key === key).length;
            // if(existsInPack > 0 || existsInGame > 0){
            //     const idx = existsInPack + existsInGame + 1;
            //     itemData.data.key = StringUtils.toKey(itemData.data.path + " " + itemData.data.rank)+"-"+idx;
            // }
            // else {
            //     itemData.data.key = StringUtils.toKey(itemData.data.path + " " + itemData.data.rank);
            // }
            // Logger.log(itemData.data.key);
        }
        // }
    }

    _preparePathData(itemData) {
        if(!itemData.data.key){
            itemData.data.key = StringUtils.toKey(itemData.name);
        }
    }

    // _prepareWeaponData(itemData) {
    //     let r = new Roll(itemData.data.dmgFormula, {dmgBase : itemData.data.dmgBase, dmgStat : itemData.data.dmgStat, dmgBonus : itemData.data.dmgBonus});
    //     console.log(r.formula);
    //     itemData.data.dmg = r.formula;
    // }
}
