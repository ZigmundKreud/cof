/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
import {CofItemSheet} from "../items/item-sheet.js";
import {Logger} from "../logger.js";

export class CofShieldSheet extends CofItemSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["cof", "sheet", "item", "shield"],
            template: System.templatesPath + "/items/shield-sheet.hbs",
            width: 430,
            height: 430
        });
    }
}
