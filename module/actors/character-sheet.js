/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
import {CofActorSheet} from "./actor-sheet.js";
import {System} from "../config.js";

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

    /* -------------------------------------------- */

    /** @override */
    // getData() {
    //     const data = super.getData();
        // data.worn = Object.values(data.items).filter(item => {
        //     return item.type === "item" && item.data.worn;
        // }).sort(function (a, b) {
        //     const aKey = a.data.subtype + "-" + a.name.slugify({strict: true});
        //     const bKey = b.data.subtype + "-" + b.name.slugify({strict: true});
        //     return (aKey > bKey) ? 1 : -1
        // });
        //
        // data.profile = data.items.find(item => item.type === "profile");
        // data.species = data.items.find(item => item.type === "species");
        // data.paths = data.items.filter(item => item.type === "path");
        // console.log(data.paths.length);
        // data.pathCount = data.paths.length;
        // data.capacities = data.items.filter(item => item.type === "capacity");
        // data.capacities.sort(function (a, b) {
        //     const aKey = a.data.path + "-" + a.data.rank;
        //     const bKey = b.data.path + "-" + b.data.rank;
        //     return (aKey > bKey) ? 1 : -1
        // });
        //
        // data.inventory = data.items.filter(item => item.type === "item");
        // data.inventory.sort(function (a, b) {
        //     const aKey = a.data.subtype + "-" + a.name.slugify({strict: true});
        //     const bKey = b.data.subtype + "-" + b.name.slugify({strict: true});
        //     return (aKey > bKey) ? 1 : -1
        // });
        // return data;
    // }
}
