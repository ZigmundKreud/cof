import {Stats} from "../system/stats.js";
import {CharacterGeneration} from "../system/chargen.js";

export class CofAttributesDialog extends FormApplication {

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "attributes-dialog",
            title: game.i18n.format("COF.dialog.chooseCharacteristics.title"),
            template: "systems/cof/templates/dialogs/attributes-roll-dialog.hbs",
            classes: ["cof", "attributes-dialog"],
            width: 400,
            height: "auto",
            choices: {},
            allowCustom: true,
            minimum: 0,
            maximum: null,
            jQuery: true
        });
    }

    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        this._refreshTotal();
        html.find(".dialog-button").click(this._onClickButton.bind(this));
        html.on('keydown.chooseDefault', this._onKeyDown.bind(this));
    }

    /* -------------------------------------------- */

    _refreshMod(event) {
        event.preventDefault();
        const stat = $(event.currentTarget).parents(".stat");
        const base = stat.find(".base");
        const mod = stat.find(".mod");
        mod.val(HandlebarsHelpers.numberFormat(Stats.getModFromStatValue(parseInt(base.val())), {hash: {decimals: 0, sign: true}}));
        return this._refreshTotal();
    }

    /* -------------------------------------------- */

    _refreshBase(event) {
        event.preventDefault();
        const stat = $(event.currentTarget).parents(".stat");
        const base = stat.find(".base");
        const mod = stat.find(".mod");
        mod.val(HandlebarsHelpers.numberFormat(parseInt(mod.val()), {hash: {decimals: 0, sign: true}}));
        base.val(Stats.getStatValueFromMod(parseInt(mod.val())));
        return this._refreshTotal();
    }

    /* -------------------------------------------- */

    _refreshTotal() {
        const total = $("#total");
        const mods = $(".mod");
        const maxValue = parseInt($("#max").val());
        const spent = $("#spent");
        let sum = 0;
        mods.each(function () {
            sum += parseInt($(this).val());  // Or this.innerHTML, this.innerText
        });
        total.val(sum);

        if (maxValue < sum) {
            if (!spent.hasClass("error")) spent.addClass("error");
        } else {
            if (spent.hasClass("error")) spent.removeClass("error");
        }
        return true;
    }

    /* -------------------------------------------- */

    /** @override */
    async _onRandom() {
        const rolls = await CharacterGeneration.statsCommand(this.object);
        let i = 0;
        const stats = ["str", "dex", "con", "int", "wis", "cha"];
        for (const stat of stats) {
            $("#" + stat).find(".base").val(rolls[i].total);
            $("#" + stat).find(".mod").val(HandlebarsHelpers.numberFormat(Stats.getModFromStatValue(rolls[i].total), {hash: {decimals: 0, sign: true}}));
            ++i;
        }
        return this._refreshTotal();
    }

    /* -------------------------------------------- */

    /** @override */
    _onChangeInput(event) {
        event.preventDefault();
        const input = $(event.currentTarget);
        const attr = input.data("attr");
        if (attr && attr === "base") {
            this._refreshMod(event);
        } else if (attr && attr === "mod") {
            this._refreshBase(event);
        }
    }

    /* -------------------------------------------- */

    /**
     * Handle a left-mouse click on one of the dialog choice buttons
     * @param {MouseEvent} event    The left-mouse click event
     * @private
     */
    _onClickButton(event) {
        event.preventDefault();
        const id = event.currentTarget.dataset.button;
        switch (id) {
            case "cancel" :
                return this.close();
            case "random" :
                return this._onRandom();
            case "submit" :
                return this._onSubmit(event);
        }
    }

    /* -------------------------------------------- */

    /**
     * Handle a keydown event while the dialog is active
     * @param {KeyboardEvent} event   The keydown event
     * @private
     */
    _onKeyDown(event) {
        // Close dialog
        if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            return this.close();
        }

        // Confirm default choice
        if ((event.key === "Enter")) {
            event.preventDefault();
            event.stopPropagation();
            return this.submit();
        }
    }

    /* -------------------------------------------- */

    /** @override */
    async _updateObject(event, formData) {
        event.preventDefault();
        const updateData = {
            system: {
                stats: {
                    str: {base: formData["system.stats.str.base"]},
                    dex: {base: formData["system.stats.dex.base"]},
                    con: {base: formData["system.stats.con.base"]},
                    int: {base: formData["system.stats.int.base"]},
                    wis: {base: formData["system.stats.wis.base"]},
                    cha: {base: formData["system.stats.cha.base"]}
                }
            }
        };
        // Update the object
        this.object.update(updateData);
    }

    /* -------------------------------------------- */

    /** @override */
    getData(options) {
        let data = super.getData(options);
        data.stats = foundry.utils.duplicate(this.object.system.stats);
        for(let stat of Object.values(data.stats)){
            stat.mod = HandlebarsHelpers.numberFormat(Stats.getModFromStatValue(stat.base), {hash: {decimals: 0, sign: true}})
        }
        data.max = 6;
        data.total = Object.values(data.stats).map(s => parseInt(s.mod)).reduce((acc, curr) => acc + curr, 0);
        return data;
    }

}