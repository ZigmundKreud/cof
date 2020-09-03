/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */

import {Logger} from "../logger.js";

export class CofItem extends Item {

    /** @override */
    prepareData() {
        super.prepareData();

        const itemData = this.data;
        switch (itemData.type) {
            case "path" : this._preparePathData(itemData); break;
            case "armor" :
            case "capacity" :
            case "item" :
            case "melee" :
            case "profile" :
            case "ranged" :
            case "shield" :
            case "species" :
            case "spell" :
            case "trapping" :
            default : break;
        }
    }

    _preparePathData(itemData) {
        Logger.log(itemData);
        if(!itemData.data.id && itemData.data.key) itemData.data.id = itemData.data.key;
        if(itemData.data.id.includes(",") && itemData.data.key) itemData.data.id = itemData.data.key;
    }

}
