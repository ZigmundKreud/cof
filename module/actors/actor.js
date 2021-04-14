/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
import { Stats } from "../system/stats.js";

export class CofActor extends Actor {

    /* -------------------------------------------- */
    /*  Data Preparation                            */
    /* -------------------------------------------- */
    /* Avant application des effets                 */
    /* -------------------------------------------- */
    /** @override */
    prepareBaseData() {
        let actorData = this.data;
        if (!actorData.data.settings) {
            actorData.data.settings = {
                "combat": { "folded": [] },
                "inventory": { "folded": [] },
                "capacities": { "folded": [] },
                "effects": { "folded": [] }
            };
        }
        if (actorData.type === "loot") this._prepareBaseLootData(actorData);
        else if (actorData.type === "encounter") this._prepareBaseEncounterData(actorData);
        else this._prepareBaseCharacterData(actorData);
    }

    /* -------------------------------------------- */
    /* Après application des effets                 */
    /* -------------------------------------------- */
    /** @override */
    prepareDerivedData() {
        let actorData = this.data;
        if (actorData.type === "loot") this._prepareDerivedLootData(actorData);
        else if (actorData.type === "encounter") this._prepareDerivedEncounterData(actorData);
        else this._prepareDerivedCharacterData(actorData);
    }

    /* -------------------------------------------- */

    _prepareBaseLootData(actorData) { }

    /* -------------------------------------------- */

    _prepareDerivedLootData(actorData) { }

    /* -------------------------------------------- */

    _prepareBaseCharacterData(actorData) {
        this.computeModsAndAttributes(actorData);
        this.computeAttacks(actorData);
        this.computeIncompetentPJ(actorData);
    }
    /* -------------------------------------------- */

    _prepareDerivedCharacterData(actorData) {
        this.computeModsAndAttributes(actorData);
        this.computeAttacks(actorData);
        this.computeDef(actorData);
        this.computeXP(actorData);
    }

    /* -------------------------------------------- */

    _prepareBaseEncounterData(actorData) {
        // STATS
        let stats = actorData.data.stats;
        // COMPUTE STATS FROM MODS
        for (let stat of Object.values(stats)) {
            stat.value = Stats.getStatValueFromMod(stat.mod);
        }

        // ATTACKS
        if (!actorData.data.attacks) {
            actorData.data.attacks = {
                "melee": {
                    "key": "melee",
                    "label": "COF.attacks.melee.label",
                    "abbrev": "COF.attacks.melee.abbrev",
                    "stat": "@stats.str.mod",
                    "enabled": true,
                    "base": Math.ceil(actorData.data.nc.value) + actorData.data.stats.str.mod,
                    "bonus": 0,
                    "mod": Math.ceil(actorData.data.nc.value) + actorData.data.stats.str.mod
                },
                "ranged": {
                    "key": "ranged",
                    "label": "COF.attacks.ranged.label",
                    "abbrev": "COF.attacks.ranged.abbrev",
                    "stat": "@stats.dex.mod",
                    "enabled": true,
                    "base": Math.ceil(actorData.data.nc.value) + actorData.data.stats.dex.mod,
                    "bonus": 0,
                    "mod": Math.ceil(actorData.data.nc.value) + actorData.data.stats.dex.mod
                },
                "magic": {
                    "key": "magic",
                    "label": "COF.attacks.magic.label",
                    "abbrev": "COF.attacks.magic.abbrev",
                    "stat": "@stats.int.mod",
                    "enabled": true,
                    "base": Math.ceil(actorData.data.nc.value) + actorData.data.stats.int.mod,
                    "bonus": 0,
                    "mod": Math.ceil(actorData.data.nc.value) + actorData.data.stats.int.mod
                }
            }
        } else {
            let attacks = actorData.data.attacks;
            for (let attack of Object.values(attacks)) {
                attack.mod = attack.base + attack.bonus;
            }
        }

        // MODIFY TOKEN REGARDING SIZE
        switch (actorData.data.details.size) {
            case "big":
                actorData.token.width = 2;
                actorData.token.height = 2;
                break;
            case "huge":
                actorData.token.width = 4;
                actorData.token.height = 4;
                break;
            case "colossal":
                actorData.token.width = 8;
                actorData.token.height = 8;
                break;
            case "tiny":
            case "small":
            case "short":
            case "med":
            default:
                break;
        }
    }

    /* -------------------------------------------- */

    _prepareDerivedEncounterData(actorData) { }

    /* -------------------------------------------- */

