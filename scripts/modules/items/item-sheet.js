/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class CofItemSheet extends ItemSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["cof", "sheet", "item"],
            template: System.templatesPath + "/items/item-sheet.hbs",
            width: 430,
            height: 430
            // ,
            // tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}]
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
        html.find('.editor-content[data-edit]').each((i, div) => this._activateEditor(div));
    }

    /** @override */
    setPosition(options = {}) {
        const position = super.setPosition(options);
        const sheetBody = this.element.find(".sheet-body");
        const bodyHeight = position.height - 192;
        sheetBody.css("height", bodyHeight);
        return position;
    }
}
