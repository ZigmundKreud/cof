import { CofDamageRoll } from "./dmg-roll.js";

export class CofSkillRoll {

    constructor(label, dice, mod, bonus, malus, difficulty, critrange, description, rollMode){
        this._label = label;
        this._dice = dice;
        this._mod = mod;
        this._bonus = bonus;
        this._malus = malus;
        this._totalBonusMalus = parseInt(this._bonus) + parseInt(this._malus);
        this._total = parseInt(this._mod) + this._totalBonusMalus;
        this._difficulty = difficulty;
        this._critrange = critrange;
        this._formula = (this._total === 0) ? this._dice : ((this._totalBonusMalus === 0) ? `${this._dice} ${this._mod}`: `${this._dice} ${this._mod} + ${this._totalBonusMalus}`);
        this._isCritical = false;
        this._isFumble = false;
        this._isSuccess = false;
        this._description = Array.isArray(description) ? description.join("<br>") : description ;
        this._rollMode = rollMode;
    }

    async roll(actor){
        let r = new Roll(this._formula);
        await r.roll();
        // Getting the dice kept in case of 2d12 or 2d20 rolls
        const result = r.terms[0].results.find(r => r.active).result;
        this._isCritical = ((result >= this._critrange.split("-")[0]) || result == 20);
        this._isFumble = (result == 1);
        if(this._difficulty){
            this._isSuccess = r.total >= this._difficulty;
        }
        const messageOptions = { rollMode: this._rollMode };
        this._buildRollMessage().then(msgFlavor => {
            r.toMessage({
                user: game.user.id,
                flavor: msgFlavor,
                speaker: ChatMessage.getSpeaker({actor: actor})
            }, messageOptions);
        })
        return r;
    }

    /**
     * @name weaponRoll
     * @description Jet de dommages d'une arme
     * 
     * @param {*} actor 
     * @param {*} dmgFormula 
     * @param {*} dmgDescr 
     * @returns 
     */
    async weaponRoll(actor, dmgFormula, dmgDescr){
        await this.roll(actor);
        if (this._difficulty) {
            if(this._isSuccess && game.settings.get("cof", "useComboRolls")){
                let r = new CofDamageRoll(this._label, dmgFormula, this._isCritical, dmgDescr, this._rollMode);
                await r.roll(actor);
                return r;
            }
        }
        else {
            if(game.settings.get("cof", "useComboRolls")){
                let r = new CofDamageRoll(this._label, dmgFormula, this._isCritical, dmgDescr, this._rollMode);
                await r.roll(actor);
                return r;
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
            isFailure : !this._isSuccess,
            hasDescription : this._description && this._description.length > 0,
			description : this._description       
        };
        return renderTemplate(rollMessageTpl, tplData);
    }
}