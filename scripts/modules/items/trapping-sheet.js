/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
import {CofItemSheet} from "../items/item-sheet.js";
import {Logger} from "../logger.js";

export class CofTrappingSheet extends CofItemSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["cof", "sheet", "item", "trapping"],
            template: System.templatesPath + "/items/trapping-sheet.hbs",
            width: 430,
            height: 430,
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}]
        });
    }
}
