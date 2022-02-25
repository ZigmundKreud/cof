/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
import { Stats } from "../system/stats.js";
import { COF } from "../system/config.js";
import { Macros } from "../system/macros.js";
import { CofRoll } from "../controllers/roll.js";
import { CofSkillRoll } from "../controllers/skill-roll.js";
import { CofDamageRoll } from "../controllers/dmg-roll.js";

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
        
        // S'il s'agit d'un actor de type "encounter", on lui ajoute la méthode "rollWeapon"
        if (data.type === "encounter"){
            this.rollWeapon = async function(weaponId, customLabel="", dmgOnly=false, bonus=0, malus=0, dmgBonus=0, skillDescr="", dmgDescr="", dialog=true){
                let weapons = this.data.data.weapons;
                if ((Array.isArray(weapons) && weapons.length <= weaponId) || !weapons[weaponId]){
                    ui.notifications.warn(`${game.i18n.localize("COF.notification.WeaponIndexMissing")} ${weaponId}`);
                    return;
                }
                let weapon = this.data.data.weapons[weaponId];
                let label = customLabel ? customLabel : weapon.name;

                if (dialog){
                    if (!dmgOnly) CofRoll.rollWeaponDialog(this, label, weapon.mod, bonus, malus, weapon.critrange, weapon.dmg, dmgBonus, null, skillDescr, dmgDescr, this.isWeakened());
                    else CofRoll.rollDamageDialog(this, label, weapon.dmg, dmgBonus, false, null, dmgDescr);
                }
                else
                {
                    let formula = dmgBonus ? `${weapon.dmg} + ${dmgBonus}` : weapon.dmg;
                    if (dmgOnly) new CofDamageRoll(label, formula, false, dmgDescr).roll(); 
                    else {        
                        let skillRoll = await new CofSkillRoll(label, this.isWeakened() ? "1d12": "1d20", `+${+weapon.mod}`, bonus, malus, null, weapon.critrange, skillDescr).roll();

                        let result = skillRoll.dice[0].results[0].result;
                        let critical = ((result >= weapon.critrange.split("-")[0]) || result == 20);
                        
                        new CofDamageRoll(label, formula, critical, dmgDescr).roll();                            
                    }                    
                }
            }
        }
    }

  /** @inheritdoc */
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);

    // Token size category
    const s = CONFIG.COF.tokenSizes[this.data.data.details.size || "med"];
    this.data.token.update({width: s, height: s});

    // Player character configuration
    if ( this.type === "character" ) {
      this.data.token.update({vision: true, actorLink: true, disposition: 1});
    }
    
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async _preUpdate(changed, options, user) {
    await super._preUpdate(changed, options, user);

    // Apply changes in Actor size to Token width/height
    const newSize = foundry.utils.getProperty(changed, "data.details.size");
    if ( newSize && (newSize !== foundry.utils.getProperty(this.data, "data.details.size")) ) {
      let size = CONFIG.COF.tokenSizes[newSize];
      if ( !foundry.utils.hasProperty(changed, "token.width") ) {
        changed.token = changed.token || {};
        changed.token.height = size;
        changed.token.width = size;
      }
      
    }
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

      /** @override 
    applyActiveEffects() {
        // The Active Effects do not have access to their parent at preparation time so we wait until this stage to
        // determine whether they are suppressed or not.
        // this.effects.forEach(e => e.determineSuppression());
        console.log("Custom applyActiveEffects");
        return super.applyActiveEffects();
    }*/

    /* -------------------------------------------- */

    _prepareBaseEncounterData(actorData) {
  
        // MODIFY TOKEN REGARDING SIZE
        /*
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
                actorData.token.width = 0.25;
                actorData.token.height = 0.25;
                break;
            case "small":
                actorData.token.width = 0.5;
                actorData.token.height = 0.5;
                break;
            case "short":
                actorData.token.width = 0.8;
                actorData.token.height = 0.8;
                break;
            case "med":
            default:
                break;
        }
        */
    }

    /* -------------------------------------------- */

    _prepareDerivedEncounterData(actorData) { 
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
        
        attributes.init.malus = this.getMalusToInitiative();
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

        // Malus de l'incompétence avec l'armure ou le bouclier
        for (let attack of Object.values(attacks)) {
            attack.malus = this.getIncompetentArmourMalus() + this.getIncompetentShieldMalus();
        }

        // Malus de l'encombrement de l'armure
        attacks.magic.malus += this.getOverloadMalusToMagicAttack();
        attacks.ranged.malus += this.getOverloadMalusToRangedAttack();

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
        let data = actorData.data;

        let stats = data.stats;
        let attributes = data.attributes;

        const protection = this.getDefenceFromArmorAndShield();
        
        attributes.def.base = 10 + stats.dex.mod + protection ;
        attributes.def.value = attributes.def.base + attributes.def.bonus + attributes.def.malus;
    }

   /**
     * @name computeXP
     * @description Calcule la dépense des XPs pour les achats des points de capacité
     *      COF : 
     *          Voie standard : Les rangs 1 et 2 coûtent 1 XP, les rangs 3, 4 et 5 coûtent 2 XP
     *          Voie de prestige : tous les rangs coûtent 2 XPs
     * 
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
        let currxp = capacities.map(cap => {
            const path = this.getItemByName(cap.data.data.path.name);
            const isPrestige = path?.data.data.properties.prestige ? true : false;
            const cost = isPrestige ? 2 : (cap.data.data.rank > 2 ? 2 : 1);
            return cost;
            }).reduce((acc, curr) => acc + curr, 0);
        const maxxp = 2 * lvl;
        // UPDATE XP
        actorData.data.xp.max = maxxp;
        actorData.data.xp.value = maxxp - currxp;
        if (maxxp - currxp < 0) {
            const diff = currxp - maxxp;
            alert.msg = game.i18n.format('COF.msg.xp.superior', {diff:diff, plural:diff > 1 ? 's' : ''});             
            alert.type = "error";
        } else if (maxxp - currxp > 0) {
            const diff = maxxp - currxp;
            alert.msg = game.i18n.format('COF.msg.xp.inferior', {diff:diff, plural:diff > 1 ? 's' : ''});  
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
     * @param {string} skill le nom de la caractéristique
     * @returns {int} retourne le malus (nombre négatif)
     */
    getIncompetentSkillMalus(skill) {
        let malus = 0;
        if (game.settings.get("cof", "useIncompetentPJ")) {
            if (skill.includes("str") || skill.includes("dex")) {
                malus += this.getIncompetentArmourMalus();
                malus += this.getIncompetentShieldMalus();    
            }
        }
        return malus;
    }

    /**
     * @name getMalusToInitiative
     * @description Retourne le malus à l'initiative lié à l'armure et à l'incompétence armes/armures
     * @public
     * 
     * @returns {int} retourne le malus (négatif) ou 0
     */
    getMalusToInitiative() {
        return this.getOverloadMalusToInitiative() + this.getIncompetentMalusToInitiative();
    }
    
    /**
     * @name getOverloadMalusToInitiative
     * @description Retourne le malus à l'initiative lié à l'armure
     * @public
     * 
     * @returns {int} retourne le malus (négatif) ou 0 ; dans COF retourne 0
     */
    getOverloadMalusToInitiative() {
        return 0;
    }

    /**
     * @name getIncompetentMalusToInitiative
     * @description Retourne le malus à l'initiative lié à l'incompétence armes/armures
     * @public
     * 
     * @returns {int} retourne le malus (négatif) ou 0 ; dans COF retourne 0
     */
     getIncompetentMalusToInitiative() {
        return 0;
    }
    
    /**
     * @name getOverloadMalusToRangedAttack
     * @description Retourne le malus à l'attaque à distance lié à l'encombrement et l'incompétence
     * @public
     * 
     * @returns {int} retourne le malus (négatif) ou 0 ; dans COF retourne 0
     */
     getOverloadMalusToRangedAttack() {
        return 0;
    }
    
    /**
     * @name getOverloadMalusToMagicAttack
     * @description Retourne le malus à l'attaque magique lié à l'encombrement et l'incompétence
     * @public
     * 
     * @returns {int} retourne le malus (négatif) ou 0 ; dans COF retourne 0
     */    
     getOverloadMalusToMagicAttack() {
        return 0;
    }
    
    /**
     * @name getIncompetentArmourMalus
     * @description Retourne le malus d'incompétence lié à l'armure
     * @public
     * 
     * @param {*} 
     * @returns {int} retourne le malus (négatif)
     */    
    getIncompetentArmourMalus() {
        /*if (game.settings.get("cof", "useIncompetentPJ")){
            return -3;
        }*/
        return 0;
    }

    /**
     * @name getIncompetentShieldMalus
     * @description Retourne le malus d'incompétence lié au bouclier
     * @public
     * 
     * @param {*} 
     * @returns {int} retourne le malus (négatif)
     */      
    getIncompetentShieldMalus() {
        /*if (game.settings.get("cof", "useIncompetentPJ")){
            return -3;
        }*/
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
            if (game.settings.get("cof","useOverload")) {
                const malusFromArmor = this.getMalusFromArmor();
                const otherMod = this.getOverloadedOtherMod();
                malus = malus + (malusFromArmor + otherMod > 0 ? 0 : malusFromArmor + otherMod);
            }
        }
        return malus;
    }

    /**
     * @name getOverloadedMalusTotal
     * @description obtenir le malus total lié à l'encombrement de l'armure
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
     * @description obtenir le malus lié à l'encombrement de l'armure
     * 
     * @returns {int} retourne le malus (négatif)
     */
    getOverloadedMalus() {
        return this.getMalusFromArmor();
    }

    /**
     * @name getMalusFromArmor
     * @description calcule le malus lié à l'armure équipée, en tenant compte du bonus éventuel qui diminue le malus
     * @returns {Int} 0 ou la valeur négative du malus
     */
    getMalusFromArmor() {
            let malus = 0;
            let protections = this.data.items.filter(i => i.data.type === "item" && i.data.data.subtype === "armor" && i.data.data.worn && i.data.data.def).map(i => (-1 * i.data.data.defBase) + i.data.data.defBonus);     
            if (protections.length > 0) malus = protections.reduce((acc, curr) => acc + curr, 0);
            return malus;
    }

    /**
     * @name getOverloadedOtherMod
     * @description obtenir les modificateurs liés à l'encombrement d'autres sources pour l'initiative, l'attaque magique, l'attaque à distance et les jets de compétence
     * 
     * @returns {int} retourne le modificateur (positif ou négatif)
     */
    getOverloadedOtherMod() {
        return this.data.data?.attributes?.overload?.misc ? this.data.data?.attributes?.overload?.misc : 0;
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
     * @param {int} itemDmgBonus le bonus aux dégâts de l'arme
     * @param {int} skillDmgBonus le bonus aux dégâts du skill
     *  COF : return "cof" en attendant l'implémentation
     * @returns {string} retourne la chaine de caractères utilisée pour le lancer de dés
     */      
    computeDm(itemDmgBase, itemDmgStat, itemDmgBonus, skillDmgBonus) {
        let total = itemDmgBase;
        
        const fromStat = eval("this.data.data." + itemDmgStat);
        let fromBonus = (fromStat) ? parseInt(fromStat) + itemDmgBonus : itemDmgBonus;
        fromBonus += skillDmgBonus;
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

    /**
     * @name rollStat
     * @description Lance un dé pour l'habilité demandée
     * @returns {Promise}
     */
    rollStat(stat, options = {}) {
        const { bonus = 0, malus = 0 } = options;

        return Macros.rollStatMacro(this, stat, bonus, malus, null, options.label, options.descr, options.dialog, options.dice, options.difficulty);
    }

    /**
    * @name syncItemActiveEffects
    * @param {*} item 
    * @description synchronise l'état des effets qui appartiennent à un item à un nouveau statut
    * @returns {Promise}
    */
    syncItemActiveEffects(item, value){
        // Récupération des effets qui proviennent de l'item
        //let effectsData = this.effects.filter(effect=>effect.data.origin.endsWith(item.id))?.map(effect=> duplicate(effect.data));
        let effectsData = this.getEffectsFromItemId(item.id)?.map(effect => duplicate(effect.data));
        
        if (effectsData.length > 0){        
            effectsData.forEach(effect => effect.disabled = value);

            this.updateEmbeddedDocuments("ActiveEffect", effectsData);
        }
    }    

    /**
     * @name rollWeapon
     * @description
     * @returns {Promise}
     */
     rollWeapon(item, options = {}) {
        return Macros.rollItemMacro(item.id, item.name, item.type, options.bonus, options.malus, options.dmgBonus, options.dmgOnly, options.customLabel, options.skillDescr, options.dmgDescr, options.dialog);
     }
    
    /**
     * 
     * @param {*} item 
     * @param {*} bypassChecks 
     * @returns 
     */
     toggleEquipItem(item, bypassChecks) {
        if (!this.canEquipItem(item, bypassChecks)) return;        

        const equipable = item.data.data.properties.equipable;
        if(equipable){
            let itemData = duplicate(item.data);
            itemData.data.worn = !itemData.data.worn;

            if (game.settings.get("cof", "useIncompetentPJ") && itemData.data.worn) {
                // Prend en compte les règles de PJ Incompétent : utilisation d'équipement non maîtrisé par le PJ
                if (itemData.data.subtype === "armor" || itemData.data.subtype === "shield") {
                    const armorCategory = item.getMartialCategory();
                    if (!this.isCompetentWithArmor(armorCategory)) {
                        ui.notifications?.warn(game.i18n.format('COF.notification.incompetentWithArmor', {name:this.name, item:item.name}));
                    }    
                }
                if (itemData.data.subtype === "melee" || itemData.data.subtype === "ranged") {
                    const weaponCategory = item.getMartialCategory();
                    if (!this.isCompetentWithWeapon(weaponCategory)) {
                        ui.notifications?.warn(game.i18n.format('COF.notification.incompetentWithWeapon', {name:this.name, item:item.name}));
                    }    
                }
            }
            return item.update(itemData).then((item)=>{
                AudioHelper.play({ src: "/systems/cof/sounds/sword.mp3", volume: 0.8, autoplay: true, loop: false }, false);
                if (!bypassChecks) this.syncItemActiveEffects(item, !itemData.data.worn);
            });
        }
    }
       
    /**
     * Check if an item can be equiped
     * @param item
     * @param bypassChecks      
     */        
     canEquipItem(item, bypassChecks) {
        if (!this.items.some(it=>it.id === item.id)){
            ui.notifications.warn(game.i18n.format('COF.notification.MacroItemMissing', {item:item.name}));
            return false;
        }
        let itemData = item.data.data;
        if (!itemData?.properties.equipment || !itemData?.properties.equipable){
            ui.notifications.warn(game.i18n.format("COF.notification.ItemNotEquipable", {itemName:item.name}));
            return;
        }
      
        if (!this._hasEnoughFreeHands(item, bypassChecks)){
            ui.notifications.warn(game.i18n.localize("COF.notification.NotEnoughFreeHands"));
            return false;
        }
        if (!this._isArmorSlotAvailable(item, bypassChecks)){
            ui.notifications.warn(game.i18n.localize("COF.notification.ArmorSlotNotAvailable"));
            return false;
        }
        
        return true;
    }

    /**
     * Check if actor has enough free hands to equip this item
     * @param event
     * @param bypassChecks     
     * @private
     */    
     _hasEnoughFreeHands(item, bypassChecks){
        // Si le contrôle de mains libres n'est pas demandé, on renvoi Vrai
        let checkFreehands = game.settings.get("cof", "checkFreeHandsBeforeEquip");
        if (!checkFreehands || checkFreehands === "none") return true;

        // Si le contrôle est ignoré ponctuellement avec la touche MAJ, on renvoi Vrai
        if (bypassChecks && (checkFreehands === "all" || (checkFreehands === "gm" && game.user.isGM))) return true;      
        
        // Si l'objet est équipé, on tente de le déséquiper donc on ne fait pas de contrôle et on renvoi Vrai
        if (item.data.data.worn) return true;

        // Si l'objet n'est pas tenu en main, on renvoi Vrai
        if (item.data.data.slot !== "hand") return true;

        // Nombre de mains nécessaire pour l'objet que l'on veux équipper
        let neededHands = item.data.data.properties["2H"] ? 2 : 1;

        // Calcul du nombre de mains déjà utilisées
        let itemsInHands = this.items.filter(item=>item.data.data.worn && item.data.data.slot === "hand");
        let usedHands = 0;
        itemsInHands.forEach(item=>usedHands += item.data.data.properties["2H"] ? 2 : 1);                

        return usedHands + neededHands <= 2;        
    }

    /**
     * Check if armor slot is available to equip this item
     * @param event
     * @param bypassChecks          
     * @private
     */        
    _isArmorSlotAvailable(item, bypassChecks){
        // Si le contrôle de disponibilité de l'emplacement d'armure n'est pas demandé, on renvoi Vrai
        let checkArmorSlotAvailability = game.settings.get("cof", "checkArmorSlotAvailability");
        if (!checkArmorSlotAvailability || checkArmorSlotAvailability === "none") return true;

        // Si le contrôle est ignoré ponctuellement avec la touche MAJ, on renvoi Vrai
        if (bypassChecks && (checkArmorSlotAvailability === "all" || (checkArmorSlotAvailability === "gm" && game.user.isGM))) return true;
        
        const itemData = item.data.data;

        // Si l'objet est équipé, on tente de le déséquiper donc on ne fait pas de contrôle et on renvoi Vrai
        if (itemData.worn) return true;
        
        // Si l'objet n'est pas une protection, on renvoi Vrai
        if (!itemData.properties.protection) return true;

        // Recheche d'une item de type protection déjà équipé dans le slot cible
        let equipedItem = this.items.find((slotItem)=>{
            let slotItemData = slotItem.data.data;

            return slotItemData.properties?.protection && slotItemData.properties.equipable && slotItemData.worn && slotItemData.slot === itemData.slot;
        });
        
        // Renvoie vrai si le le slot est libre, sinon renvoi faux
        return !equipedItem;    
    }   

    /**
     * Consume one item
     * @param {*} item 
     * @returns l'objet avec la quantité mise à jour
     */
    consumeItem(item) {
        const consumable = item.data.data.properties.consumable;
        const quantity = item.data.data.qty;

        if (consumable && quantity > 0) {
            AudioHelper.play({ src: "/systems/cof/sounds/gulp.mp3", volume: 0.8, autoplay: true, loop: false }, false);
            return item.modifyQuantity(1,true).then(item => item.applyEffects(this));;
        }
        return ui.notifications.warn(game.i18n.localize("COF.notification.ConsumeEmptyObject"));
    }

    /**
     * @name getItemByName
     * @description
     * @param {*} itemName 
     * @returns
     */
    getItemByName(itemName){
        return this.items.find(item=>item.name === itemName);
    }

    /**
     * 
     * @param {*} item 
     * @returns 
     */
    isItemEquipped(item){
        if (!this.items.some(it=>it._id === item._id)){
            ui.notifications.warn(game.i18n.format('COF.notification.MacroItemMissing', {item:item.name}));
            return false;
        }
        return (item.data.data.properties?.equipable ?? false) && item.data.data.worn;
    }
    
    /**
     * @name getLevel
     * @description Get Actor level 
     * @returns 
     */
    getLevel(){
        return this.data.data.level?.value;
    }

    /**
     * @name getDV
     * @description Get Actor HD
     * @returns 
     */
    getDV(){
        return this.data.data.attributes.hd.value;
    }

    /**
     * @name getStatMod 
     * @description Get Actor Mod of a specific stat
     * @param stat en français ou anglais
     * @returns le Mod de la caractéristique
     */
    getStatMod(stat){
        let statObj;
        switch(stat){
			case "for" :
			case "str" : statObj = this.data.data.stats?.str; break;
			case "dex" : statObj = this.data.data.stats?.dex; break;
			case "con" : statObj = this.data.data.stats?.con; break;
			case "int" : statObj = this.data.data.stats?.int; break;
			case "sag" :
			case "wis" : statObj = this.data.data.stats?.wis; break;
			case "cha" : statObj = this.data.data.stats?.cha; break;
			case "atc" :
			case "melee" : statObj = this.data.data.attacks?.melee; break;
			case "atd" :
			case "ranged" : statObj = this.data.data.attacks?.ranged; break;
			case "atm" :
			case "magic" : statObj = this.data.data.attacks?.magic; break;
			default :				
				return null;
		}
		return statObj?.mod;
    }     
    
    /**
     * 
     * @param {*} pathName 
     * @returns 
     */
    getPathRank(pathName){
        let rank = 0;
        let path = this.getItemByName(pathName);
        if (path){

            let capacities = [...path.data.data.capacities];
            capacities.sort((a,b)=>{
                if (a.data.rank < b.data.rank) return 1;
                if (a.data.rank > b.data.rank) return 0;
                else return -1
            });

            rank = capacities.find(capa=>capa.data.checked)?.data.rank; 
        }
        return rank;
    }
    
    /**
     * Activate a capacity
     * @param {*} item 
     * @returns 
     */
     activateCapacity(capacity) {
        const capacityData = capacity.data.data;
        const activable = capacityData.activable;
        const limitedUsage = capacityData.limitedUsage;
        const buff = capacityData.buff;

        if (activable) {
            if (buff) {
                let itemData = duplicate(capacity.data);
                const newStatus = !itemData.data.properties.buff.activated;
                itemData.data.properties.buff.activated = newStatus;
                return capacity.update(itemData).then(capacity => this.syncItemActiveEffects(capacity, !newStatus));
            }
            // Capacité activable avec un nombre d'usage limités
            if ( limitedUsage ) {
                if (capacityData.properties.limitedUsage.use > 0) {
                    let itemData = duplicate(capacity.data);
                    itemData.data.properties.limitedUsage.use = (itemData.data.properties.limitedUsage.use > 0) ? itemData.data.properties.limitedUsage.use - 1 : 0;

                    AudioHelper.play({ src: "/systems/cof/sounds/gulp.mp3", volume: 0.8, autoplay: true, loop: false }, false);
                    return capacity.update(itemData).then(capacity => capacity.applyEffects(this));
                }
                return ui.notifications.warn(game.i18n.localize("COF.notification.ActivateEmptyCapacity"));
            }
            // Capacité à usage illimité
            return capacity.applyEffects(this);
        } 
    }

    /**
     * @name isWeakened
     * @returns true si l'active Effect Affaibli (radiation) et Immobilisé (restrain) est actif
     */
    isWeakened(){
        return (this.getFlag("cof","weakened"));
    }

   /**
    * @name getEffectsFromItemId
    * @description Retourne la liste des effets donnés par l'objet d'id itemId
    * @param {*} itemId
    * @returns 
    */
    getEffectsFromItemId(itemId) {
        const criteria = "Item." + itemId;
        return this.effects.filter(effect=>effect.data.origin.endsWith(criteria));
    }
}
