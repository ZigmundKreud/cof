/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
import { Stats } from "../system/stats.js";
import {COF} from "../system/config.js";

export class CofActor extends Actor {
    
    /* -------------------------------------------- */
    /*  Constructor                                 */
    /* -------------------------------------------- */
    /* Définition des images par défaut             */
    /* -------------------------------------------- */   
    constructor(...args) {
        let data = args[0];
        
        if (!data.img && COF.actorIcons[data.type]){
            data.img = COF.actorIcons[data.type];
            if (!data.token) data.token = {};
            if (!data.token.img) data.token.img = COF.actorIcons[data.type];
        }
        super(...args);
    }

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

    _prepareDerivedEncounterData(actorData) { 
        let attributes = actorData.data.attributes;
        
        // Points de vie
        if (attributes.hp.value > attributes.hp.max) attributes.hp.value = attributes.hp.max;
        if (attributes.hp.value < 0) attributes.hp.value = 0;
    }

    /* -------------------------------------------- */

    getActiveSpells(items) {
        return items.filter(i => i.data.type === "spell")
    }

    /* -------------------------------------------- */

    getProfile(items) {
        return items.find(i => i.data.type === "profile")
    }

    /* -------------------------------------------- */

    getSpecies(items) {
        return items.find(i => i.data.type === "species")
    }

    /* -------------------------------------------- */

    getActiveCapacities(items) {
        return items.filter(item => item.data.type === "capacity" && item.data.data.rank)
    }


    /**
     * @name computeModsAndAttributes
     * @description Effectue tous les calculs des caracatéristiques, initiative, attaques,
     *              DV, points de vie, points de chance, points de mana, points de récupération
     *              résistance aux dégâts
     * @public
     * 
     * @param {Actor.data} actorData 
     * 
     */
    computeModsAndAttributes(actorData) {

        let stats = actorData.data.stats;
        let attributes = actorData.data.attributes;
        let items = actorData.items;
        let lvl = actorData.data.level.value;
        let species = this.getSpecies(items);
        let profile = this.getProfile(items);

        // Caractéristiques et leurs modificateurs
        for (const [key, stat] of Object.entries(stats)) {
            stat.racial = (species && species.data.data.bonuses[key]) ? species.data.data.bonuses[key] : stat.racial;
            stat.value = stat.base + stat.racial + stat.bonus;
            stat.mod = Stats.getModFromStatValue(stat.value);
        }

        // Initiative
        attributes.init.base = stats.dex.value;
     
        // Encombrement de l'armure
        attributes.init.malus += this.getOverloadedMalusTotal();
        // Incompétence avec l'armure
        attributes.init.malus += this.getArmourMalus();
        // Incompétence avec le bouclier
        attributes.init.malus += this.getShieldMalus();

        attributes.init.value = attributes.init.base + attributes.init.bonus + attributes.init.malus;

        // Points de chance
        attributes.fp.base = this.computeBaseFP(stats.cha.mod, profile);
        attributes.fp.max = attributes.fp.base + attributes.fp.bonus;

        if (attributes.fp.value > attributes.fp.max) attributes.fp.value = attributes.fp.max;
        if (attributes.fp.value < 0) attributes.fp.value = 0;

        // Réduction des dommages
        attributes.dr.value = attributes.dr.base.value + attributes.dr.bonus.value;

        // Points de récupération
        attributes.rp.base = this.computeBaseRP(actorData);
        attributes.rp.max = attributes.rp.base + attributes.rp.bonus;

        if (attributes.rp.value >= attributes.rp.max) attributes.rp.value = attributes.rp.max;
        if (attributes.rp.value < 0) attributes.rp.value = 0;

        // DV
        if (profile) attributes.hd.value = profile.data.data.dv;
        attributes.hp.max = attributes.hp.base + attributes.hp.bonus;

        // Points de vie
        if (attributes.hp.value > attributes.hp.max) attributes.hp.value = attributes.hp.max;
        if (attributes.hp.value < 0) attributes.hp.value = 0;

        // Points de magie
        attributes.mp.base = this.getMagicPoints(lvl, stats, profile);
        attributes.mp.max = attributes.mp.base + attributes.mp.bonus;
        
        if (attributes.mp.value > attributes.mp.max) attributes.mp.value = attributes.mp.max;
        if (attributes.mp.value < 0) attributes.mp.value = 0;
    }

