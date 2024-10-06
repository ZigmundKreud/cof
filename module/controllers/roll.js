import { CofSkillRoll } from "./skill-roll.js";
import { CofDamageRoll } from "./dmg-roll.js";
import { CofAttributesDialog } from "../dialogs/attributes-dialog.js";
import { CofHealingRoll } from "./healing-roll.js";
import { Utils } from "../utils/eval-utils.js";

export class CofRoll {
  static options() {
    return { classes: ["cof", "dialog"] };
  }

  /**
   * @name skillCheck
   * @description
   * @param {*} data
   * @param {*} actor
   * @param {*} event
   * @returns
   */
  static skillCheck(data, actor, event) {
    const elt = $(event.currentTarget)[0];
    let key = elt.attributes["data-rolling"].value;
    let label = eval(`data.${key}.label`);

    // Prise en compte de la notion de PJ incompétent et de l'encombrement
    let mod = eval(`data.${key}.mod`);
    let malus = actor.getIncompetentSkillMalus(key) + actor.getOverloadedSkillMalus(key);

    // Prise en compte des bonus ou malus liés à la caractéristique
    let bonus = eval(`data.${key}.skillbonus`);
    if (!bonus) bonus = 0;
    let skillMalus = eval(`data.${key}.skillmalus`);
    if (!skillMalus) skillMalus = 0;
    malus += skillMalus;

    let superior = eval(`data.${key}.superior`);
    const critrange = 20;
    label = label ? game.i18n.localize(label) : null;
    return this.skillRollDialog(actor, label, mod, bonus, malus, critrange, superior, "submit", null, actor.isWeakened());
  }

  /**
   *  Handles weapon check rolls
   * @param elt DOM element which raised the roll event
   * @param key the key of the attribute to roll
   * @private
   */
  /**
   * @name rollWeapon
   * @description Handles weapon check rolls
   * @param {*} data
   * @param {*} actor
   * @param {*} event
   * @returns
   */
  static rollWeapon(data, actor, event) {
    const li = $(event.currentTarget).parents(".item");
    let item = actor.items.get(li.data("itemId"));

    const label = item.name;
    const critrange = item.system.critrange;
    const itemMod = $(event.currentTarget).parents().children(".item-mod");
    const mod = itemMod.data("itemMod");
    const dmgMod = $(event.currentTarget).parents().children(".item-dmg");
    const dmg = dmgMod.data("itemDmg");

    return this.rollWeaponDialog(actor, label, mod, 0, 0, critrange, dmg, 0, "submit", null, null, null, actor.isWeakened());
  }

  /**
   *
   * @param {*} actor
   * @param {*} capacity
   * @param {Object} options : bonus, malus, dmgBonus, dmgOnly, customLabel, skillDescr, dmgDescr, dialog
   * @returns
   */
  static rollAttackCapacity(actor, capacity, options) {
    const pattern = /d(4|6|8|10|12|20|100)/i; // Vérifie d4, D4, etc...

    const attack = capacity.system.properties.attack;

    const label = capacity.name;

    const critrange = "20";
    let mod = 0;
    if (attack.skill !== "auto") {
      mod = eval("actor.system." + attack.skill.split("@")[1]);
      // Gestion du bonus. Par exemple : 2 ou @stats.str.mod ou @str
      const skillBonusToEvaluate = pattern.test(attack.skillBonus) ? false : true;
      let skillBonusEvaluated = skillBonusToEvaluate ? Utils.evaluate(actor, attack.skillBonus, capacity.id, true) : "0";
      mod += eval(skillBonusEvaluated);
    }

    const difficulty = attack.difficulty !== null && attack.difficulty !== "" ? attack.difficulty : null;

    // Compute damage
    const dmgBase = attack.dmgBase;

    const dmgBaseToEvaluate = pattern.test(dmgBase) ? false : true;
    let dmgBaseEvaluated = dmgBaseToEvaluate ? Utils.evaluate(actor, dmgBase, capacity.id, true) : Utils.evaluateWithDice(actor, dmgBase, capacity.id);

    const stat = attack.dmgStat.split("@")[1];
    const dmgStat = eval("actor.system." + stat);

    if (dmgStat < 0) dmgBaseEvaluated = dmgBaseEvaluated + " - " + parseInt(-dmgStat);
    else if (dmgStat > 0) dmgBaseEvaluated = dmgBaseEvaluated + " + " + dmgStat;

    let dmgDescr = "";
    if (capacity.system.save) {
      const st = "COF.stats." + capacity.system.properties.save.stat + ".label";
      let stat = game.i18n.localize(st);
      let diff = this._evaluateSaveDifficulty(capacity.system.properties.save.difficulty, actor);
      let description = capacity.system.properties.save.text.replace("@stat", stat).replace("@diff", diff);
      dmgDescr += description;
    }

    let dmgBonus = options?.dmgBonus ?? 0;
    
    // Prise en compte du bonus aux dégâts donnés par les Active Effects
    let typeAttack = capacity.system.properties.attack.skill.split(".")[1];
    switch (typeAttack) {
      case "magic":
        dmgBonus += actor.system.attacks.magic.dmBonus;
        break;
      case "melee":
        dmgBonus += actor.system.attacks.melee.dmBonus;
        break;
      case "ranged":
        dmgBonus += actor.system.attacks.ranged.dmBonus;
        break;
    }

    if (attack.skill !== "auto") {
      return this.rollWeaponDialog(
        actor,
        label,
        mod,
        options?.bonus ?? 0,
        options?.malus ?? 0,
        critrange,
        dmgBaseEvaluated,
        dmgBonus,
        "submit",
        options?.skillDescr ?? "",
        options?.dmgDescr ?? 0,
        difficulty,
        actor.isWeakened()
      );
    } else return this.rollDamageDialog(actor, label, dmgBaseEvaluated, dmgBonus, false, "submit", options?.dmgDescr ?? 0);
  }

