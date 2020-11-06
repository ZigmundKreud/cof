/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
import {Capacity} from "../controllers/capacity.js";
import {Path} from "../controllers/path.js";
import {Profile} from "../controllers/profile.js";
import {Species} from "../controllers/species.js";
import {CofRoll} from "../controllers/roll.js";
import {Traversal} from "../utils/traversal.js";

export class CofActorSheet extends ActorSheet {

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        // Click to open
        html.find('.compendium-pack').dblclick(ev => {
            ev.preventDefault();
            let li = $(ev.currentTarget), pack = game.packs.get(li.data("pack"));
            if (li.attr("data-open") === "1") pack.close();
            else {
                li.attr("data-open", "1");
                pack.render(true);
            }
        });

        // Click to open
        html.find('.item-create.compendium-pack').click(ev => {
            ev.preventDefault();
            let li = $(ev.currentTarget), pack = game.packs.get(li.data("pack"));
            if (li.attr("data-open") === "1") pack.close();
            else {
                li.attr("data-open", "1");
                pack.render(true);
            }
        });

        // Initiate a roll
        html.find('.rollable').click(ev => {
            ev.preventDefault();
            return this._onRoll(ev);
        });

        // Check/Uncheck capacities
        html.find('.capacity-checked').click(ev => {
            ev.preventDefault();
            return Capacity.toggleCheck(this.actor, ev, true);
        });
        html.find('.capacity-unchecked').click(ev => {
            ev.preventDefault();
            return Capacity.toggleCheck(this.actor, ev, false);
        });
        html.find('.capacity-create').click(ev => {
            ev.preventDefault();
            return Capacity.create(this.actor, ev);
        });
        html.find('.capacity-toggle').click(ev => {
            ev.preventDefault();
            const li = $(ev.currentTarget).closest(".capacity");
            li.find(".capacity-description").slideToggle(200);
        });

        // Equip/Unequip items
        html.find('.item-equip').click(ev => {
            ev.preventDefault();
            const elt = $(ev.currentTarget).parents(".item");
            const item = this.actor.getOwnedItem(elt.data("itemId"));
            let itemData = item.data;
            itemData.data.worn = !itemData.data.worn;
            return this.actor.updateOwnedItem(itemData).then(() => this.render(true));
        });

        html.find('.item-qty').click(ev => {
            ev.preventDefault();
            const li = $(ev.currentTarget).closest(".item");
            const item = this.actor.getOwnedItem(li.data("itemId"));
            let itemData = item.data;
            itemData.data.qty = (itemData.data.qty) ? itemData.data.qty + 1 : 1;
            return this.actor.updateOwnedItem(itemData).then(() => this.render(true));
        });
        html.find('.item-qty').contextmenu(ev => {
            ev.preventDefault();
            const li = $(ev.currentTarget).closest(".item");
            const item = this.actor.getOwnedItem(li.data("itemId"));
            let itemData = item.data;
            itemData.data.qty = (itemData.data.qty > 0) ? itemData.data.qty -1 : 0;
            return this.actor.updateOwnedItem(itemData).then(() => this.render(true));
        });

