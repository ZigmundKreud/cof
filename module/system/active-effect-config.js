import { COF } from "./config.js";

export class COFActiveEffectConfig extends ActiveEffectConfig {

    get template() {
        return "systems/cof/templates/effects/activeEffect-config.hbs";
    }

    getData() {
        let sheetData = super.getData();
        sheetData.config = COF;

        let targetType = this.object.getFlag("cof", "targetType");

        if (!targetType) {
            this.object.setFlag("cof", "targetType", "SelectEffectTarget");
            targetType = "SelectEffectTarget";
        }

        sheetData.targetType = targetType;

        return sheetData;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        html.find(".changeEffectTarget").click(this._onChangeffectTarget.bind(this));
    }

    _onChangeffectTarget(event) {
        event.preventDefault();

        let targetType = this.object.getFlag("cof", "targetType");
        if (targetType === "SelectEffectTarget") {
            this.object.setFlag("cof", "targetType", "InputEffectTarget");
        } else this.object.setFlag("cof", "targetType", "SelectEffectTarget");

    }

}