    /**
     * @name computeAttacks
     * @description Calcul les valeurs d'attaque (Contact, Distance, Magie)
     * @public
     * 
     * @param {Actor.data} actorData 
     * 
     */
     computeAttacks(actorData) {

        let stats = actorData.data.stats;                
        let lvl = actorData.data.level.value;

        let attacks = actorData.data.attacks;
        let melee = attacks.melee;
        let ranged = attacks.ranged;
        let magic = attacks.magic;

        // Retourne le modificateur en fonction de la caractéristique et d'un profil
        let items = actorData.items;
        let profile = this.getProfile(items);
        const meleeMod = this.getMeleeMod(stats, profile);
        const rangedMod = this.getRangedMod(stats, profile);
        const magicMod = this.getMagicMod(stats, profile);

        // Ajout du niveau
        melee.base = (meleeMod) ? meleeMod + lvl : lvl;
        ranged.base = (rangedMod) ? rangedMod + lvl : lvl;
        magic.base = (magicMod) ? magicMod + lvl : lvl;

        // Malus de l'incompétence avec les armures et boucliers
        for (let attack of Object.values(attacks)) {
            attack.malus += this.getArmourMalus() + this.getShieldMalus();
        }

        // Malus de l'encombrement de l'armure
        attacks.magic.malus += this.getOverloadedMalusTotal();
        attacks.ranged.malus += Math.ceil(this.getOverloadedMalusTotal()/2);

        // Calcul du total
        for (let attack of Object.values(attacks)) {
            attack.mod = attack.base + attack.bonus + attack.malus;
        }
    }

   /**
     * @name computeDef
     * @description Calcule la défense
     *      COF : 10 + Mod DEX + Défense Armure + Défense Bouclier
     * @public
     * 
     * @param {Actor.data} actorData
     * 
     */  
    computeDef(actorData) {
        let stats = actorData.data.stats;
        let attributes = actorData.data.attributes;

        const protection = this.getDefenceFromArmorAndShield();
        
        attributes.def.base = 10 + stats.dex.mod + protection;
        attributes.def.value = attributes.def.base + attributes.def.bonus + attributes.def.malus;
    }

