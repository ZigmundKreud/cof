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
                // return this.actor.update(updateData).then(() => {
                //     this.actor.applyActiveEffects();
                //     return this.render(true);
                // });
                return this.actor.update(updateData);
            }

            // this.getData().then(data => {
            //     let effects = data.effects;
            //     const effect = effects.find(e => e._id === effectId);
            //     if(effect){
            //         effect.disabled = !effect.disabled;
            //         return this.actor.update({effects:effects}).then(() => this.render(true));
            //     }
            // });

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

            // let effects = this.actor.effects;
            // const effect = effects.get(elt.data("effectId"));
            // if(effect){
            //     ArrayUtils.remove(effects, effect);
            //     return this.actor.update({effects:effects}).then(() => this.render(true));
            // }
            // this.getData().then(data => {
            //     let effects = data.effects;
            //     const effect = effects.find(e => e._id === elt.data("effectId"));
            //     if(effect){
            //         ArrayUtils.remove(effects, effect);
            //         return this.actor.update({effects:effects}).then(() => this.render(true));
            //     }
            // });
        });


        // Items controls
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

        html.find('.item-consume').click(ev => {
            ev.preventDefault();
            const li = $(ev.currentTarget).closest(".item");
            const item = this.actor.getOwnedItem(li.data("itemId"));
            let itemData = item.data;
            itemData.data.qty = (itemData.data.qty > 0) ? itemData.data.qty - 1 : 0;
            return this.actor.updateOwnedItem(itemData).then(() => this.render(true));
        });

        html.find('.item-qty').contextmenu(ev => {
            ev.preventDefault();
            const li = $(ev.currentTarget).closest(".item");
            const item = this.actor.getOwnedItem(li.data("itemId"));
            let itemData = item.data;
            itemData.data.qty = (itemData.data.qty > 0) ? itemData.data.qty - 1 : 0;
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
        if (!entity) {
            // look into world/compendiums items
            entity = await Traversal.getEntity(id, type, pack);
        }
        if (entity) return entity.sheet.render(true);
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

    /* -------------------------------------------- */

    /** @override */
    getData(options) {
        const data = super.getData(options);
        data.worn = {};
        data.worn.armor = Object.values(data.items).filter(item => {
            return item.type === "item" && item.data.subtype === "armor" && item.data.worn;
        }).sort(function (a, b) {
            const aKey = a.data.subtype + "-" + a.name.slugify({strict: true});
            const bKey = b.data.subtype + "-" + b.name.slugify({strict: true});
            return (aKey > bKey) ? 1 : -1
        });

        data.worn.melee = Object.values(data.items).filter(item => {
            return item.type === "item" && item.data.subtype === "melee" && item.data.worn;
        }).sort(function (a, b) {
            const aKey = a.data.subtype + "-" + a.name.slugify({strict: true});
            const bKey = b.data.subtype + "-" + b.name.slugify({strict: true});
            return (aKey > bKey) ? 1 : -1
        });

        data.worn.ranged = Object.values(data.items).filter(item => {
            return item.type === "item" && item.data.subtype === "ranged" && item.data.worn;
        }).sort(function (a, b) {
            const aKey = a.data.subtype + "-" + a.name.slugify({strict: true});
            const bKey = b.data.subtype + "-" + b.name.slugify({strict: true});
            return (aKey > bKey) ? 1 : -1
        });

        data.worn.shield = Object.values(data.items).filter(item => {
            return item.type === "item" && item.data.subtype === "shield" && item.data.worn;
        }).sort(function (a, b) {
            const aKey = a.data.subtype + "-" + a.name.slugify({strict: true});
            const bKey = b.data.subtype + "-" + b.name.slugify({strict: true});
            return (aKey > bKey) ? 1 : -1
        });

        data.worn.spell = Object.values(data.items).filter(item => {
            return item.type === "item" && item.data.subtype === "spell" && item.data.worn;
        }).sort(function (a, b) {
            const aKey = a.data.subtype + "-" + a.name.slugify({strict: true});
            const bKey = b.data.subtype + "-" + b.name.slugify({strict: true});
            return (aKey > bKey) ? 1 : -1
        });

        data.profile = data.items.find(item => item.type === "profile");
        data.species = data.items.find(item => item.type === "species");
        data.paths = data.items.filter(item => item.type === "path");
        data.pathCount = data.paths.length;

        data.inventory = data.items.filter(item => item.type === "item").sort(function (a, b) {
            const aKey = a.data.subtype + "-" + a.name.slugify({strict: true});
            const bKey = b.data.subtype + "-" + b.name.slugify({strict: true});
            return (aKey > bKey) ? 1 : -1
        });

        data.capacities = data.items.filter(item => item.type === "capacity").sort(function (a, b) {
            const aKey = a.data.path + "-" + a.data.rank;
            const bKey = b.data.path + "-" + b.data.rank;
            return (aKey > bKey) ? 1 : -1
        });

        // const sampleEffect = {
        //     _id: "9anBIg21fTkRwVNq",
        //     label: "Force de taureau",
        //     icon: "worlds/_assets/icons/svg/biceps.svg",
        //     origin: "Actor.Pom8t7gHbjhWLr1o",
        //     tint: "#fff101",
        //     changes: [
        //         {
        //             key: "data.abilities.str.value",
        //             mode: 2,
        //             value: 4
        //         }
        //     ],
        //     disabled: true,
        //     duration: {
        //         startTime: null,
        //         seconds: null,
        //         rounds: 10,
        //         turns: null,
        //         startRound: null,
        //         startTurn: null,
        //     },
        //     flags: {}
        // };

        data.effects = data.actor.effects;

        return Traversal.getIndex().then(index => {
            data.paths = data.paths.map(path => {
                path.capacities = path.data.capacities.map(capId => {
                    let cap = index[capId];
                    if (data.items.find(i => i.flags?.cof?.sourceId === capId)) {
                        cap.checked = true;
                    } else cap.checked = false;
                    return cap;
                });
                return path;
            });
            return data;
        });
    }
}
