export class CofHealingRoll {
    constructor(label, formula, isCritical, title, showButtons=true, description){
        this._label = label;
        this._formula = formula;
        this._isCritical = isCritical;
        this._title = title;
        this._showButtons = showButtons;
        this._description = Array.isArray(description) ? description.join("<br>") : description;
    }

    async roll(actor){
        const r = new Roll(this._formula,actor.data.data);
        await r.roll({"async": true});
        if (this._isCritical) r._total = r._total * 2;
        this._buildHealingRollMessage().then(msgFlavor => {
            r.toMessage({
                user: game.user.id,
                flavor: msgFlavor,
                speaker: ChatMessage.getSpeaker({actor: actor}),
                flags : {msgType : "heal"}
            });
        });
        return r;
    }

    _buildHealingRollMessage() {
        const rollMessageTpl = 'systems/cof/templates/chat/healing-roll-card.hbs';
        const tplData = {
            label : this._label,
            isCritical : this._isCritical,
            title : this._title ? this._title : this._isCritical ? game.i18n.localize("COF.roll.criticalHeal") : game.i18n.localize("COF.roll.heal"),
            showButtons : this._showButtons,
            hasDescription : this._description && this._description.length > 0,
            description : this._description
        };
        return renderTemplate(rollMessageTpl, tplData);
    }

}