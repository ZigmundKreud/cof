/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
import {ArrayUtils} from "../utils/array-utils.js";
import {Traversal} from "../utils/traversal.js";
import {System} from "../system/config.js";

export class CofItemSheet extends ItemSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["cof", "sheet", "item", this.type],
            template: System.templatesPath + "/items/item-sheet.hbs",
            width: 600,
            height: 600,
            tabs: [{navSelector: ".sheet-navigation", contentSelector: ".sheet-body", initial: "description"}],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }

    /**
     * Activate the default set of listeners for the Entity sheet
     * These listeners handle basic stuff like form submission or updating images
     *
     * @param html {JQuery}     The rendered template ready to have listeners attached
     */
    activateListeners(html) {
        super.activateListeners(html);

        // html.find('.editor-content[data-edit]').each((i, div) => this._activateEditor(div));

        html.find('.droppable').on("dragover", function(event) {
            event.preventDefault();
            event.stopPropagation();
            $(event.currentTarget).addClass('dragging');
        });

        html.find('.droppable').on("dragleave", function(event) {
            event.preventDefault();
            event.stopPropagation();
            $(event.currentTarget).removeClass('dragging');
        });

        html.find('.droppable').on("drop", function(event) {
            event.preventDefault();
            event.stopPropagation();
            $(event.currentTarget).removeClass('dragging');
        });

        // Click to open
        html.find('.compendium-pack').click(ev => {
            ev.preventDefault();
            let li = $(ev.currentTarget), pack = game.packs.get(li.data("pack"));
            if ( li.attr("data-open") === "1" ) pack.close();
            else {
                li.attr("data-open", "1");
                li.find("i.folder").removeClass("fa-folder").addClass("fa-folder-open");
                pack.render(true);
            }
        });

        // Display item sheet
        html.find('.item-name').click(this._onEditItem.bind(this));
        html.find('.item-edit').click(this._onEditItem.bind(this));
        // Delete items
        html.find('.item-delete').click(this._onDeleteItem.bind(this));

    }

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
        /**
         * Handle dropping an Actor on the sheet to trigger a Polymorph workflow
         */
        // Case 2 - Dropped Actor
        if (data.type === "Actor") {
            return false;
        }
    }

    /* -------------------------------------------- */

    /**
     * Handle dropping of an item reference or item data onto an Actor Sheet
     * @param {DragEvent} event     The concluding DragEvent which contains drop data
     * @param {Object} data         The data transfer extracted from the event
     * @return {Object}             OwnedItem data to create
     * @private
     */
    _onDropItem(event, data) {
        Item.fromDropData(data).then(item => {
            const itemData = duplicate(item.data);
            switch (itemData.type) {
                case "path"    :
                    return this._onDropPathItem(event, itemData);
                case "profile" :
                case "species" :
                    return false;
                case "capacity" :
                    return this._onDropCapacityItem(event, itemData);
                default:
                    return;
            }
        });
    }

    /* -------------------------------------------- */

    _onDropPathItem(event, itemData) {
        event.preventDefault();
        let data = duplicate(this.item.data);
        const id = itemData._id;
        if(data.type === "profile" || data.type === "species"){
            if(!data.data.paths.includes(id)){
                data.data.paths.push(id);
                return this.item.update(data);
            }
            else ui.notifications.error("Ce profil contient déjà cette voie.")
        }
        return false;
    }

    /* -------------------------------------------- */

    _onDropCapacityItem(event, itemData) {
        event.preventDefault();
        let data = duplicate(this.item.data);
        const id = itemData._id;
        if(data.data.capacities && !data.data.capacities.includes(id)){
            let caps = data.data.capacities;
            caps.push(id);
            return this.item.update(data);
        }
        else ui.notifications.error("Cette voie contient déjà cette capacité.")
    }

    /* -------------------------------------------- */

    /**
     * Callback on render item actions
     * @param event
     * @private
     */
    _onEditItem(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("itemId");
        if(id) {
            return Traversal.find(id).then(e => {
                if(e) return e.sheet.render(true);
                else {
                    ui.notifications.error("Impossible de trouver l'entité");
                    return false;
                }
            });
        }
        else return null;
    }

    /* -------------------------------------------- */

    _onDeleteItem(ev){
        ev.preventDefault();
        let data = duplicate(this.item.data);
        const li = $(ev.currentTarget).closest(".item");
        const id = li.data("itemId");
        const itemType = li.data("itemType");
        let array = null;
        switch(itemType){
            case "path" : array = data.data.paths; break;
            case "capacity" : array = data.data.capacities; break;
        }
        if(array && array.includes(id)) {
            ArrayUtils.remove(array, id)
            return this.item.update(data);
        }
    }

    /* -------------------------------------------- */

    /**
     * Get the Array of item properties which are used in the small sidebar of the description tab
     * @return {Array}
     * @private
     */
    _getItemProperties(item) {
        const props = [];
        if ( item.type === "item" ) {
            const entries = Object.entries(item.data.properties)
            props.push(...entries.filter(e => e[1] === true).map(e => {
                return game.cof.config.itemProperties[e[0]]
            }));
        }
        return props.filter(p => !!p);
    }

    /* -------------------------------------------- */

    /** @override */
    getData(options) {
        const data = super.getData(options);
        return Traversal.getIndex().then(index => {
            data.labels = this.item.labels;
            data.config = game.cof.config;
            data.itemType = data.item.type.titleCase();
            data.itemProperties = this._getItemProperties(data.item);

            if(data.data.capacities){
                data.capacities = [];
                for(const capId of data.data.capacities){
                    let cap = index[capId];
                    if(cap) data.capacities.push(cap);
                    else {
                        data.capacities.push({
                            _id: capId,
                            name: "Capacité manquante !!! [" + capId + "] NOT FOUND",
                            img: "/systems/cof/ui/icons/spotted-bug.svg"
                        });
                    }
                }
            }
            if(data.data.paths){
                data.paths = [];
                for(const pathId of data.data.paths){
                    let path = index[pathId];
                    if(path) data.paths.push(path);
                    else {
                        data.paths.push({
                            _id: pathId,
                            name: "Voie manquante !!! [" + pathId + "] NOT FOUND",
                            img: "/systems/cof/ui/icons/spotted-bug.svg"
                        });
                    }
                }
            }
            // console.log(data);
            return data;
        });
    }

}
