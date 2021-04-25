export class CofHealingRoll {
    constructor(label, formula, isCritical){
        this._label = label;
        this._formula = formula;
        this._isCritical = isCritical;
    }

    roll(actor){
        const r = new Roll(this._formula,actor.data.data);
        r.roll();
        if (this._isCritical) r._total = r._total * 2;
        this._buildHealingRollMessage().then(msgFlavor => {
            r.toMessage({
                user: game.user._id,
                flavor: msgFlavor,
                speaker: ChatMessage.getSpeaker({actor: actor}),
                flags : {msgType : "heal"}
            });
        });
    }

    _buildHealingRollMessage() {
        const rollMessageTpl = 'systems/cof/templates/chat/healing-roll-card.hbs';
        const tplData = {
            label : this._label,
            isCritical : this._isCritical
        };
        return renderTemplate(rollMessageTpl, tplData);
    }

}