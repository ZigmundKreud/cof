/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
import {CofActorSheet} from "./actor-sheet.js";
import {System} from "../config.js";

export class CofEncounterSheet extends CofActorSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["cof", "sheet", "actor", "encounter"],
            template: System.templatesPath+"/actors/encounter/encounter-sheet.hbs",
            width: 770,
            height: 740,
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats"}],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Click to open
        html.find('.compendium-pack.capacity-add,.compendium-pack.path-add').click(ev => {
            ev.preventDefault();
            let li = $(ev.currentTarget), pack = game.packs.get(li.data("pack"));
            if ( li.attr("data-open") === "1" ) pack.close();
            else {
                li.attr("data-open", "1");
                li.find("i.folder").removeClass("fa-folder").addClass("fa-folder-open");
                pack.render(true);
            }
        });

        html.find('.weapon-add').click(ev => {
            ev.preventDefault();
            const data = this.getData().data;
            data.weapons = Object.values(data.weapons);
            data.weapons.push({"name":"", "mod":null, "dmg":null});
            this.actor.update({'data.weapons': data.weapons});
        });

        html.find('.weapon-remove').click(ev => {
            ev.preventDefault();
            const elt = $(ev.currentTarget).parents(".weapon");
            const idx = elt.data("itemId");
            const data = this.getData().data;
            data.weapons = Object.values(data.weapons);
            if(data.weapons.length == 1) data.weapons[0] = {"name":"", "mod":null, "dmg":null};
            else data.weapons.splice(idx, 1);
            this.actor.update({'data.weapons': data.weapons});
        });
    }
}
