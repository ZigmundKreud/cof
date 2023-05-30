import { COF } from "./config.js";

export class COFActiveEffectConfig extends ActiveEffectConfig {

    get template() {
        return "systems/cof/templates/effects/active-effect-config.hbs";
    }

    async getData(options = {}) {
        let context = await super.getData(options);
        context.config = COF;

        let lockDuringPause = game.settings.get("cof", "lockDuringPause") && game.paused;
        options.editable &= (game.user.isGM || !lockDuringPause);

        let targetType = this.object.getFlag("cof", "targetType");

        if (!targetType) {
            this.object.setFlag("cof", "targetType", "SelectEffectTarget");
            targetType = "SelectEffectTarget";
        }

        context.targetType = targetType;

        return context;
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