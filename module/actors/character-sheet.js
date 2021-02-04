/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
import {CofActorSheet} from "./actor-sheet.js";
import {System} from "../system/config.js";

export class CofCharacterSheet extends CofActorSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["cof", "sheet", "actor", "character"],
            template: System.templatesPath + "/actors/character/character-sheet.hbs",
            width: 950,
            height: 670,
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats"}],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }

    /** @override */
    // setPosition(options = {}) {
    //     const position = super.setPosition(options);
    //     const sheetBody = this.element.find(".sheet-body");
    //     const bodyHeight = position.height - 192;
    //     sheetBody.css("height", bodyHeight);
    //     return position;
    // }

}
