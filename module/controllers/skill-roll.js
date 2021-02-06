import {CofDamageRoll} from "./dmg-roll.js";

export class CofSkillRoll {

    constructor(label, dice, mod, bonus, difficulty, critrange){
        this._label = label;
        this._dice = dice;
        this._mod = mod;
        this._bonus = bonus;
        this._difficulty = difficulty;
        this._critrange = critrange;
        this._totalBonus = parseInt(this._mod) + parseInt(this._bonus);
        this._formula = (this._totalBonus === 0) ? this._dice : `${this._dice} + ${this._totalBonus}`;
        this._critrange = critrange;
        this._isCritical = false;
        this._isFumble = false;
        this._isSuccess = false;
    }

    roll(actor){
        let r = new Roll(this._formula);
        r.roll();
        // Getting the dice kept in case of 2d12 or 2d20 rolls
        const result = r.terms[0].results.find(r => r.active).result;
        this._isCritical = ((result >= this._critrange.split("-")[0]) || result == 20);
        this._isFumble = (result == 1);
        if(this._difficulty){
            this._isSuccess = r.total >= this._difficulty;
        }
        this._buildRollMessage().then(msgFlavor => {
            r.toMessage({
                user: game.user._id,
                flavor: msgFlavor,
                speaker: ChatMessage.getSpeaker({actor: actor})
            });
        })
    }

    weaponRoll(actor, dmgFormula){
        this.roll(actor);
        if (this._difficulty) {
            if(this._isSuccess && game.settings.get("cof", "useComboRolls")){
                let r = new CofDamageRoll(this._label, dmgFormula, this._isCritical);
                r.roll(actor);
            }
        }
        else {
            if(game.settings.get("cof", "useComboRolls")){
                let r = new CofDamageRoll(this._label, dmgFormula, this._isCritical);
                r.roll(actor);
            }
        }
    }

    _buildRollMessage() {
        const rollMessageTpl = 'systems/cof/templates/chat/skill-roll-card.hbs';
        const tplData = {
            label : this._label,
            difficulty : this._difficulty,
            showDifficulty : !!this._difficulty,
            isCritical : this._isCritical,
            isFumble : this._isFumble,
            isSuccess : this._isSuccess,
            isFailure : !this._isSuccess
        };
        return renderTemplate(rollMessageTpl, tplData);
    }
}