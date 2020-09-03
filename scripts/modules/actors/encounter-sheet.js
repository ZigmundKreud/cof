/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
import {CofActorSheet} from "./actor-sheet.js";

export class CofEncounterSheet extends CofActorSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["cof", "sheet", "actor", "encounter"],
            template: System.templatesPath+"/actors/encounter-sheet.hbs",
            width: 770,
            height: 700,
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats"}],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Click to open
        html.find('.compendium-pack.capacity-add').click(ev => {
            ev.preventDefault();
            let li = $(ev.currentTarget), pack = game.packs.get(li.data("pack"));
            if ( li.attr("data-open") === "1" ) pack.close();
            else {
                li.attr("data-open", "1");
                li.find("i.folder").removeClass("fa-folder").addClass("fa-folder-open");
                pack.render(true);
            }
        });

        html.find('.attack-add').click(ev => {
            ev.preventDefault();
            const elt = $(ev.currentTarget).parents(".attack");
            const idx = elt.data("itemId");
            const data = this.getData().data;
            console.log(data.attacks);
            console.log(Object.entries(data.attacks));
            data.attacks = Object.values(data.attacks);
            data.attacks.push({"name":"", "mod":null, "dmg":null});
            this.actor.update({'data.attacks': data.attacks});
        });

        html.find('.attack-remove').click(ev => {
            ev.preventDefault();
            const elt = $(ev.currentTarget).parents(".attack");
            const idx = elt.data("itemId");
            const data = this.getData().data;
            console.log(data.attacks);
            console.log(Object.entries(data.attacks));
            data.attacks = Object.values(data.attacks);
            if(data.attacks.length == 1) data.attacks[0] = {"name":"", "mod":null, "dmg":null};
            else data.attacks.splice(idx, 1);
            this.actor.update({'data.attacks': data.attacks});
        });
    }
}
