/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
import { Capacity } from "../controllers/capacity.js";
import { Path } from "../controllers/path.js";
import { Profile } from "../controllers/profile.js";
import { Species } from "../controllers/species.js";
import { CofRoll } from "../controllers/roll.js";
import { Traversal } from "../utils/traversal.js";
import { ArrayUtils } from "../utils/array-utils.js";
import { Inventory } from "../controllers/inventory.js";
import { System } from "../system/config.js";
import { CofBaseSheet } from "./base-sheet.js";

export class CofActorSheet extends CofBaseSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["cof", "sheet", "actor"],
            template: System.templatesPath + "/actors/actor-sheet.hbs",
            width: 950,
            height: 720,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }],
            dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }]
        });
    }  

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        // Click right to open the compendium
        html.find('.compendium-pack').contextmenu(ev => {
            ev.preventDefault();
            const li = $(ev.currentTarget);
            const pack = game.packs.get(this.getPackPrefix() + "." + li.data("pack"));
            if (pack) {
                if (li.attr("data-open") === "1") {
                    li.attr("data-open", "0");
                    pack.close();                    
                }
                else {
                    li.attr("data-open", "1");
                    pack.render(true);
                }
            }
        });
        // Click to open
        html.find('.item-create.compendium-pack').click(ev => {
            ev.preventDefault();
            let li = $(ev.currentTarget), pack = game.packs.get(this.getPackPrefix() + "." + li.data("pack"));
            if (li.attr("data-open") === "1") {
                li.attr("data-open", "0");
                pack.close();
            }
            else {
                li.attr("data-open", "1");
                pack.render(true);
            }
        });

        // Initiate a roll with a left click
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
        html.find('.item .item-name h4').click(this._onItemSummary.bind(this));
        html.find('.item-delete').click(this._onDeleteItem.bind(this));
        html.find('.foldable h3.item-name').click(ev => {
            ev.preventDefault();
            const li = $(ev.currentTarget);
            const ol = li.parents('.inventory-list');
            const tab = ol.data('tab');
            const category = ol.data('category');
            const itemList = ol.find('.item-list');
            const actor = this.actor;
            itemList.slideToggle("fast", function () {
                ol.toggleClass("folded");
                if (actor.data.data.settings) {
                    if (ol.hasClass("folded")) {
                        if (!actor.data.data.settings[tab].folded.includes(category)) {
                            actor.data.data.settings[tab].folded.push(category);
                        }
                    } else {
                        ArrayUtils.remove(actor.data.data.settings[tab].folded, category)
                    }
                }
                actor.update({ "data.settings": actor.data.data.settings })
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
        html.find('.effect-toggle').click(ev => {
            ev.preventDefault();
            const elt = $(ev.currentTarget).parents(".effect");
            const effectId = elt.data("itemId");
            let updateData = duplicate(this.actor);
            let effects = updateData.effects;
            const effect = effects.find(e => e._id === effectId);
            if (effect) {
                effect.disabled = !effect.disabled;
                return this.actor.update(updateData);
                // .then(a => {
                //     if(a instanceof Token) {
                //         return a.toggleEffect(effect);
                //     }
                //     else {
                //         console.log(a);
                //         let tokens = canvas.tokens.objects.children.filter(t => t.data.actorId === this.actor._id);
                //         console.log(tokens);
                //         // for(let t of tokens){
                //         //     t.toggleEffect(effect);
                //         // }
                //         // return canvas.tokens.objects.children.filter(t => t.data.actorId === this.actor._id).map(t => t.toggleEffect(effect));
                //     }
                // });
            }
        });
        html.find('.effect-create').click(ev => {
            ev.preventDefault();
            return ActiveEffect.create({
                label: game.i18n.localize("COF.ui.newEffect"),
                icon: "icons/svg/aura.svg",
                origin: this.actor.uuid,
                "duration.rounds": undefined,
                disabled: true
            }, this.actor).create();
        });
        html.find('.effect-edit').click(this._onEditItem.bind(this));
        html.find('.effect-delete').click(ev => {
            ev.preventDefault();
            const elt = $(ev.currentTarget).parents(".effect");
            const effectId = elt.data("itemId");
            let updateData = duplicate(this.actor);
            let effects = updateData.effects;
            const effect = effects.find(e => e._id === effectId);
            if (effect) {
                ArrayUtils.remove(effects, effect);
                return this.actor.update(updateData);
            }
        });

        // WEAPONS (Encounters)
        html.find('.weapon-add').click(ev => {
            ev.preventDefault();
            const data = this.getData().data;
            data.weapons = Object.values(data.weapons);
            data.weapons.push({ "name": "", "mod": null, "dmg": null });
            this.actor.update({ 'data.weapons': data.weapons });
        });
        html.find('.weapon-remove').click(ev => {
            ev.preventDefault();
            const elt = $(ev.currentTarget).parents(".weapon");
            const idx = elt.data("itemId");
            const data = this.getData().data;
            data.weapons = Object.values(data.weapons);
            if (data.weapons.length == 1) data.weapons[0] = { "name": "", "mod": null, "dmg": null };
            else data.weapons.splice(idx, 1);
            this.actor.update({ 'data.weapons': data.weapons });
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
        AudioHelper.play({ src: "/systems/cof/sounds/sword.mp3", volume: 0.8, autoplay: true, loop: false }, false);
        return Inventory.onToggleEquip(this.actor, event);
    }

    /**
     * Callbacks on consume actions
     * @param event
     * @private
     */
    _onConsume(event) {
        event.preventDefault();
        AudioHelper.play({ src: "/systems/cof/sounds/gulp.mp3", volume: 0.8, autoplay: true, loop: false }, false);
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
            case "capacity": return Capacity.removeFromActor(this.actor, entity);
            case "path": return Path.removeFromActor(this.actor, entity);
            case "profile": return Profile.removeFromActor(this.actor, entity);
            case "species": return Species.removeFromActor(this.actor, entity);
            default: return this.actor.deleteOwnedItem(itemId);
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
        const pack = (li.data("pack")) ? this.getPackPrefix() + "." + li.data("pack") : null;

        if (type === "effect") {
            let effects = this.actor.effects;
            const effect = effects.get(id);
            if (effect) {
                return new ActiveEffectConfig(effect, {}).render(true);
            } else return false;
        } else {
            // look first in actor onwed items
            let entity = this.actor.getOwnedItem(id);
            return (entity) ? entity.sheet.render(true) : Traversal.getEntity(id, type, pack).then(e => e.sheet.render(true));
        }
    }

     /**
     * Callback on render item actions : display or not the summary
     * @param event
     * @private
     */
    _onItemSummary(event){
        event.preventDefault();
        let li = $(event.currentTarget).parents('.item').children('.item-summary');
        let entity = this.actor.getOwnedItem($(event.currentTarget).parents('.item').data("itemId"));
        if (entity && entity.data.type === "capacity") {
            if (li.hasClass('expanded')) {
                li.css("display", "none");
            }
            else {
                li.css("display", "block");
            }
            li.toggleClass('expanded');                
        } else {
            this._onEditItem(event);
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
        const data = this.getData();
        // SHIFT + click
        if (event.shiftKey) {
            switch (rolltype) {
                case "recovery": return CofRoll.rollRecoveryUse(data.data, this.actor, event, false)
            }
        }
        switch (rolltype) {
            case "skillcheck": return CofRoll.skillCheck(data.data, this.actor, event)
            case "weapon": return CofRoll.rollWeapon(data.data, this.actor, event)
            case "encounter-weapon": return CofRoll.rollEncounterWeapon(data.data, this.actor, event)
            case "encounter-damage": return CofRoll.rollEncounterDamage(data.data, this.actor, event)
            case "spell": return CofRoll.rollSpell(data.data, this.actor, event)
            case "damage": return CofRoll.rollDamage(data.data, this.actor, event)
            case "hp": return CofRoll.rollHitPoints(data.data, this.actor, event)
            case "attributes": return CofRoll.rollAttributes(data.data, this.actor, event)
            case "recovery": return CofRoll.rollRecoveryUse(data.data, this.actor, event, true)
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
            case "path": return await Path.addToActor(this.actor, itemData);
            case "profile": return await Profile.addToActor(this.actor, itemData);
            case "species": return await Species.addToActor(this.actor, itemData);
            case "capacity":
            default: {
                // Handle item sorting within the same Actor
                const actor = this.actor;
                let sameActor = (data.actorId === actor._id) || (actor.isToken && (data.tokenId === actor.token.id));
                if (sameActor) return this._onSortItem(event, itemData);
                // Create the owned item
                return this.actor.createEmbeddedEntity("OwnedItem", itemData);
            }
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
    getData(options = {}) {
        const data = super.getData(options);
        // console.log(data);
        data.config = game.cof.config;
        data.profile = data.items.find(item => item.type === "profile");
        data.species = data.items.find(item => item.type === "species");
        data.combat = {
            count: data.items.filter(i => i.data.worn).length,
            categories: []
        };
        data.inventory = {
            count: data.items.filter(i => i.type === "item").length,
            categories: []
        };
        for (const category of Object.keys(game.cof.config.itemCategories)) {
            data.combat.categories.push({
                id: category,
                label: game.cof.config.itemCategories[category],
                items: Object.values(data.items).filter(item => item.type === "item" && item.data.subtype === category && item.data.worn).sort((a, b) => (a.name > b.name) ? 1 : -1)
            });
            data.inventory.categories.push({
                id: category,
                label: "COF.category." + category,
                items: Object.values(data.items).filter(item => item.type === "item" && item.data.subtype === category).sort((a, b) => (a.name > b.name) ? 1 : -1)
            });
        }

        data.combat.categories.forEach(category => {
            if (category.items.length > 0) {                
                category.items.forEach(item => {
                    if (item.data.properties?.weapon) {
                        // Compute MOD
                        const itemModStat = item.data.skill.split("@")[1];
                        const itemModBonus = parseInt(item.data.skillBonus);
                        const weaponCategory = this.getCategory(item.data);
                        
                        item.data.mod = this.actor.computeWeaponMod(itemModStat, itemModBonus, weaponCategory);

                        // Compute DM
                        const itemDmgBase = item.data.dmgBase;                        
                        const itemDmgStat = item.data.dmgStat.split("@")[1];
                        const itemDmgBonus = parseInt(item.data.dmgBonus);

                        item.data.dmg = this.actor.computeDm(itemDmgBase, itemDmgStat, itemDmgBonus)
                    }
                });
            }
        });

        // PATHS & CAPACITIES
        const paths = data.items.filter(item => item.type === "path");
        data.paths = paths;
        data.pathCount = data.paths.length;
        data.capacities = {
            count: data.items.filter(item => item.type === "capacity").length,
            collections: []
        }
        data.capacities.collections.push({
            id: "standalone-capacities",
            label: "Capacités Hors-Voies",
            items: Object.values(data.items).filter(item => {
                if (item.type === "capacity" && !item.data.path) {
                    return true;
                }
            }).sort((a, b) => (a.name > b.name) ? 1 : -1)
        });
        for (const path of paths) {
            data.capacities.collections.push({
                id: (path.data.key) ? path.data.key : path.name.slugify({ strict: true }),
                label: path.name,
                items: Object.values(data.items).filter(item => {
                    if (item.type === "capacity" && item.data.path._id === path._id) return true;
                }).sort((a, b) => (a.data.rank > b.data.rank) ? 1 : -1)
            });
        }
        data.effects = data.actor.effects;
        data.folded = {
            "combat": (data.data.settings?.combat) ? data.data.settings?.combat.folded : [],
            "inventory": (data.data.settings?.inventory) ? data.data.settings?.inventory.folded : [],
            "capacities": (data.data.settings?.capacities) ? data.data.settings?.capacities.folded : [],
            "effects": (data.data.settings?.effects) ? data.data.settings?.effects.folded : []
        };       

        const overloadedMalus = this.actor.getOverloadedMalus();
        const overloadedOtherMod = this.actor.getOverloadedOtherMod();
        let overloadedTotal = (overloadedMalus + overloadedOtherMod <= 0 ? overloadedMalus + overloadedOtherMod : 0) ;
        data.overloaded = {
            "armor": overloadedMalus,
            "total": overloadedTotal
        }
        

        return data;
    }

    /**
     * @description Retourne la catégorie de l'arme
     *      -> à implémenter dans chacun des modules Chroniques Oubliées.
     * 
     * @todo 
     * @param {*} itemData 
     * @returns Retourne "cof" en attendant l'implémentation
     */
    getCategory(itemData){
        return "cof";
    }
}
