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
import {ArrayUtils} from "../utils/array-utils.js";
import {Inventory} from "../controllers/inventory.js";

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
        // Click to open
        // html.find('.compendium-pack.capacity-add,.compendium-pack.path-add').click(ev => {
        //     ev.preventDefault();
        //     let li = $(ev.currentTarget), pack = game.packs.get(li.data("pack"));
        //     if ( li.attr("data-open") === "1" ) pack.close();
        //     else {
        //         li.attr("data-open", "1");
        //         li.find("i.folder").removeClass("fa-folder").addClass("fa-folder-open");
        //         pack.render(true);
        //     }
        // });


        // Initiate a roll
        html.find('.rollable').click(ev => {
            ev.preventDefault();
            return this._onRoll(ev);
        });
        // Items controls
        html.find('.inventory-consume').click(this._onConsume.bind(this));
        html.find('.inventory-equip').click(this._onToggleEquip.bind(this));
        html.find('.inventory-qty').click(this._onIncrease.bind(this));
        html.find('.inventory-qty').contextmenu(this._onDecrease.bind(this));
        html.find('.item-edit').click(this._onEditItem.bind(this));
        html.find('div.item-name').click(this._onEditItem.bind(this));
        html.find('.item-delete').click(this._onDeleteItem.bind(this));
        html.find('.foldable h3.item-name').click(ev => {
            ev.preventDefault();
            const li = $(ev.currentTarget);
            const ol = li.parents('.inventory-list');
            const itemList = ol.find('.item-list');
            itemList.slideToggle( "fast", function() {
                ol.toggleClass("folded");
            });
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
        // Effects controls
        html.find('.effect-disable').click(ev => {
            ev.preventDefault();
            const elt = $(ev.currentTarget).parents(".effect");
            const effectId = elt.data("effectId");
            let updateData = duplicate(this.actor);
            let effects = updateData.effects;
            const effect = effects.find(e => e._id === effectId);
            if(effect){
                effect.disabled = !effect.disabled;
                return this.actor.update(updateData);
            }
        });
        html.find('.effect-create').click(ev => {
            ev.preventDefault();
            return ActiveEffect.create({
                label: "New Effect",
                icon: "/systems/cof/ui/icons/effects/aura.svg",
                origin: this.actor.uuid,
                "duration.rounds": undefined,
                disabled: true
            }, this.actor).create();
        });
        html.find('.effect-edit').click(ev => {
            ev.preventDefault();
            const elt = $(ev.currentTarget).parents(".effect");
            let effects = this.actor.effects;
            const effect = effects.get(elt.data("effectId"));
            if(effect){
                return new ActiveEffectConfig(effect, {}).render(true);
            }
        });
        html.find('.effect-delete').click(ev => {
            ev.preventDefault();
            const elt = $(ev.currentTarget).parents(".effect");
            const effectId = elt.data("effectId");
            let updateData = duplicate(this.actor);
            let effects = updateData.effects;
            const effect = effects.find(e => e._id === effectId);
            if(effect){
                ArrayUtils.remove(effects, effect);
                // return this.actor.update(updateData).then(() => {
                //     return this.render(true);
                // });
                return this.actor.update(updateData);
            }
        });
    }

    /* -------------------------------------------- */
    /* ITEMS MANAGEMENT                             */
    /* -------------------------------------------- */
    _onIncrease(event) {
        event.preventDefault();
        return Inventory.onModifyQuantity(this.actor, event, 1, false);
    }
    _onDecrease(event) {
        event.preventDefault();
        return Inventory.onModifyQuantity(this.actor, event, 1, true);
    }
    _onToggleEquip(event) {
        event.preventDefault();
        AudioHelper.play({src: "/systems/cof/sounds/sword.mp3", volume: 0.8, autoplay: true, loop: false}, true);
        return Inventory.onToggleEquip(this.actor, event);
    }

    /**
     * Callbacks on consume actions
     * @param event
     * @private
     */
    _onConsume(event) {
        event.preventDefault();
        AudioHelper.play({src: "/systems/cof/sounds/gulp.mp3", volume: 0.8, autoplay: true, loop: false}, true);
        return Inventory.onConsume(this.actor, event);
    }

    /**
     * Callback on delete item actions
     * @param event
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

    /**
     * Callback on render item actions
     * @param event
     * @private
     */
    _onEditItem(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("itemId");
        const type = (li.data("itemType")) ? li.data("itemType") : "item";
        const pack = (li.data("pack")) ? li.data("pack") : null;

        // look first in actor onwed items
        let entity = this.actor.getOwnedItem(id);
        return (entity) ? entity.sheet.render(true) : Traversal.getEntity(id, type, pack).then(e => e.sheet.render(true));
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
                return this.getData().then(data => {
                    CofRoll.skillCheck(data.data, this.actor, event)
                });
            case "weapon" :
                return this.getData().then(data => {
                    CofRoll.rollWeapon(data.data, this.actor, event)
                });
            case "encounter-weapon" :
                return this.getData().then(data => {
                    CofRoll.rollEncounterWeapon(data.data, this.actor, event)
                });
            case "encounter-damage" :
                return this.getData().then(data => {
                    CofRoll.rollEncounterDamage(data.data, this.actor, event)
                });
            case "spell" :
                return this.getData().then(data => {
                    CofRoll.rollSpell(data.data, this.actor, event)
                });
            case "damage" :
                return this.getData().then(data => {
                    CofRoll.rollDamage(data.data, this.actor, event)
                });
            case "hp" :
                return this.getData().then(data => {
                    CofRoll.rollHitPoints(data.data, this.actor, event)
                });
            case "attributes" :
                return this.getData().then(data => {
                    CofRoll.rollAttributes(data.data, this.actor, event)
                });
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
            return false; // NOT AUTHORIZED
        }
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
    /* DATA CONSOLIDATION FOR TEMPLATE RENDERING    */
    /* -------------------------------------------- */

    /** @override */
    getData(options={}) {
        const data = super.getData(options);
        console.log(data);
        return Traversal.getIndex().then(index => {
            data.config = game.cof.config;
            data.profile = data.items.find(item => item.type === "profile");
            data.species = data.items.find(item => item.type === "species");
            data.paths = data.items.filter(item => item.type === "path").map(path => {
                path.capacities = path.data.capacities.map(capId => {
                    let cap = index[capId];
                    if (data.items.find(i => i.flags?.cof?.sourceId === capId)) {
                        cap.checked = true;
                    } else cap.checked = false;
                    return cap;
                });
                return path;
            });

            data.pathCount = data.paths.length;

            data.combat = {
                count : data.items.filter(i => i.data.worn).length,
                categories:[]
            };
            data.inventory = {
                count : data.items.filter(i => i.type === "item").length,
                categories:[]
            };
            for(const category of Object.keys(game.cof.config.itemCategories)){
                data.combat.categories.push({
                    id : category,
                    label : game.cof.config.itemCategories[category],
                    items : Object.values(data.items).filter(item => item.type === "item" && item.data.subtype === category && item.data.worn).sort((a, b) => (a.name > b.name) ? 1 : -1)
                });
                data.inventory.categories.push({
                    id : category,
                    label : "COF.category."+category,
                    items : Object.values(data.items).filter(item => item.type === "item" && item.data.subtype === category).sort((a, b) => (a.name > b.name) ? 1 : -1)
                });
            }

            const paths = data.items.filter(item => item.type === "path");
            data.capacities = {
                count : data.items.filter(item => item.type === "capacity").length,
                collections : []
            }
            data.capacities.collections.push({
                id : "standalone-capacities",
                label : "Capacités actives",
                items : Object.values(data.items).filter(item => item.type === "capacity" && !item.data.path).sort((a, b) => (a.name > b.name) ? 1 : -1)
            });
            for(const path of paths){
                data.capacities.collections.push({
                    id : path.data.key,
                    label : path.name,
                    items : Object.values(data.items).filter(item => item.type === "capacity" && item.data.path?.data.key === path.data.key)
                        .sort((a, b) => (a.data.rank > b.data.rank) ? 1 : -1)
                });
            }

            // data.capacities = data.items.filter(item => item.type === "capacity").sort(function (a, b) {
            //     const aKey = a.data.path + "-" + a.data.rank;
            //     const bKey = b.data.path + "-" + b.data.rank;
            //     return (aKey > bKey) ? 1 : -1
            // });


            data.effects = data.actor.effects;

            return data;
        });
    }
}