  static _evaluateSaveDifficulty(formula, actor) {
    const terms = formula.split("+");
    let difficulty = 0;
    terms.forEach((element) => {
      if (element.includes("@")) {
        difficulty += parseInt(eval("actor.system." + element.substring(1)));
      } else difficulty += parseInt(element);
    });
    return difficulty;
  }

  /**
   * @name rollEncounterWeapon
   * @description Handles encounter attack checks
   * @param {*} data
   * @param {*} actor
   * @param {*} event
   * @returns
   */
  static rollEncounterWeapon(data, actor, event) {
    const item = $(event.currentTarget).parents(".weapon");
    let label = item.find(".weapon-name").text();
    let mod = item.find(".weapon-mod").val();
    let critrange = item.find(".weapon-critrange").val();
    let dmg = item.find(".weapon-dmg").val();
    return this.rollWeaponDialog(actor, label, mod, 0, 0, critrange, dmg, 0);
  }

  /**
   *  Handles encounter damage rolls
   * @param elt DOM element which raised the roll event
   * @param key the key of the attribute to roll
   * @private
   */
  static rollEncounterDamage(data, actor, event) {
    const item = $(event.currentTarget).parents(".weapon");
    let label = item.find(".weapon-name").text();
    let dmg = item.find(".weapon-dmg").val();
    return this.rollDamageDialog(actor, label, dmg, 0);
  }

  /**
   *  Handles damage rolls
   * @param elt DOM element which raised the roll event
   * @param key the key of the attribute to roll
   * @private
   */
  static rollDamage(data, actor, event) {
    const li = $(event.currentTarget).parents(".item");
    const item = actor.items.get(li.data("itemId"));

    const label = item.name;

    const dmgMod = $(event.currentTarget).parents().children(".item-dmg");
    const dmg = dmgMod.data("itemDmg");

    return this.rollDamageDialog(actor, label, dmg, 0);
  }