   /**
     * @name computeXP
     * @description Calcule la dépense des XPs pour les achats des points de capacité
     *      COF : Les rangs 1 et 2 coûtent 1 XP, les rangs 3, 4 et 5 coûtent 2 XP
     * @public
     * 
     * @param {Actor.data} actorData
     * 
     */
    computeXP(actorData) {
        if (COF.debug) console.log("computeXP for ", actorData);
        let items = actorData.items;
        let lvl = actorData.data.level.value;
        const alert = actorData.data.alert;
        const capacities = this.getActiveCapacities(items);
        let currxp = capacities.map(cap => (cap.data.data.rank > 2) ? 2 : 1).reduce((acc, curr) => acc + curr, 0);
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

    /**
     * @name computeBaseFP
     * @description Calcule le nombre de points de chance de base
     * @public
     * 
     * @param {Int} charismeMod Modificateur de charisme
     * @param {CofItem} profile Item de type profile
     * 
     */
    computeBaseFP(charismeMod, profile) {
        return 3 + charismeMod;
    }

    /**
     * @name computeBaseRP
     * @description Calcule le nombre de points de récupération de base
     * @public 
     * 
     * @param {Actor.data} 
     * 
     */
    computeBaseRP(actorData) {
        return 5;
    }

    /**
     * @name getMeleeMod
     * @description Calcule le bonus d'attaque de contact en fonction du profil
     *      COF : Uniquement basé sur la force
     *      -> à implémenter dans chacun des modules Chroniques Oubliées.
     * @public
     * 
     * @param {Actor.data.data.stats} stats 
     * @param {Profile} profile, non utilisé dans COF
     * @returns {int} le bonus d'attaque de contact 
     */
    getMeleeMod(stats, profile) {
        let strMod = stats.str.mod;
        return strMod;
    }

   /**
     * @name getRangedMod
     * @description Calcule le bonus d'attaque à distance en fonction du profil
     *      COF : Uniquement basé sur la dextérité
     *      -> à implémenter dans chacun des modules Chroniques Oubliées.
     * @public
     * 
     * @param {Actor.data.data.stats} stats 
     * @param {Profile} profile, non utilisé dans COF
     * @returns {int} le bonus d'attaque à distance
     */    
    getRangedMod(stats, profile) {
        let dexMod = stats.dex.mod;
        return dexMod;
    }

   /**
     * @name getMagicMod
     * @description Calcule le bonus d'attaque de magie en fonction du profil
     *      COF : en fonction du profil, la caractéristique utilisée est Intelligence, Sagesse ou Charisme
     *      -> à implémenter dans chacun des modules Chroniques Oubliées.
     * @public
     * 
     * @param {Actor.data.data.stats} stats 
     * @param {Profile} profile
     * @returns {Int} le bonus d'attaque magique
     */    
    getMagicMod(stats, profile) {
        let intMod = stats.int.mod;
        let wisMod = stats.wis.mod;
        let chaMod = stats.cha.mod;

        // Caractéristique selon le profil
        let magicMod = intMod;
        if (profile) {
            switch (profile.data.data.spellcasting) {
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

   /**
     * @name getMagicPoints
     * @description Calcule le nombre de points de magie en fonction du profil
     *      COF : PM = Niveau + Mod Carac ou PM = 2 * Niv. + Mod Carac
     *            en fonction du profil, la caractéristique utilisée est Intelligence, Sagesse ou Charisme
     *            en fonction du profile, la base est le niveau * 2  
     *      -> à implémenter dans chacun des modules Chroniques Oubliées.
     * @public
     * 
     * @param {Int} level      
     * @param {Actor.data.data.stats} stats 
     * @param {CofItem} profile
     * @returns {Int} Le nombre de points de magie
     */    
    getMagicPoints(level, stats, profile) {
        let pm = 0

        const intMod = stats.int.mod;
        const wisMod = stats.wis.mod;
        const chaMod = stats.cha.mod;

        // Caractéristique et calcul selon le profil
        let magicMod = intMod;
        if (profile) {
            switch (profile.data.data.spellcasting) {
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
            if (profile.data.data.mpfactor === "2") {
                pm = (2 * level) + magicMod;
            }
            else if (profile.data.data.mpfactor === "1") {
                pm = level + magicMod;
            }
            else pm = magicMod;
        }

        if (pm < 0) pm = 0;
        return pm;
    }

    /**
     * @name getIncompetentMalus
     * @description Retourne le malus pour incompétence
     *      COF : Malus de 3
     * @public
     * 
     * @param {*} 
     * 
     */
    getIncompetentMalus() { return -3; }

    /**
     * @name getIncompetentSkillMalus
     * @description obtenir le malus lié à la notion PJ incompétent pour les jets de FOR et DEX
     *              Le malus est la somme du malus d'armure et de bouclier
     *      COF : pas encore implémenté
     *      -> à implémenter dans chacun des modules Chroniques Oubliées.
     * //TODO Implémenter dans COF
     * @param {string} skill le nom de la caractéristique
     * @returns {int} retourne le malus (nombre négatif)
     */
    getIncompetentSkillMalus(skill) {
        let malus = 0;
        if (game.settings.get("cof", "useIncompetentPJ")) {
            if (skill.includes("str") || skill.includes("dex")) {
                malus += this.getArmourMalus();
                malus += this.getShieldMalus();    
            }
        }
        return malus;
    }

    /**
     * @name getArmourMalus
     * @description Retourne le malus lié à l'armure
     *      COF : pas encore implémenté, retourne 0
     * @public
     * 
     * @param {*} 
     * @returns {int} retourne le malus (négatif)
     */    
    getArmourMalus() {
        return 0;
    }

    /**
     * @name getShieldMalus
     * @description Retourne le malus lié au bouclier
     *      COF : pas encore implémenté, retourne 0
     * @public
     * 
     * @param {*} 
     * @returns {int} retourne le malus (négatif)
     */      
    getShieldMalus() {
        return 0;
    };
    
    /**
     * @name getOverloadedSkillMalus
     * @description obtenir le malus lié à l'encombrement de l'armure pour les jets de compétence
     *      COF : Malus au jet de DEX
     * @public
     * 
     * @param {string} skill le nom de la caractéristique
     * @returns {int} retourne le malus (négatif)
     */
    getOverloadedSkillMalus(skill){
        let malus = 0;
        if (skill.includes("dex")) {
            const malusFromArmor = -1 * this.getDefenceFromArmor();
            const otherMod = this.getOverloadedOtherMod();
            malus = malus + (malusFromArmor + otherMod > 0 ? 0 : malusFromArmor + otherMod);
        }
        return malus;
    }

    /**
     * @name getOverloadedMalusTotal
     * @description obtenir le malus total lié à l'encombrement de l'armures pour l'initiative, l'attaque magique et l'attaque à distance
     *      COF : Pas de malus
     * 
     * @returns {int} retourne le malus (négatif)
     */
    getOverloadedMalusTotal() {
        const total = this.getOverloadedMalus() + this.getOverloadedOtherMod();
        return total <= 0 ? total : 0;
    }

    /**
     * @name getOverloadedMalus
     * @description obtenir le malus lié à l'encombrement de l'armures pour l'initiative, l'attaque magique et l'attaque à distance
     *      COF : Pas de malus
     * 
     * @returns {int} retourne le malus (négatif)
     */
    getOverloadedMalus() {
        return 0;
    }

    /**
     * @name getOverloadedOtherMod
     * @description obtenir les modificateurs liés à l'encombrement d'autres sources pour l'initiative, l'attaque magique, l'attaque à distance et les jets de compétence
     *      COF : Pas de malus
     * 
     * @returns {int} retourne le modificateur (positif ou négatif)
     */
    getOverloadedOtherMod() {
        return 0;
    }    

    /**
     * @name computeWeaponMod
     * @description calcule le modificateur final pour une arme
     *  Total = Mod lié à la caractéristique + Mod lié au bonus + malus éventuel d'incompétence en fonction de la catégorie de l'arme
     * //TODO      COF : pas encore implémenté
     *      -> à implémenter dans chacun des modules Chroniques Oubliées.
     * @param {int} itemModStat le modificateur issue de la caractéristique
     * @param {int} itemModBonus le modificateur issue du bonus
     * @param {string} weaponCategory la catégorie de l'arme
     *  COF : return "cof" en attendant l'implémentation
     * @returns {int} retourne le malus 
     */       
    computeWeaponMod(itemModStat, itemModBonus, weaponCategory) {
        let total = 0;
        let incompetentMod = 0;

        const fromStat = eval("this.data.data." + itemModStat);        
        if (game.settings.get("cof", "useIncompetentPJ") && weaponCategory && !this.isCompetentWithWeapon(weaponCategory)){
            incompetentMod = this.getIncompetentMalus();
        }
        total = fromStat + itemModBonus + incompetentMod;

        return total;
    }

    /**
     * @name computeDm
     * @description calculer les dégâts d'une arme
     *   Total = 
     *      COF : pas encore implémenté
     *      -> à implémenter dans chacun des modules Chroniques Oubliées.
     * //TODO Implémenter dans COF
     * @param {string} itemDmgBase le modificateur issue de la caractéristique
     * @param {string} itemDmgStat la caractéristique utilisée pour les dégâts
     * @param {int} itemDmgBonus le bonus aux dégâts
     *  COF : return "cof" en attendant l'implémentation
     * @returns {string} retourne la chaine de caractères utilisée pour le lancer de dés
     */      
    computeDm(itemDmgBase, itemDmgStat, itemDmgBonus) {
        let total = itemDmgBase;
        
        const fromStat = eval("this.data.data." + itemDmgStat);
        const fromBonus = (fromStat) ? parseInt(fromStat) + itemDmgBonus : itemDmgBonus;
        if (fromBonus < 0) total = itemDmgBase + " - " + parseInt(-fromBonus);
        if (fromBonus > 0) total = itemDmgBase + " + " + fromBonus;

        return total;
    }

    /**
     * @name isCompetentWithWeapon
     * @description retourne vrai si l'actor est compétent avec cette catégorie d'arme
     * 
     * @param {*} weaponCategory 
     * @returns {boolean}
     */
    isCompetentWithWeapon(weaponCategory) {
        const profile = this.getProfile(this.items);
        return this.isCompetent(weaponCategory, profile);
    }

    /**
     * @name isCompetentWithWeapon
     * @description retourne vrai si l'actor est compétent avec cette catégorie d'armure
     * 
     * @param {*} armorCategory 
     * @returns {boolean}
     */
    isCompetentWithArmor(armorCategory) {
        const profile = this.getProfile(this.items);
        return this.isCompetent(armorCategory, profile);
    }

    /**
     * @name isCompetent
     * @description retourne vrai si l'actor est compétent avec cette catégorie d'arme ou d'armure
     * 
     * @param {*} martialCategory 
     * @param {*} profile 
     * @returns {boolean}
     */
    isCompetent(martialCategory, profile){
        return true;
    }

    /**
     * @name getIncompetentArmour
     * @description obtenir la liste des armures non maîtrisées
     *              -> à implémenter dans chacun des modules Chroniques Oubliées.
     * 
     * @returns {Array} liste des armures non maîtrisées
     */
     getIncompetentArmour() { return; }

    /**
     * @name getIncompetentShields
     * @description obtenir la liste des boucliers non maîtrisés
     *              -> à implémenter dans chacun des modules Chroniques Oubliées.
     * @returns {Array} liste des boucliers non maîtrisés
     */
    getIncompetentShields() { return; }

    /**
     * @name getDefenceFromArmorAndShield
     * @description calcule la défense de l'armure et du bouclier équipés
     * @returns {Int} la somme des DEF
     */
    getDefenceFromArmorAndShield() {
        return this.getDefenceFromArmor() + this.getDefenceFromShield();
    }

    /**
     * @name getDefenceFromArmor
     * @description calcule la défense de l'armure équipée
     * @returns {Int} la valeur de défense
     */
    getDefenceFromArmor() {
        let protection = 0;
        let protections = this.data.items.filter(i => i.data.type === "item" && i.data.data.subtype === "armor" && i.data.data.worn && i.data.data.def).map(i => i.data.data.def);     
        if (protections.length > 0) protection = protections.reduce((acc, curr) => acc + curr, 0);
        return protection;
    }

    /**
     * @name getDefenceFromShield
     * @description calcule la défense du bouclier équipé
     * @returns {Int} la valeur de défense
     */
    getDefenceFromShield() {
        let protection = 0;
        let protections = this.data.items.filter(i => i.data.type === "item" && i.data.data.subtype === "shield" && i.data.data.worn && i.data.data.def).map(i => i.data.data.def);     
        if (protections.length > 0) protection = protections.reduce((acc, curr) => acc + curr, 0);
        return protection;
    }
    
}

