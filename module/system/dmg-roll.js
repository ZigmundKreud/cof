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
        const dmgCheckFlavor = this._buildDamageRollMessage();
        r.toMessage({
            user: game.user._id,
            flavor: dmgCheckFlavor,
            speaker: ChatMessage.getSpeaker({actor: actor})
        });
    }

    /* -------------------------------------------- */

    _buildDamageRollMessage() {
        let subtitle = `<h3><strong>${this._label}</strong></h3>`;
        if (this._isCritical) return `<h2 class="damage">Jet de dommages critique !</h2>${subtitle}`;
        return `<h2 class="damage">Jet de dommages</h2>${subtitle}`;
    }

}