  /**
   *  Handles Hit Points Rolls
   * @param elt DOM element which raised the roll event
   * @param key the key of the attribute to roll
   * @private
   */
  static rollHitPoints(data, actor, event) {
    let hp = data.attributes.hp;
    const lvl = data.level.value;
    const conMod = data.stats.con.mod;

    Dialog.confirm({
      title: game.i18n.format("COF.dialog.rollHitPoints.title"),
      content: `<p>Êtes-vous sûr de vouloir remplacer les points de vie de <strong>${actor.name}</strong> ?</p>`,
      yes: async () => {
        if (actor.system.attributes.hd && actor.system.attributes.hd.value) {
          const hd = actor.system.attributes.hd.value;
          const hdmax = parseInt(hd.split("d")[1]);
          // If LVL 1 COMPUTE HIT POINTS
          if (lvl == 1) {
            hp.base = hdmax + conMod;
            hp.max = hp.base + hp.bonus;
            hp.value = hp.max;
          } else {
            const hpLvl1 = hdmax + conMod;
            const dice2Roll = lvl - 1;
            const formula = `${dice2Roll}d${hdmax} + ${dice2Roll * conMod}`;
            let r = new Roll(formula);
            await r.roll();
            r.toMessage({
              user: game.user.id,
              flavor: "<h2>" + game.i18n.localize("COF.dialog.rollHitPoints.title") + "</h2>",
              speaker: ChatMessage.getSpeaker({ actor: actor }),
            });
            hp.base = hpLvl1 + r.total;
            hp.max = hp.base + hp.bonus;
            hp.value = hp.max;
          }
          actor.update({ "system.attributes.hp": hp });
        } else ui.notifications.error(game.i18n.localize("COF.dialog.rollHitPoints.error"));
      },
      defaultYes: false,
    });
  }

  /**
   *  Handles attributes rolls
   * @param elt DOM element which raised the roll event
   * @param key the key of the attribute to roll
   * @private
   */
  static async rollAttributes(data, actor, event) {
    return this.attributesRollDialog(actor);
  }

  /**
   *  Handles recovery roll
   *
   * @param {*} data
   * @param {*} actor
   * @param {*} event
   * @param {*} withHPrecovery true to Get HitPoints
   * @returns
   */
  static rollRecoveryUse(data, actor, event, withHPrecovery) {
    let recoveryPoints = data.attributes.rp.value;
    if (!recoveryPoints > 0) return;

    let hp = data.attributes.hp;
    let rp = data.attributes.rp;
    const level = data.level.value;
    const conMod = data.stats.con.mod;

    if (!withHPrecovery) {
      rp.value -= 1;
      actor.update({ "system.attributes.rp": rp });
    } else {
      Dialog.confirm({
        title: game.i18n.format("COF.dialog.spendRecoveryPoint.title"),
        content: game.i18n.localize("COF.dialog.spendRecoveryPoint.content"),
        yes: async () => {
          const hd = actor.system.attributes.hd.value;
          const hdmax = parseInt(hd.split("d")[1]);
          const bonus = level + conMod;
          const formula = `1d${hdmax} + ${bonus}`;

          let healingRoll = new CofHealingRoll("", formula, false, game.i18n.localize("COF.dialog.spendRecoveryPoint.rollTitle"), false);
          let result = await healingRoll.roll(actor);

          hp.value += result.total;
          rp.value -= 1;
          actor.update({ "system.attributes.hp": hp, "system.attributes.rp": rp });
        },
        defaultYes: false,
      });
    }
  }

  /* -------------------------------------------- */
  /* ROLL DIALOGS                                 */

  /* -------------------------------------------- */

  /**
   * @name attributesRollDialog
   * @description Fenêtre de dialogue de tirage de caractéristiques
   * @param {*} actor
   * @returns
   */
  static async attributesRollDialog(actor) {
    return new CofAttributesDialog(actor, {}).render(true);
  }

