/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
import {CofItemSheet} from "./item-sheet.js";

export class CofArmorSheet extends CofItemSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["cof", "sheet", "item", "armor"],
            template: System.templatesPath + "/items/armor-sheet.hbs",
            width: 430,
            height: 430
        });
    }
}
