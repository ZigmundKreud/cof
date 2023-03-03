/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */

export class CofBaseSheet extends ActorSheet {

    /**
     * @name getPackPrefix
     * @description obtenir le préfixe utilisé pour les compendiums
     * 
     * @returns {String} L'identifiant du compendium
     */
    getPackPrefix() { return "cof-srd"; }

    /**
     * @name getPathRoot
     * @description obtenir le chemin du système ou module
     * 
     * @returns {String} le chemin
     */
    getPathRoot() { return "systems/cof/"; }

    /**
     * @name getLogoPath
     * @description obtenir l'url de l'image du logo
     * 
     * @returns {String} L'url du logo après le PathRoot
     */
    getLogoPath() { return "/ui/logo-banner.webp"; }

    /** @override */
	getData(options) {
        const context = super.getData(options);
        context.system = context.actor.system;
        context.logoPath = this.getPathRoot() + this.getLogoPath();
		context.isGm = game.user.isGM;
        context.effects = context.actor.effects;
        context.folded = {
            "combat": (context.system.settings?.combat) ? context.system.settings?.combat.folded : [],
            "inventory": (context.system.settings?.inventory) ? context.system.settings?.inventory.folded : [],
            "capacities": (context.system.settings?.capacities) ? context.system.settings?.capacities.folded : [],
            "effects": (context.system.settings?.effects) ? context.system.settings?.effects.folded : []
        };        
        return context;
	}
}
