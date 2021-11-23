export class CofDamageRoll {
    constructor(label, formula, isCritical, description){
        this._label = label;
        this._formula = formula;
        this._isCritical = isCritical;
        this._description = Array.isArray(description) ? description.join("<br>") : description;
    }

    async roll(actor){
        const r = new Roll(this._formula);
        await r.roll({"async": true});
        if (this._isCritical) r._total = r._total * 2;
        this._buildDamageRollMessage().then(msgFlavor => {
            r.toMessage({
                user: game.user.id,
                flavor: msgFlavor,
                speaker: ChatMessage.getSpeaker({actor: actor}),
                flags : {msgType : "damage"}
            });
        });
        return r;
    }

    _buildDamageRollMessage() {
        const rollMessageTpl = 'systems/cof/templates/chat/dmg-roll-card.hbs';
        const tplData = {
            label : this._label,
            isCritical : this._isCritical,
            hasDescription : this._description && this._description.length > 0,
			description : this._description
        };
        return renderTemplate(rollMessageTpl, tplData);
    }

}