        html.find('.item-name, .item-edit').click(this._onEditItem.bind(this));
        html.find('.item-delete').click(ev => {
            return this._onDeleteItem(ev);
        });
    }

    async _onEditItem(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("itemId");
        const type = (li.data("itemType")) ? li.data("itemType") : "item";
        const pack = (li.data("pack")) ? li.data("pack") : null;

        let entity = null;
        // look first in actor onwed items
        entity = this.actor.getOwnedItem(id);
        if(!entity) {
            // look into world/compendiums items
            entity = await Traversal.getEntity(id, type, pack);
        }
        if(entity) return entity.sheet.render(true);
    }

    /* -------------------------------------------- */
    /* DELETE EVENTS CALLBACKS                      */
    /* -------------------------------------------- */

    /**
     * Callback on delete item actions
     * @param event the roll event
     * @private
     */
    _onDeleteItem(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const itemId = li.data("itemId");
        const entity = this.actor.items.find(item => item._id === itemId);
        switch (entity.data.type) {
            case "capacity" :
                return this.actor.deleteOwnedItem(itemId);
                // return Capacity.removeFromActor(this.actor, event, entity);
                break;
            case "path" :
                return Path.removeFromActor(this.actor, event, entity);
                break;
            case "profile" :
                return Profile.removeFromActor(this.actor, event, entity);
                break;
            case "species" :
                return Species.removeFromActor(this.actor, event, entity);
                break;
            default: {
                return this.actor.deleteOwnedItem(itemId);
            }
        }
    }

    /* -------------------------------------------- */
    /* ROLL EVENTS CALLBACKS                        */
    /* -------------------------------------------- */

    /**
     * Initiates a roll from any kind depending on the "data-roll-type" attribute
     * @param event the roll event
     * @private
     */
    _onRoll(event) {
        const elt = $(event.currentTarget)[0];
        const rolltype = elt.attributes["data-roll-type"].value;
        switch (rolltype) {
            case "skillcheck" :
                return CofRoll.skillCheck(this.getData().data, this.actor, event);
                break;
            case "weapon" :
                return CofRoll.rollWeapon(this.getData().data, this.actor, event);
                break;
            case "encounter-weapon" :
                return CofRoll.rollEncounterWeapon(this.getData().data, this.actor, event);
                break;
            case "encounter-damage" :
                return CofRoll.rollEncounterDamage(this.getData().data, this.actor, event);
                break;
            case "spell" :
                return CofRoll.rollSpell(this.getData().data, this.actor, event);
                break;
            case "damage" :
                return CofRoll.rollDamage(this.getData().data, this.actor, event);
                break;
            case "hp" :
                return CofRoll.rollHitPoints(this.getData().data, this.actor, event);
                break;
            case "attributes" :
                return CofRoll.rollAttributes(this.getData().data, this.actor, event);
                break;
        }
    }

    /* -------------------------------------------- */
    /* DROP EVENTS CALLBACKS                        */
    /* -------------------------------------------- */

    /** @override */
    async _onDrop(event) {
        event.preventDefault();
        // Get dropped data
        let data;
        try {
            data = JSON.parse(event.dataTransfer.getData('text/plain'));
        } catch (err) {
            return false;
        }
        if (!data) return false;

        // Case 1 - Dropped Item
        if (data.type === "Item") {
            return this._onDropItem(event, data);
        }

        // Case 2 - Dropped Actor
        if (data.type === "Actor") {
            return this._onDropActor(event, data);
        }
    }

    /**
     * Handle dropping an Actor on the sheet to trigger a Polymorph workflow
     * @param {DragEvent} event   The drop event
     * @param {Object} data       The data transfer
     * @private
     */
    async _onDropActor(event, data) {
        return false;
    }

    /**
     * Handle dropping of an item reference or item data onto an Actor Sheet
     * @param {DragEvent} event     The concluding DragEvent which contains drop data
     * @param {Object} data         The data transfer extracted from the event
     * @return {Object}             OwnedItem data to create
     * @private
     */
    async _onDropItem(event, data) {
        if (!this.actor.owner) return false;
        // let authorized = true;

        // let itemData = await this._getItemDropData(event, data);
        const item = await Item.fromDropData(data);
        const itemData = duplicate(item.data);
        switch (itemData.type) {
            case "path"    :
                return await Path.addToActor(this.actor, event, itemData);
            case "profile" :
                return await Profile.addToActor(this.actor, event, itemData);
            case "species" :
                return await Species.addToActor(this.actor, event, itemData);
            case "capacity" :
            case "shield" :
            case "armor" :
            case "melee" :
            case "ranged" :
            default:
                // activate the capacity as it is droped on an actor sheet
                // if (itemData.type === "capacity") itemData.data.checked = true;
                // Handle item sorting within the same Actor
                const actor = this.actor;
                let sameActor = (data.actorId === actor._id) || (actor.isToken && (data.tokenId === actor.token.id));
                if (sameActor) return this._onSortItem(event, itemData);
                // Create the owned item
                return this.actor.createEmbeddedEntity("OwnedItem", itemData);
        }
        // if (authorized) {
        //     // Handle item sorting within the same Actor
        //     const actor = this.actor;
        //     let sameActor = (data.actorId === actor._id) || (actor.isToken && (data.tokenId === actor.token.id));
        //     if (sameActor) return this._onSortItem(event, itemData);
        //     // Create the owned item
        //     return this.actor.createEmbeddedEntity("OwnedItem", itemData);
        // } else {
        //     return false;
        // }
    }

    /* -------------------------------------------- */

    /** @override */
    setPosition(options = {}) {
        const position = super.setPosition(options);
        const sheetBody = this.element.find(".sheet-body");
        const bodyHeight = position.height - 192;
        sheetBody.css("height", bodyHeight);
        return position;
    }

}
