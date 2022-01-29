/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
import { Capacity } from "../controllers/capacity.js";
import { Path } from "../controllers/path.js";
import { COF, System } from "../system/config.js";
import { ArrayUtils } from "../utils/array-utils.js";
import { Traversal } from "../utils/traversal.js";
import { COFActiveEffectConfig } from "../system/active-effect-config.js";

export class CofItemSheet extends ItemSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
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
                icon: "icons/svg/aura.svg",
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
                effect.update({ disabled: !effect.data.disabled })
            }
        });

        html.find('.checkbox').click(this._onVerifyCheckboxes.bind(this));

        html.find('.capacity-activated-toggle').click(ev => {
            ev.preventDefault();
            const isChecked = $(ev.currentTarget).prop("checked");
            
            // Capacité rattachée à un acteur
            if (this.actor !== null) {
                this.actor.syncItemActiveEffects(this.item, !isChecked);
                let data = duplicate(this.item.data);
                data.data.properties.buff.activated = isChecked;
                return this.item.update(data);
            }

            // Capacité non rattachée à un acteur
            else {
                let data = duplicate(this.item.data);
                if (data.effects.length > 0){        
                    data.effects.forEach(effect => effect.disabled = isChecked ? false : true);
                    data.data.properties.buff.activated = isChecked;
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
        Item.fromDropData(data).then(item => {
            const itemData = duplicate(item.data);
            switch (itemData.type) {
                case "path":
                    return this._onDropPathItem(event, itemData);
                case "capacity":
                    return this._onDropCapacityItem(event, itemData);
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

       // Macro d'un compendium
        if (data.pack != undefined) {
            const pack = game.packs.get(data.pack);
            const item = pack.index.get(data.id);
            let itemId = item != undefined ? item._id : null;
            let macro;
            if (itemId) {
                macro = await pack.getDocument(itemId);
            }
            if (macro && this.object.data.data.useMacro) {
                this.object.data.data.properties.macro.id = data.id;
                this.object.data.data.properties.macro.name = macro.name;
                this.object.data.data.properties.macro.pack = data.pack;
                return this.render(true);
            }
        }

        // Macro de la hotbar
        if (this.object.data.data.useMacro) {
            this.object.data.data.properties.macro.id = data.id;
            this.object.data.data.properties.macro.name = game.macros.get(data.id).name;
            return this.render(true);
        }
    }


    /**
     * 
     * @param {*} event 
     * @param {*} itemData 
     * @returns 
     */
    _onDropPathItem(event, itemData) {
        event.preventDefault();
        if (this.item.data.type === "profile" || this.item.data.type === "species") return Path.addToItem(this.item, itemData);
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
        if (this.item.data.type === "path" || this.item.data.type === "species") return Capacity.addToItem(this.item, itemData);
        else return false;
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
        if (id) {
            return Traversal.find(id).then(e => {
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
        let data = duplicate(this.item.data);
        const li = $(event.currentTarget).closest(".item");
        const id = li.data("itemId");
        const itemType = li.data("itemType");
        let array = null;
        switch (itemType) {
            case "path": {
                array = data.data.paths;
                const item = array.find(e => e._id === id);
                if (array && array.includes(item)) {
                    ArrayUtils.remove(array, item);
                }
            }
                break;
            case "capacity": {
                array = data.data.capacities;
                const item = array.find(e => e._id === id);
                if (array && array.includes(item)) {
                    ArrayUtils.remove(array, item);
                }
            }
                break;
        }
        return this.item.update(data);
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
        if (name === "data.properties.equipment" && !checked) {
            let data = duplicate(this.item.data);
            data.data.properties.equipable = false;
            data.data.slot = "";
            data.data.properties.stackable = false;
            data.data.qty = 1;
            data.data.stacksize = null;
            data.data.properties.unique = false;
            data.data.properties.consumable = false;
            data.data.properties.tailored = false;
            data.data.properties["2H"] = false;
            data.data.price = 0;
            data.data.value = 0;
            data.data.rarity = "";
            return this.item.update(data);
        }        
        if (name === "data.properties.equipable" && !checked) {
            let data = duplicate(this.item.data);
            data.data.slot = "";
            return this.item.update(data);
        }
        if (name === "data.properties.stackable" && !checked) {
            let data = duplicate(this.item.data);
            data.data.qty = 1;
            data.data.stacksize = null;
            data.data.deleteWhen0 = false;
            return this.item.update(data);
        }
        if (name === "data.properties.weapon" && !checked) {
            let data = duplicate(this.item.data);
            data.data.skill = "@attacks.melee.mod";
            data.data.skillBonus = 0;
            data.data.dmgBase = 0;
            data.data.dmgStat = "";
            data.data.dmgBonus = 0;
            data.data.critrange = "20"
            data.data.properties.bashing = false;
            data.data.properties["13strmin"] = false;
            return this.item.update(data);
        }
        if (name === "data.properties.protection" && !checked) {
            let data = duplicate(this.item.data);
            data.data.defBase = 0;
            data.data.defBonus = 0;
            data.data.properties.dr = false;
            data.data.dr = 0;
            return this.item.update(data);
        }
        if (name === "data.properties.dr" && !checked) {
            let data = duplicate(this.item.data);
            data.data.dr = 0;
            return this.item.update(data);
        }        
        if (name === "data.properties.ranged" && !checked) {
            let data = duplicate(this.item.data);
            data.data.range = 0;
            data.data.properties.bow = false;
            data.data.properties.crossbow = false;
            data.data.properties.powder = false;            
            data.data.properties.throwing = false;
            data.data.properties.sling = false;
            data.data.properties.spell = false;
            data.data.properties.reloadable = false;
            data.data.reload = "";
            return this.item.update(data);
        }
        if (name === "data.properties.reloadable" && !checked) {
            let data = duplicate(this.item.data);
            data.data.reload = "";
            return this.item.update(data);
        }        
         
        if (name === "data.properties.effects" && !checked) {
            let data = duplicate(this.item.data);
            data.data.properties.heal = false;
            data.data.properties.buff = false;
            data.data.properties.temporary = false;
            data.data.properties.persistent = false;
            data.data.properties.spell = false;
            data.data.effects.heal.formula = null;
            data.data.effects.buff.formula = null;
            data.data.properties.activable = false;
            return this.item.update(data);
        }
        if (name === "data.properties.heal" && !checked) {
            let data = duplicate(this.item.data);
            data.data.effects.heal.formula = null;
            return this.item.update(data);
        }
        if (name === "data.properties.buff" && !checked) {
            let data = duplicate(this.item.data);
            data.data.effects.buff.formula = null;
            return this.item.update(data);
        }
        if (name === "data.properties.spell" && !checked) {
            let data = duplicate(this.item.data);
            data.data.properties.activable = false;
            return this.item.update(data);
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
            const entries = Object.entries(item.data.data.properties)
            props.push(...entries.filter(e => e[1] === true).map(e => {
                return game.cof.config.itemProperties[e[0]]
            }));
        }
        if (item.type === "capacity") {
            let entries = [];
            entries.push(["limited",item.data.data.limited]);
            entries.push(["spell", item.data.data.spell]);
            entries.push(["ranged", item.data.data.ranged]);
            entries.push(["limitedUsage", item.data.data.limitedUsage]);
            entries.push(["save", item.data.data.save]);
            entries.push(["activable", item.data.data.activable]);
            entries.push(["heal", item.data.data.heal]);
            entries.push(["attack", item.data.data.attack]);
            entries.push(["buff", item.data.data.buff]);
            entries.push(["useMacro", item.data.data.useMacro]);
            props.push(...entries.filter(e => e[1] === true).map(e => {
                return game.cof.config.capacityProperties[e[0]]
            }));
        }
        return props.filter(p => !!p);
    }

    /** @override */
    getData(options) {
        const data = super.getData(options);

        let lockItems = game.settings.get("cof", "lockItems");
        let lockDuringPause = game.settings.get("cof", "lockDuringPause") && game.paused;
        options.editable &= (game.user.isGM || (!lockItems && !lockDuringPause));

        const itemData = data.data;
        if (COF.debug) console.log(data);
        data.labels = this.item.labels;
        data.config = game.cof.config;
        data.itemType = data.item.type.titleCase();
        data.itemProperties = this._getItemProperties(data.item);
        data.effects = data.item.effects;
        // Gestion de l'affichage des boutons de modification des effets
        // Les boutons sont masqués si l'item appartient à un actor ou est verrouillé
        data.isEffectsEditable = !this.item.actor && options.editable;
        data.item = itemData;
        data.data = itemData.data;
        return data;
    }
}