  /**
   * @name skillRollDialog
   * @description Fenêtre de dialogue pour le jet de caractéristique ou le jet d'attaque simple
   * @param {*} actor
   * @param {*} label
   * @param {*} mod
   * @param {*} bonus
   * @param {*} malus
   * @param {*} critrange
   * @param {*} superior      Avantage
   * @param {*} onEnter
   * @param {*} description
   * @returns
   */
  static async skillRollDialog(actor, label, mod, bonus, malus, critrange, superior = false, onEnter = "submit", description, weakened = false, dice, rollMode, difficulty) {
    const rollOptionTpl = "systems/cof/templates/dialogs/skillroll-dialog.hbs";
    let diff = null;
    const displayDifficulty = game.settings.get("cof", "displayDifficulty");
    if (!foundry.utils.isEmpty(difficulty)) diff = difficulty;
    else {
      if (displayDifficulty !== "none" && game.user.targets.size > 0) {
        diff = [...game.user.targets][0].actor.system.attributes.def.value;
      }
    }    
    const isDifficultyDisplayed = displayDifficulty === "all" || (displayDifficulty === "gm" && game.user.isGM);

    // rollMode : Par défaut pour un MJ, c'est l'option configurée, sauf si elle est différente lors de l'appel    
    let dialogRollMode
    if (game.user.isGM) {
      dialogRollMode = game.settings.get("cof", "defaultVisibilityGMRoll");      
    }
    if (rollMode) dialogRollMode = rollMode;

    const rollOptionContent = await renderTemplate(rollOptionTpl, {
      mod,
      bonus,
      malus,
      critrange,
      difficulty: diff,
      displayDifficulty: isDifficultyDisplayed,
      superior,
      hasDescription: description && description.length > 0,
      skillDescr: description,
      weakened,
      dice,
      rollMode: dialogRollMode,
      rollModes: CONFIG.Dice.rollModes
    });
    let d = new Dialog(
      {
        title: label,
        content: rollOptionContent,
        buttons: {
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("COF.ui.cancel"),
            callback: () => {},
          },
          submit: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("COF.ui.submit"),
            callback: (html) => {
              const dice = html.find("#dice").val();
              const difficulty = html.find("#difficulty").val();
              const critrange = html.find("input#critrange").val();
              const mod = html.find("input#mod").val();
              const bonus = html.find("input#bonus").val();
              const malus = html.find("input#malus").val();
              const rollMode = html.find("#rollMode").val();
              let r = new CofSkillRoll(label, dice, mod, bonus, malus, difficulty, critrange, description, rollMode);
              r.roll(actor);
            },
          },
        },
        default: onEnter,
        close: () => {},
      },
      this.options()
    );
    return d.render(true);
  }

  /**
   *
   * @param {*} actor
   * @param {*} label
   * @param {*} mod
   * @param {*} bonus
   * @param {*} critrange
   * @param {*} dmgFormula
   * @param {*} dmgBonus
   * @param {*} onEnter
   * @returns
   */
  static async rollWeaponDialog(actor, label, mod, bonus, malus, critrange, dmgFormula, dmgBonus, onEnter = "submit", skillDescr, dmgDescr, difficulty = null, weakened = false, rollMode) {
    const rollOptionTpl = "systems/cof/templates/dialogs/roll-weapon-dialog.hbs";
    let diff = null;
    let isDifficultyDisplayed = true;

    if (difficulty !== null) {
      diff = difficulty;
    } else {
      const displayDifficulty = game.settings.get("cof", "displayDifficulty");
      if (displayDifficulty !== "none" && game.user.targets.size > 0) {
        diff = [...game.user.targets][0].actor.system.attributes.def.value;
      }
      isDifficultyDisplayed = displayDifficulty === "all" || (displayDifficulty === "gm" && game.user.isGM);
    }

    // rollMode : Par défaut pour un MJ, c'est l'option configurée, sauf si elle est différente lors de l'appel    
    let dialogRollMode
    if (game.user.isGM) {
      dialogRollMode = game.settings.get("cof", "defaultVisibilityGMRoll");      
    }
    if (rollMode) dialogRollMode = rollMode;

    const rollOptionContent = await renderTemplate(rollOptionTpl, {
      mod: mod,
      bonus: bonus,
      malus: malus,
      critrange: critrange,
      difficulty: diff,
      displayDifficulty: isDifficultyDisplayed,
      dmgFormula: dmgFormula,
      dmgBonus: dmgBonus,
      dmgCustomFormula: "",
      hasSkillDescr: skillDescr && skillDescr.length > 0,
      skillDescr: skillDescr,
      hasDmgDescr: dmgDescr && dmgDescr.length > 0,
      dmgDescr: dmgDescr,
      weakened: weakened,
      rollMode: dialogRollMode,
      rollModes: CONFIG.Dice.rollModes
    });

    let d = new Dialog(
      {
        title: label && label.length > 0 ? label : game.i18n.format("COF.dialog.rollWeapon.title"),
        content: rollOptionContent,
        buttons: {
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("COF.ui.cancel"),
            callback: () => {},
          },
          submit: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("COF.ui.submit"),
            callback: (html) => {
              const dice = html.find("#dice").val();
              const diff = html.find("#difficulty").val();
              const critrange = html.find("input#critrange").val();
              const mod = html.find("input#mod").val();
              const bonus = html.find("input#bonus").val();
              let malus = html.find("input#malus").val();
              if (!malus) malus = 0;
              const rollMode = html.find("#rollMode").val();

              // Jet d'attaque uniquement
              if (!game.settings.get("cof", "useComboRolls")) {
                let r = new CofSkillRoll(label, dice, mod, bonus, malus, diff, critrange, skillDescr, rollMode);
                r.weaponRoll(actor, "", dmgDescr);
              } else {
                // Jet combiné attaque et dommages
                let dmgBonus = html.find("#dmgBonus") ? html.find("#dmgBonus").val() : 0;
                let dmgCustomFormula = html.find("#dmgCustomFormula") ? html.find("#dmgCustomFormula").val() : "";
                let dmgBaseFormula = html.find("#dmgFormula") ? html.find("#dmgFormula").val() : "";
                let dmgFormula = dmgCustomFormula ? dmgCustomFormula : dmgBaseFormula;

                if (dmgBonus.indexOf("d") !== -1 || dmgBonus.indexOf("D") !== -1) {
                  if (dmgBonus.indexOf("+") === -1 && dmgBonus.indexOf("-") === -1) {
                    dmgFormula = dmgFormula.concat("+", dmgBonus);
                  } else dmgFormula = dmgFormula.concat(dmgBonus);
                } else {
                  const dmgBonusInt = parseInt(dmgBonus);
                  if (dmgBonusInt > 0) {
                    dmgFormula = dmgFormula.concat("+", dmgBonusInt);
                  } else if (dmgBonusInt < 0) {
                    dmgFormula = dmgFormula.concat(" ", dmgBonus);
                  }
                }
                let r = new CofSkillRoll(label, dice, mod, bonus, malus, diff, critrange, skillDescr, rollMode);
                r.weaponRoll(actor, dmgFormula, dmgDescr, rollMode);
              }
            },
          },
        },
        default: onEnter,
        close: () => {},
      },
      this.options()
    );
    return d.render(true);
  }

  static async rollDamageDialog(actor, label, formula, dmgBonus, critical = false, onEnter = "submit", dmgDescr, rollMode) {
    const rollOptionTpl = "systems/cof/templates/dialogs/roll-dmg-dialog.hbs";

    // rollMode : Par défaut pour un MJ, c'est l'option configurée, sauf si elle est différente lors de l'appel    
    let dialogRollMode
    if (game.user.isGM) {
      dialogRollMode = game.settings.get("cof", "defaultVisibilityGMRoll");      
    }
    if (rollMode) dialogRollMode = rollMode;

    const rollOptionContent = await renderTemplate(rollOptionTpl, {
      dmgFormula: formula,
      dmgBonus: dmgBonus,
      dmgCustomFormula: "",
      isCritical: critical,
      hasDescription: dmgDescr && dmgDescr.length > 0,
      dmgDescr: dmgDescr,
      rollMode: dialogRollMode,
      rollModes: CONFIG.Dice.rollModes
    });

    let d = new Dialog(
      {
        title: label && label.length > 0 ? label : game.i18n.format("COF.dialog.rollDamage.title"),
        content: rollOptionContent,
        buttons: {
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("COF.ui.cancel"),
            callback: () => {},
          },
          submit: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("COF.ui.submit"),
            callback: (html) => {
              let dmgBonus = html.find("#dmgBonus").val();
              let dmgCustomFormula = html.find("#dmgCustomFormula").val();
              let dmgBaseFormula = html.find("#dmgFormula").val();
              const isCritical = html.find("#isCritical").is(":checked");
              let dmgFormula = dmgCustomFormula ? dmgCustomFormula : dmgBaseFormula;

              if (dmgBonus.indexOf("d") !== -1 || dmgBonus.indexOf("D") !== -1) {
                if (dmgBonus.indexOf("+") === -1 && dmgBonus.indexOf("-") === -1) {
                  dmgFormula = dmgFormula.concat("+", dmgBonus);
                } else dmgFormula = dmgFormula.concat(dmgBonus);
              } else {
                const dmgBonusInt = parseInt(dmgBonus);
                if (dmgBonusInt > 0) {
                  dmgFormula = dmgFormula.concat("+", dmgBonusInt);
                } else if (dmgBonusInt < 0) {
                  dmgFormula = dmgFormula.concat(" ", dmgBonus);
                }
              }

              const rollMode = html.find("#rollMode").val();
              let r = new CofDamageRoll(label, dmgFormula, isCritical, dmgDescr, rollMode);
              r.roll(actor);
            },
          },
        },
        default: onEnter,
        close: () => {},
      },
      this.options()
    );
    return d.render(true);
  }
}
