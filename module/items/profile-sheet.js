/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
import {CofItemSheet} from "./item-sheet.js";

export class CofProfileSheet extends CofItemSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["cof", "sheet", "item", "profile"],
            template: System.templatesPath + "/items/profile-sheet.hbs",
            width: 430,
            height: 430,
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }

    /* -------------------------------------------- */

    async _onDropCapacityItem(event, itemData) {
        console.log(itemData);
        return false;
    }

    /* -------------------------------------------- */

    async _onDropPathItem(event, itemData) {
        console.log(itemData);
        return false;
    }

}
