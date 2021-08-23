import { CofDamageRoll } from "./dmg-roll.js";

export class CofSkillRoll {

    constructor(label, dice, mod, bonus, malus, difficulty, critrange, description) {
        this._label = label;
        this._dice = dice;
        this._mod = mod;
        this._bonus = bonus;
        this._malus = malus;
        this._totalBonusMalus = parseInt(this._bonus) + parseInt(this._malus);
        this._total = parseInt(this._mod) + this._totalBonusMalus;
        this._difficulty = difficulty;
        this._critrange = critrange;
        this._formula = (this._total === 0) ? this._dice : ((this._totalBonusMalus === 0) ? `${this._dice} ${this._mod}` : `${this._dice} ${this._mod} + ${this._totalBonusMalus}`);
        this._isCritical = false;
        this._isFumble = false;
        this._isSuccess = false;
        this._description = description;
    }

    async roll(actor) {
        let r = new Roll(this._formula);
        await r.roll({ "async": true });
        // Getting the dice kept in case of 2d12 or 2d20 rolls
        const result = r.terms[0].results.find(r => r.active).result;
        this._isCritical = ((result >= this._critrange.split("-")[0]) || result == 20);
        this._isFumble = (result == 1);
        if (this._difficulty) {
            this._isSuccess = r.total >= this._difficulty;
        }
        this._buildRollMessage().then(msgFlavor => {
            r.toMessage({
                user: game.user.id,
                flavor: msgFlavor,
                speaker: ChatMessage.getSpeaker({ actor: actor })
            });
        })
    }

    async weaponRoll(actor, dmgFormula, dmgDescr) {
        await this.roll(actor);
        if (this._difficulty) {
            // Si l'option displayDifficulty est configurée sur GM, toujours lancer le dé de dégat
            // pour ne pas dévoiler le résultat du dé de compétence
            if (
                (this._isSuccess || game.settings.get("cof", "displayDifficulty") === "GM")
                && game.settings.get("cof", "useComboRolls")) {
                let r = new CofDamageRoll(this._label, dmgFormula, this._isCritical, dmgDescr);
                await r.roll(actor);
            }
        }
        else {
            if (game.settings.get("cof", "useComboRolls")) {
                let r = new CofDamageRoll(this._label, dmgFormula, this._isCritical, dmgDescr);
                await r.roll(actor);
            }
        }
    }

    _buildRollMessage() {
        const rollMessageTpl = 'systems/cof/templates/chat/skill-roll-card.hbs';
        const displayDifficulty = game.settings.get("cof", "displayDifficulty");

        const tplData = {
            label: this._label,
            difficulty: this._difficulty,
            showDifficulty: !!this._difficulty && displayDifficulty !== "none",
            isCritical: this._isCritical,
            isFumble: this._isFumble,
            isSuccess: this._isSuccess,
            isFailure: !this._isSuccess,
            hasDescription: this._description && this._description.length > 0,
            description: this._description
        };
        return renderTemplate(rollMessageTpl, tplData);
    }
}