    getActiveSpells(items) {
        // return items.filter(item => item.type === "spell" && item.data.worn)
        return items.filter(item => item.type === "spell")
    }

    /* -------------------------------------------- */

    getProfile(items) {
        return items.find(i => i.type === "profile")
    }

    /* -------------------------------------------- */

    getSpecies(items) {
        return items.find(i => i.type === "species")
    }

    /* -------------------------------------------- */

    getActiveCapacities(items) {
        return items.filter(i => i.type === "capacity" && i.data.rank)
    }


    /* -------------------------------------------- */

    computeModsAndAttributes(actorData) {

        let stats = actorData.data.stats;
        let attributes = actorData.data.attributes;
        let items = actorData.items;
        let lvl = actorData.data.level.value;
        let species = this.getSpecies(items);
        let profile = this.getProfile(items);

        for (const [key, stat] of Object.entries(stats)) {
            stat.racial = (species && species.data.bonuses[key]) ? species.data.bonuses[key] : stat.racial;
            stat.value = stat.base + stat.racial + stat.bonus;
            stat.mod = Stats.getModFromStatValue(stat.value);
        }

        attributes.init.base = stats.dex.value;
        attributes.init.value = attributes.init.base + attributes.init.bonus;

        // Points de chance
        attributes.fp.base = this.computeBaseFP(stats.cha.mod, profile);
        attributes.fp.max = attributes.fp.base + attributes.fp.bonus;

        if (attributes.fp.value >= attributes.fp.max) attributes.fp.value = attributes.fp.max;
        if (attributes.fp.value < 0) attributes.fp.value = 0;

        // Réduction des dommages
        attributes.dr.value = attributes.dr.base.value + attributes.dr.bonus.value;

        // Points de récupération
        attributes.rp.base = this.computeBaseRP(actorData);
        attributes.rp.max = attributes.rp.base + attributes.rp.bonus;
        if (attributes.rp.value >= attributes.rp.max) attributes.rp.value = attributes.rp.max;
        if (attributes.rp.value < 0) attributes.rp.value = 0;

        // Points de vie
        attributes.hp.max = attributes.hp.base + attributes.hp.bonus;
        if (attributes.hp.value >= attributes.hp.max) attributes.hp.value = attributes.hp.max;
        if (attributes.hp.value < 0) attributes.hp.value = 0;

        // Points de magie
        const magicMod = this.getMagicMod(stats, profile);
        if (profile) {
            attributes.hd.value = profile.data.dv;
            attributes.mp.base = profile.data.mpfactor * (lvl + magicMod);
        }
        else attributes.mp.base = 0;
        attributes.mp.max = attributes.mp.base + attributes.mp.bonus;

        // Point de magie
        if (attributes.mp.value >= attributes.mp.max) attributes.mp.value = attributes.mp.max;
        if (attributes.mp.value < 0) attributes.mp.value = 0;
    }

    /* -------------------------------------------- */

    computeBaseFP(charismeMod, profile) {
        return 3 + charismeMod;
    }

    computeBaseRP(actorData) {
        return 5;
    }

    computeAttacks(actorData) {

        let stats = actorData.data.stats;
        let attacks = actorData.data.attacks;
        let items = actorData.items;
        let lvl = actorData.data.level.value;
        let profile = this.getProfile(items);

        let melee = attacks.melee;
        let ranged = attacks.ranged;
        let magic = attacks.magic;

        // STATS RELATED TO PROFILE
        const meleeMod = this.getMeleeMod(stats, profile);
        const rangedMod = this.getRangedMod(stats, profile);
        const magicMod = this.getMagicMod(stats, profile);
        melee.base = (meleeMod) ? meleeMod + lvl : lvl;
        ranged.base = (rangedMod) ? rangedMod + lvl : lvl;
        magic.base = (magicMod) ? magicMod + lvl : lvl;
        for (let attack of Object.values(attacks)) {
            attack.mod = attack.base + attack.bonus;
        }
    }


    /* -------------------------------------------- */

    getMeleeMod(stats, profile) {
        let strMod = stats.str.mod;
        return strMod;
    }

    getRangedMod(stats, profile) {
        let dexMod = stats.dex.mod;
        return dexMod;
    }

