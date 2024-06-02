/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
import { Capacity } from "../controllers/capacity.js";
import { Path } from "../controllers/path.js";
import { COF, System } from "../system/config.js";
import { ArrayUtils } from "../utils/array-utils.js";
import { COFActiveEffectConfig } from "../system/active-effect-config.js";

export class CofItemSheet extends ItemSheet {

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["cof", "sheet", "item", this.type],
            template: System.templatesPath + "/items/item-sheet.hbs",
            width: 600,
            height: 600,
            tabs: [{ navSelector: ".sheet-navigation", contentSelector: ".sheet-body", initial: "description" }],
            dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }]
        });
    }

    /**
     * @name getPackPrefix
     * @description Define the prefix used to open compendium
     * @returns the prefix for the cof-srd compendium
     */
    getPackPrefix() { return "cof-srd"; }

    /**
     * Activate the default set of listeners for the Entity sheet
     *
     * @param html {JQuery}     The rendered template ready to have listeners attached
     */
    activateListeners(html) {
        super.activateListeners(html);

        html.find('.droppable').on("dragover", function (event) {
            event.preventDefault();
            event.stopPropagation();
            $(event.currentTarget).addClass('dragging');
        });

        html.find('.droppable').on("dragleave", function (event) {
            event.preventDefault();
            event.stopPropagation();
            $(event.currentTarget).removeClass('dragging');
        });

        html.find('.droppable').on("drop", function (event) {
            event.preventDefault();
            event.stopPropagation();
            $(event.currentTarget).removeClass('dragging');
        });

        // Click to open
        html.find('.cof-compendium-pack').click(event => {
            event.preventDefault();
            const li = $(event.currentTarget)
            const pack = game.packs.get(this.getPackPrefix() + "." + li.data("pack"));
            if (pack) {
                if (li.attr("data-open") === "1") {
                    li.attr("data-open", "0");
                    pack.apps[0].close();
                } else {
                    li.attr("data-open", "1");
                    li.find("i.folder").removeClass("fa-folder").addClass("fa-folder-open");
                    pack.render(true);
                }
            }
        });

        // Display item sheet
        html.find('.item-edit').click(this._onEditItem.bind(this));
        // Delete items
        html.find('.item-delete').click(this._onDeleteItem.bind(this));

        // Item Effects
        html.find('.item-name').click(ev => {
            ev.preventDefault();
            const elt = $(ev.currentTarget).parents(".effect");
            if (!elt || elt.length === 0) this._onEditItem(ev);
            else {
                let lockItems = game.settings.get("cof", "lockItems");
                if ((!game.user.isGM && lockItems) || this.item.actor) return;    // Si l'item est verrouillé ou appartient à un actor, l'effet n'est pas modifiable
                const effectId = elt.data("itemId");
                let effect = this.item.effects.get(effectId);
                if (effect) {
                    new COFActiveEffectConfig(effect).render(true);
                }
            }
        });
        // Abonnement des évènements sur les effets
        html.find('.effect-create').click(ev => {
            ev.preventDefault();
            if (!this.isEditable) return;
            return this.item.createEmbeddedDocuments("ActiveEffect", [{
                label: game.i18n.localize("COF.ui.newEffect"),
                img: "icons/svg/aura.svg",
                origin: this.item.uuid,
                tint: "#050505",
                disabled: true
            }]);
        });
        html.find('.effect-edit').click(ev => {
            ev.preventDefault();
            const elt = $(ev.currentTarget).parents(".effect");
            const effectId = elt.data("itemId");
            let effect = this.item.effects.get(effectId);
            if (effect) {
                new COFActiveEffectConfig(effect).render(true);
            }
        });
        html.find('.effect-delete').click(ev => {
            ev.preventDefault();
            if (!this.isEditable) return;
            const elt = $(ev.currentTarget).parents(".effect");
            const effectId = elt.data("itemId");
            let effect = this.item.effects.get(effectId);
            if (effect) effect.delete();
        });
        html.find('.effect-toggle').click(ev => {
            ev.preventDefault();
            const elt = $(ev.currentTarget).parents(".effect");
            const effectId = elt.data("itemId");
            let effect = this.item.effects.get(effectId);
            if (effect) {
                effect.update({ disabled: !effect.disabled })
            }
        });

        html.find('.checkbox').click(this._onVerifyCheckboxes.bind(this));

        html.find('.capacity-activated-toggle').click(ev => {
            ev.preventDefault();
            const isChecked = $(ev.currentTarget).prop("checked");
            
            // Capacité rattachée à un acteur
            if (this.actor !== null) {
                this.actor.syncItemActiveEffects(this.item, !isChecked);
                return this.item.update({"system.properties.buff.activated": isChecked});
            }

            // Capacité non rattachée à un acteur
            else {
                let data = foundry.utils.duplicate(this.item);
                if (data.effects.length > 0){        
                    data.effects.forEach(effect => effect.disabled = isChecked ? false : true);
                    data.system.properties.buff.activated = isChecked;
                    return this.item.update(data);
                }
            }
            
        });
    }

    /** @override */
    setPosition(options = {}) {
        const position = super.setPosition(options);
        const sheetBody = this.element.find(".sheet-body");
        const bodyHeight = position.height - 192;
        sheetBody.css("height", bodyHeight);
        return position;
    }

    /** @override */
    _onDrop(event) {
        event.preventDefault();
        if (!this.options.editable) return false;
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
            return false;
        }
        // Case 3 - Dropped Macro
        if (data.type === "Macro") {
            return this._onDropMacro(event, data);
        }
    }

    /**
     * Handle dropping of an item reference or item data onto an Item Sheet
     * @param {DragEvent} event     The concluding DragEvent which contains drop data
     * @param {Object} data         The data transfer extracted from the event
     * @return {Object}             OwnedItem data to create
     * @private
     */
    _onDropItem(event, data) {
        Item.implementation.fromDropData(data).then(item => {
            switch (item.type) {
                case "path":
                    return this._onDropPathItem(event, item);
                case "capacity":
                    return this._onDropCapacityItem(event, item);
                case "profile":
                case "species":
                default:
                    return false;
            }
        });
    }

    /**
     * @name _onDropMacro
     * @description Handles the dropping of a macro - Used for capacity Item
     * @param {DragEvent} event     The concluding DragEvent which contains drop data
     * @param {Object} data         The data transfer extracted from the event
     * @return {Object}             OwnedItem data to create
     * @private
     */
    async _onDropMacro(event, data) {
        event.preventDefault();
        if (this.object.type !== "capacity") return false;

        fromUuid(data.uuid).then((macro)=>{
            this.object.system.properties.macro.id = macro.id;
            this.object.system.properties.macro.name = macro.name;
            this.object.system.properties.macro.pack = macro.pack;
            return this.render(true);
        });       
    }


    /**
     * 
     * @param {*} event 
     * @param {*} itemData 
     * @returns 
     */
    _onDropPathItem(event, itemData) {
        event.preventDefault();
        if (this.item.type === "profile" || this.item.type === "species") return Path.addToItem(this.item, itemData);
        else return false;
    }

    /**
     * 
     * @param {*} event 
     * @param {*} itemData 
     * @returns 
     */
    _onDropCapacityItem(event, itemData) {
        event.preventDefault();
        if (this.item.type === "path" || this.item.type === "species") return Capacity.addToItem(this.item, itemData);
        return false;
    }

    /**
     * 
     * @param {*} event 
     * @returns 
     */
    _onEditItem(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("itemId");
        const uuid = li.data("itemUuid");
        if (uuid) {
            return fromUuid(uuid).then(e => {
                if (e) return e.sheet.render(true);
                else {
                    ui.notifications.error(game.i18n.localize("COF.notification.ItemNotFound"));
                    return false;
                }
            });
        }
        else return null;
    }

    /**
     * 
     * @param {*} event 
     * @returns 
     */
    _onDeleteItem(event) {
        event.preventDefault();
        // let data = foundry.utils.duplicate(this.item.data);
        const li = $(event.currentTarget).closest(".item");
        const id = li.data("itemId");
        const itemType = li.data("itemType");
        let array = null;
        switch (itemType) {
            case "path": {
                array = this.item.system.paths;
                const item = array.find(e => e._id === id);
                if (array && array.includes(item)) {
                    ArrayUtils.remove(array, item);
                }
                return this.item.update({'system.paths': array});
            }
            case "capacity": {
                array = this.item.system.capacities;
                const item = array.find(e => e._id === id);
                if (array && array.includes(item)) {
                    ArrayUtils.remove(array, item);
                }
                return this.item.update({'system.capacities': array});
            }            
        }
    }


    /**
     * 
     * @param {*} event 
     * @returns 
     */
    _onVerifyCheckboxes(event){
        const input = $(event.currentTarget).find("input");
        const name = input.attr('name');
        const checked = input.prop('checked')
        if (name === "system.properties.equipment" && !checked) {
            let system = foundry.utils.duplicate(this.item.system);
            system.properties.equipable = false;
            system.slot = "";
            system.properties.stackable = false;
            system.qty = 1;
            system.stacksize = null;
            system.properties.unique = false;
            system.properties.consumable = false;
            system.properties.tailored = false;
            system.properties["2H"] = false;
            system.price = 0;
            system.value = 0;
            system.rarity = "";
            return this.item.update({"system": system});
        }        
        if (name === "system.properties.equipable" && !checked) {
            let system = foundry.utils.duplicate(this.item.system);
            system.slot = "";
            return this.item.update({"system": system});
        }
        if (name === "system.properties.stackable" && !checked) {
            let system = foundry.utils.duplicate(this.item.system);
            system.qty = 1;
            system.stacksize = null;
            system.deleteWhen0 = false;
            return this.item.update({"system": system});
        }
        if (name === "system.properties.weapon" && !checked) {
            let system = foundry.utils.duplicate(this.item.system);
            system.skill = "@attacks.melee.mod";
            system.skillBonus = 0;
            system.dmgBase = 0;
            system.dmgStat = "";
            system.dmgBonus = 0;
            system.critrange = "20"
            system.properties.bashing = false;
            system.properties["13strmin"] = false;
            return this.item.update({"system": system});
        }
        if (name === "system.properties.protection" && !checked) {
            let system = foundry.utils.duplicate(this.item.system);
            system.defBase = 0;
            system.defBonus = 0;
            system.properties.dr = false;
            system.dr = 0;
            return this.item.update({"system": system});
        }
        if (name === "system.properties.dr" && !checked) {
            let system = foundry.utils.duplicate(this.item.system);
            system.dr = 0;
            return this.item.update({"system": system});
        }        
        if (name === "system.properties.ranged" && !checked) {
            let system = foundry.utils.duplicate(this.item.system);
            system.range = 0;
            system.properties.bow = false;
            system.properties.crossbow = false;
            system.properties.powder = false;            
            system.properties.throwing = false;
            system.properties.sling = false;
            system.properties.spell = false;
            system.properties.reloadable = false;
            system.reload = "";
            return this.item.update({"system": system});
        }
        if (name === "system.properties.reloadable" && !checked) {
            let system = foundry.utils.duplicate(this.item.system);
            system.reload = "";
            return this.item.update({"system": system});
        }        
         
        if (name === "system.properties.effects" && !checked) {
            let system = foundry.utils.duplicate(this.item.system);
            system.properties.heal = false;
            system.properties.buff = false;
            system.properties.temporary = false;
            system.properties.persistent = false;
            system.properties.spell = false;
            system.effects.heal.formula = null;
            system.effects.buff.formula = null;
            system.properties.activable = false;
            return this.item.update({"system": system});
        }
        if (name === "system.properties.heal" && !checked) {
            let system = foundry.utils.duplicate(this.item.system);
            system.effects.heal.formula = null;
            return this.item.update({"system": system});
        }
        if (name === "system.properties.buff" && !checked) {
            let system = foundry.utils.duplicate(this.item.system);
            system.effects.buff.formula = null;
            return this.item.update({"system": system});
        }
        if (name === "system.properties.spell" && !checked) {
            let system = foundry.utils.duplicate(this.item.system);
            system.properties.activable = false;
            return this.item.update({"system": system});
        }        
    }

    /**
     * Get the Array of item properties which are used in the small sidebar of the description tab
     * @return {Array}
     * @private
     */
    _getItemProperties(item) {
        const props = [];
        if (item.type === "item") {
            const entries = Object.entries(item.system.properties)
            props.push(...entries.filter(e => e[1] === true).map(e => {
                return game.cof.config.itemProperties[e[0]]
            }));
        }
        if (item.type === "capacity") {
            let entries = [];
            entries.push(["limited",item.system.limited]);
            entries.push(["spell", item.system.spell]);
            entries.push(["ranged", item.system.ranged]);
            entries.push(["limitedUsage", item.system.limitedUsage]);
            entries.push(["save", item.system.save]);
            entries.push(["activable", item.system.activable]);
            entries.push(["heal", item.system.heal]);
            entries.push(["attack", item.system.attack]);
            entries.push(["buff", item.system.buff]);
            entries.push(["useMacro", item.system.useMacro]);
            props.push(...entries.filter(e => e[1] === true).map(e => {
                return game.cof.config.capacityProperties[e[0]]
            }));
        }
        return props.filter(p => !!p);
    }

    /** @override */
    async getData(options) {
        const context = super.getData(options);
        if (COF.debug) console.log(context);

        let lockItems = game.settings.get("cof", "lockItems");
        let lockDuringPause = game.settings.get("cof", "lockDuringPause") && game.paused;
        options.editable &= (game.user.isGM || (!lockItems && !lockDuringPause));
        context.config = game.cof.config;
        
        context.labels = this.item.labels;        
        context.itemType = context.item.type.titleCase();
        context.itemProperties = this._getItemProperties(context.item);
        context.effects = context.item.effects;
        // Gestion de l'affichage des boutons de modification des effets
        // Les boutons sont masqués si l'item appartient à un actor ou est verrouillé
        context.isEffectsEditable = !this.item.actor && options.editable;
        context.system = context.item.system;
        context.enrichedDescription = await TextEditor.enrichHTML(this.object.system.description, {async: true});

        return context;       
    }
}
