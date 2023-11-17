/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
import { CofHealingRoll } from "../controllers/healing-roll.js";
import { CofRoll } from "../controllers/roll.js";
import { CofSkillRoll } from "../controllers/skill-roll.js";
import { COF } from "../system/config.js";

export class CofItem extends Item {
  /* -------------------------------------------- */
  /*  Constructor                                 */
  /* -------------------------------------------- */
  /* Définition de l'image par défaut             */
  /* -------------------------------------------- */
  constructor(...args) {
    let data = args[0];
    if (!data.img && COF.itemIcons[data.type]) data.img = COF.itemIcons[data.type];

    super(...args);
  }

  /** @override */
  prepareData() {
    super.prepareData();
    let system = this.system;
    const actorData = this.actor ? this.actor : null;
    if (system.price) {
      const qty = system.qty ? system.qty : 1;
      system.value = qty * system.price;
    }
    if (this.system.properties?.protection) this._prepareArmorData(system);
    if (this.system.properties?.weapon) this._prepareWeaponData(system, actorData);
    // utilisé par les capacités : ne pas effacer
    if (!this.system.key) this.system.key = this.name.slugify({ strict: true });
  }

  _prepareArmorData(system) {
    system.def = parseInt(system.defBase, 10) + parseInt(system.defBonus, 10);
  }

  _prepareWeaponData(system, actorData) {
    system.skillBonus = system.skillBonus ? system.skillBonus : 0;
    system.dmgBonus = system.dmgBonus ? system.dmgBonus : 0;

    if (actorData && actorData.type !== "loot") {
      // Compute skill mod
      const skillMod = eval("actorData.system." + system.skill.split("@")[1]);
      system.mod = parseInt(skillMod) + parseInt(system.skillBonus);

      // Compute damage mod
      const dmgStat = eval("actorData.system." + system.dmgStat.split("@")[1]);
      const dmgBonus = dmgStat ? parseInt(dmgStat) + parseInt(system.dmgBonus) : parseInt(system.dmgBonus);
      if (dmgBonus < 0) system.dmg = system.dmgBase + " - " + parseInt(-dmgBonus);
      else if (dmgBonus === 0) system.dmg = system.dmgBase;
      else system.dmg = system.dmgBase + " + " + dmgBonus;
    }
  }

  getProperty(property) {
    if (this.type === "capacity") {
      return this.system[property];
    } else {
      return this.system.properties[property];
    }
  }

  getHealFormula() {
    if (this.type === "capacity") {
      return this.system.properties.heal.formula;
    } else {
      return this.system.effects.heal.formula;
    }
  }

  /**
   * @name applyEffects
   * @description Active les effets d'un objet
   *  Pour les types Soin, Attaque, useMacro et Buff
   * @param {*} actor
   * @param {*} options Options from the macro (bonus, malus, dmgBonus, dmgOnly, customLabel, skillDescr, dmgDescr, dialog) used for attack
   * @returns
   */
  async applyEffects(actor, options) {

    // Capacité de buff
    if (this.getProperty("buff")) {
      // Parcourt les effects de l'acteur pour trouver ceux fournis par la capacité
      let effectsData = actor.getEffectsFromItemId(this.id)?.map((effect) => foundry.utils.duplicate(effect.data));
      if (effectsData.length > 0) {
        effectsData.forEach((effect) => (effect.disabled = !this.system.properties.buff.activated));
        actor.updateEmbeddedDocuments("ActiveEffect", effectsData);
      }
    }

    // Capacité de soin
    if (this.getProperty("heal")) {
      // S'il n'a pas de formule
      if (this.system.properties.heal.formula === "") return;
      const r = new CofHealingRoll(this.name, this.getHealFormula(), false);
      r.roll(actor);
      return r;
    }

    // Capacité d'attaque
    if (this.getProperty("attack")) {
      return CofRoll.rollAttackCapacity(actor, this, options);
    }

    // Capacité utilisant une macro
    if (this.getProperty("useMacro")) {
      let macro;
      // Recherche de la macro avec l'ID
      if (this.system.properties.macro.id !== null && this.system.properties.macro.id != "") {
        macro = game.macros.get(this.system.properties.macro.id);
        if (macro !== undefined) {
          return macro.execute();
        }

        // Recherche dans le compendium
        if (this.system.properties.macro.pack != null && this.system.properties.macro.pack != "") {
          const pack = game.packs.get(this.system.properties.macro.pack);
          const item = pack.index.get(this.system.properties.macro.id);
          let itemId = item != undefined ? item._id : null;
          if (itemId) {
            macro = await pack.getDocument(itemId);
          }

          if (macro != undefined) {
            return macro.execute();
          }
        }
      }
      // Recherche de la macro avec le nom
      else {
        let macro;

        // Recherche dans le monde
        macro = game.macros.getName(this.system.properties.macro.name);
        if (macro != undefined) {
          return macro.execute();
        }

        // Recherche dans le compendium des macros
        const pack = game.packs.get("cof.macros");
        const item = pack.index.getName(this.system.properties.macro.name);
        let itemId = item != undefined ? item._id : null;
        if (itemId) {
          macro = await pack.getDocument(itemId);
        }

        if (macro != undefined) {
          return macro.execute();
        }
      }
    }
  }

  getMartialCategory() {
    if (!this.system.properties?.weapon) return;
    return;
  }

  getQuantity() {
    if (this.system.properties.stackable) return this.system.qty;
    else return 1;
  }

  modifyQuantity(increment, isDecrease) {
    if (this.system.properties.stackable) {
      let qty = this.system.qty;
      let value = this.system.value;
      increment = Math.abs(increment);

      if (isDecrease) {
        qty = Math.max(0, qty - increment);
        if (this.system.deleteWhen0 && qty === 0) return this.delete();
      } else qty = this.system.stacksize ? Math.min(this.system.stacksize, qty + increment) : qty + increment;

      if (this.system.price) {
        const qty = this.system.qty ? this.system.qty : 1;
        value = qty * this.system.price;
      }
      return this.update({ "system.qty": qty }, { "system.value": value });
    }
  }

  modifyUse(increment, isDecrease) {
    if (this.system.limitedUsage) {
      let newQty = this.system.properties.limitedUsage.use;
      if (isDecrease) newQty = Math.max(0, newQty - increment);
      else newQty = Math.min(this.system.properties.limitedUsage.maxUse, newQty + increment);
      if (newQty < 0) newQty = 0;
      return this.update({ "system.properties.limitedUsage.use": newQty });
    }
  }
}