    getMagicMod(stats, profile) {

        let intMod = stats.int.mod;
        let wisMod = stats.wis.mod;
        let chaMod = stats.cha.mod;

        // STATS RELATED TO PROFILE
        let magicMod = intMod;
        if (profile) {
            switch (profile.data.spellcasting) {
                case "wis":
                    magicMod = wisMod;
                    break;
                case "cha":
                    magicMod = chaMod;
                    break;
                default:
                    magicMod = intMod;
                    break;
            }
        }
        return magicMod;
    }

    /* -------------------------------------------- */

    computeDef(actorData) {
        let stats = actorData.data.stats;
        let attributes = actorData.data.attributes;
        let protections = actorData.items.filter(i => i.type === "item" && i.data.worn && i.data.def).map(i => i.data.def);
        // COMPUTE DEF SCORES
        let protection = protections.reduce((acc, curr) => acc + curr, 0);
        attributes.def.base = 10 + protection + stats.dex.mod;
        attributes.def.value = attributes.def.base + attributes.def.bonus;
    }

    /* -------------------------------------------- */

    computeXP(actorData) {
        let items = actorData.items;
        let lvl = actorData.data.level.value;
        const alert = actorData.data.alert;
        const capacities = this.getActiveCapacities(items);
        let currxp = capacities.map(cap => (cap.data.rank > 2) ? 2 : 1).reduce((acc, curr) => acc + curr, 0);
        const maxxp = 2 * lvl;
        // UPDATE XP
        actorData.data.xp.max = maxxp;
        actorData.data.xp.value = maxxp - currxp;
        if (maxxp - currxp < 0) {
            const diff = currxp - maxxp;
            alert.msg = (diff == 1) ? `Vous avez dépensé ${diff} point de capacité en trop !` : `Vous avez dépensé ${diff} points de capacité en trop !`;
            alert.type = "error";
        } else if (maxxp - currxp > 0) {
            const diff = maxxp - currxp;
            alert.msg = (diff == 1) ? `Il vous reste ${diff} point de capacité à dépenser !` : `Il vous reste ${diff} points de capacité à dépenser !`;
            alert.type = "info";
        } else {
            alert.msg = null;
            alert.type = null;
        }
    }

    // Notion PJ incompétent 
    /**
     * @name computeIncompetentPJ
     * @description Cacule les malus liées aux équipements non maîtrisés par le PJ
     *              -> à implémenter dans chacun des modules Chroniques Oubliées.
     * @public @override
     * 
     * @param {CofActor} actorData l'acteur
     */
    computeIncompetentPJ(actorData) {
        // Traitement d'affectation à faire ici

        // Obligatoire, doit être fait après le traitement d'affectation
        this.computeModsAndAttributes(actorData);
        this.computeAttacks(actorData);
        //met à jour le mod des armes de mélée ou/et à distance utilisées
        actorData.items.filter(item => item.data.subtype === "melee" && item.data.worn === true).forEach(element => { element.data.mod = actorData.data.attacks.melee.mod; });
        actorData.items.filter(item => item.data.subtype === "ranged" && item.data.worn === true).forEach(element => { element.data.mod = actorData.data.attacks.ranged.mod; });
    }

    /**
     * @name getIncompetentArmour
     * @description obtenir la liste des armures non maîtrisées
     * 
     * @returns {Array} liste des armures non maîtrisées
     */
    getIncompetentArmour() { return new Array(); }

    /**
     * @name getIncompetentShields
     * @description obtenir la liste des boucliers non maîtrisés
     *              -> à implémenter dans chacun des modules Chroniques Oubliées.
     * @returns {Array} liste des boucliers non maîtrisés
     */
    getIncompetentShields() { return new Array(); }

    /**
     * @name getIncompetentMeleeWeapons
     * @description obtenir la liste des armes de mélée non maîtrisées
     *              -> à implémenter dans chacun des modules Chroniques Oubliées.
     * @returns {Array} liste des armes de mélée non maîtrisées
     */
    getIncompetentMeleeWeapons() { return new Array(); }

    /**
    * @name getIncompetentRangedWeapons
    * @description obtenir la liste des armes à distance non maîtrisées
    *              -> à implémenter dans chacun des modules Chroniques Oubliées.
    * @returns {Array} liste des armes à distance non maîtrisées
    */
    getIncompetentRangedWeapons() { return new Array(); }

    /**
     * @name getIncompetentSkillMalus
     * @description obtenir le malus liée à la notion PJ incompétent
     *              -> à implémenter dans chacun des modules Chroniques Oubliées.
     * 
     * @param {string} skill le nom de la caractéristique
     * @returns {int} retourne le malus 
     */
    getIncompetentSkillMalus(skill) { return 0; }
}

