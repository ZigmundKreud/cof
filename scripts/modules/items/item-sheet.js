/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class CofItemSheet extends ItemSheet {

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
