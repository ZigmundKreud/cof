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
        this._msgFlavor = "";
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
            this._msgFlavor = this._buildRollMessage();
        }else{
            this._msgFlavor = this._buildRollMessageNoDifficulty();
        }
        r.toMessage({
            user: game.user._id,
            flavor: this._msgFlavor,
            speaker: ChatMessage.getSpeaker({actor: actor})
        });
    }

    weaponRoll(actor, formula){
        this.roll(actor);
        if (this._difficulty) {
            if(this._isSuccess){
                let r = new CofDamageRoll(this._label, formula, this._isCritical);
                r.roll(actor);
            }
        }
        else {
            let r = new CofDamageRoll(this._label, formula, this._isCritical);
            r.roll(actor);
        }
    }

    /* -------------------------------------------- */

    _buildRollMessage() {
        let subtitle = `<h3><strong>${this._label}</strong> ${game.i18n.localize("COF.ui.difficulty")} <strong>${this._difficulty}</strong></h3>`;
        if (this._isCritical) return `<h2 class="success critical">${game.i18n.localize("COF.roll.critical")} !!</h2>${subtitle}`;
        if (this._isFumble) return `<h2 class="failure fumble">${game.i18n.localize("COF.roll.fumble")} !!</h2>${subtitle}`;
        if (this._isSuccess) return `<h2 class="success">${game.i18n.localize("COF.roll.success")} !</h2>${subtitle}`;
        else return `<h2 class="failure">${game.i18n.localize("COF.roll.failure")}...</h2>${subtitle}`;
    }

    /* -------------------------------------------- */

    _buildRollMessageNoDifficulty() {
        let subtitle = `<h3><strong>${this._label}</strong></h3>`;
        if (this._isCritical) return `<h2 class="success critical">${game.i18n.localize("COF.roll.critical")} !!</h2>${subtitle}`;
        if (this._isFumble) return `<h2 class="failure fumble">${game.i18n.localize("COF.roll.fumble")} !!</h2>${subtitle}`;
        else return `<h2 class="roll">${game.i18n.localize("COF.ui.skillcheck")}</h2>${subtitle}`;
    }
}