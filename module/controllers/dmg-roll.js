export class CofDamageRoll {
    constructor(label, formula, isCritical){
        this._label = label;
        this._formula = formula;
        this._isCritical = isCritical;
    }

    roll(actor){
        const r = new Roll(this._formula);
        r.roll();
        if (this._isCritical) r._total = r._total * 2;
        this._buildDamageRollMessage().then(msgFlavor => {
            r.toMessage({
                user: game.user._id,
                flavor: msgFlavor,
                speaker: ChatMessage.getSpeaker({actor: actor}),
                flags : {msgType : "damage"}
            });
        });
    }

    _buildDamageRollMessage() {
        const rollMessageTpl = 'systems/cof/templates/chat/dmg-roll-card.hbs';
        const tplData = {
            label : this._label,
            isCritical : this._isCritical
        };
        return renderTemplate(rollMessageTpl, tplData);
    }

}