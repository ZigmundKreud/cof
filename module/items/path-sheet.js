/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
import {CofItemSheet} from "./item-sheet.js";

export class CofPathSheet extends CofItemSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["cof", "sheet", "item", "path"],
            template: System.templatesPath + "/items/path-sheet.hbs",
            width: 430,
            height: 430,
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "details"}],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }

    /* -------------------------------------------- */

    async _onDropCapacityItem(event, itemData) {
        console.log(itemData.data.key);
        console.log(this.item.data);
        let caps = this.item.data.data.capacities;
        caps.push(itemData.data.key);
        console.log(caps);
        return this.item.update({
            "data.capacities" : caps
        });
    }

}
