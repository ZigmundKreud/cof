import { CofRoll } from "../controllers/roll.js";
import { CofHealingRoll } from "../controllers/healing-roll.js";
import { CofSkillRoll } from "../controllers/skill-roll.js";
import { CofDamageRoll } from "../controllers/dmg-roll.js";

export class Macros {
  static createCofMacro = async function (dropData, slot) {
    // Create item macro if rollable item - weapon, spell, prayer, trait, or skill
    if (dropData.type == "Item") {
      const item = await fromUuid(dropData.uuid);

      if (item === undefined) return;
      if (item.type === "encounterWeapon") return;

      const actor = item.actor;

      const macroName = item.name + " (" + game.actors.get(actor.id).name + ")";
      const command = `let onlyDamage = false;\nlet customLabel = "";\nlet skillDescription = "";\nlet dmgDescription = "";\nlet withDialog = true;\n\nif (event) {\n  if (event.shiftKey) onlyDamage = true;\n}\n\ngame.cof.macros.rollItemMacro("${item._id}", "${item.name}", "${item.type}", 0, 0, 0, onlyDamage, customLabel, skillDescription, dmgDescription, withDialog);`;
      this.createMacro(slot, macroName, command, item.img);
    }
    // Create a macro to open the actor sheet of the actor dropped on the hotbar
    else if (dropData.type == "Actor") {
      const actor = await fromUuid(dropData.uuid);
      const command = `game.actors.get("${actor.id}").sheet.render(true)`;
      this.createMacro(slot, actor.name, command, actor.img);
    }
    // Create a macro to open the journal sheet of the journal dropped on the hotbar
    else if (dropData.type == "JournalEntry") {
      const journal = await fromUuid(dropData.uuid);
      const command = `game.journal.get("${journal.id}").sheet.render(true)`;
      this.createMacro(slot, journal.name, command, journal.img ? journal.img : "icons/svg/book.svg");
    }
    // Cas particulier des armes des rencontres contenu dans actor.weapons[]
    /* Exemple de dropData
    {
        "type": "Weapon",
        "data": {
            "name": "Arc",
            "mod": 2,
            "range": "30m",
            "dmg": "1d6"
        },
        "weaponId": 1

        url('../ui/icons/attack.webp');
    }*/
    else if (dropData.type == "Weapon") {
      const command = `let weaponId = ${dropData.weaponId};\nlet onlyDamage = false;\nlet customLabel = "";\nlet skillDescription = "";\nlet dmgDescription = "";\nlet withDialog = true;\nlet tokenActor = game.cof.macros.getSpeakersActor();\n\nif (event) {\n  if (event.shiftKey) onlyDamage = true;\n}\n\nif (!tokenActor) {\n  ui.notifications.warn(game.i18n.localize("COF.notification.MacroNoTokenSelected"));\n}\nelse if(!tokenActor?.rollWeapon) {\n  ui.notifications.warn(game.i18n.localize("COF.notification.MacroNotAnEncounter"));\n}\nelse {\n  tokenActor.rollWeapon(weaponId, customLabel, onlyDamage, 0, 0, 0, skillDescription, dmgDescription, withDialog);\n}`;
      this.createMacro(slot, dropData.data.name, command, dropData.img ? dropData.img : "/systems/cof/ui/icons/attack.webp");
    }
  };

  /**
   * @description Create a macro
   * @param {*} slot
   * @param {*} name
   * @param {*} command
   * @param {*} img
   */
  static createMacro = async function (slot, name, command, img) {
    let macro = game.macros.contents.find((m) => m.name === name && m.command === command);
    if (!macro) {
      macro = await Macro.create(
        {
          name: name,
          type: "script",
          img: img,
          command: command,
          flags: { "cof.macro": true },
        },
        { displaySheet: false }
      );
      game.user.assignHotbarMacro(macro, slot);
    }
  };

  /**
   * @name getSpeakersActor
   * @description
   *
   * @returns
   */
  static getSpeakersActor = function () {
    // Vérifie qu'un seul token est sélectionné
    const tokens = canvas.tokens.controlled;
    if (tokens.length > 1) {
      ui.notifications.warn(game.i18n.localize("COF.notification.MacroMultipleTokensSelected"));
      return null;
    }

    const speaker = ChatMessage.getSpeaker();
    let actor;
    // Si un token est sélectionné, le prendre comme acteur cible
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    // Sinon prendre l'acteur par défaut pour l'utilisateur courrant
    if (!actor) actor = game.actors.get(speaker.actor);
    return actor;
  };

  /**
   * @anme rollStatMacro
   * @description
   *
   * @param {*} actor
   * @param {*} stat
   * @param {String} bonus Saisir par exemple +1
   * @param {String} malus Saisir par exemple -2
   * @param {String} onEnter
   * @param {String} label Saisir "" pour ignorer
   * @param {String} description Saisir "" pour ignorer
   * @param {String} dialog
   * @param {String} dice Saisir la formule du type de dé entre "" (1d20, 1d12, 2d12kh, 2d20kh, 2d12kl, 2d20kl) Si c'est "" c'est le comportement par défaut avec le calcul automatique (par exemple avantage si caractéristique supérieure)
   * @param {Int} difficulty Si une difficulté est saisie, elle est prise en compte quel que soit l'option système choisie pour la difficulté
   * @param {String} rollMode "blindroll", "gmroll", "publicroll", "selfroll"
   * @returns
   */
  static rollStatMacro = async function (actor, stat, bonus = 0, malus = 0, onEnter = "submit", label, description, dialog = true, dice = "", rollMode = 'publicroll', difficulty) {
    // Plusieurs tokens sélectionnés
    if (actor === null) return;
    // Aucun acteur cible
    if (actor === undefined) return ui.notifications.error(game.i18n.localize("COF.notification.MacroNoActorAvailable"));

    let statObj;
    switch (stat) {
      case "for":
      case "str":
        statObj = eval(`actor.system.stats.str`);
        break;
      case "dex":
        statObj = eval(`actor.system.stats.dex`);
        break;
      case "con":
        statObj = eval(`actor.system.stats.con`);
        break;
      case "int":
        statObj = eval(`actor.system.stats.int`);
        break;
      case "sag":
      case "wis":
        statObj = eval(`actor.system.stats.wis`);
        break;
      case "cha":
        statObj = eval(`actor.system.stats.cha`);
        break;
      case "atc":
      case "melee":
        statObj = eval(`actor.system.attacks.melee`);
        break;
      case "atd":
      case "ranged":
        statObj = eval(`actor.system.attacks.ranged`);
        break;
      case "atm":
      case "magic":
        statObj = eval(`actor.system.attacks.magic`);
        break;
      default:
        ui.notifications.error(game.i18n.localize("COF.notification.MacroUnknownStat"));
        break;
    }
    let mod = statObj.mod;

    // Caractéristiques
    if (stat === "for" || stat === "str" || stat === "dex") {
      // Prise en compte de la notion de PJ incompétent
      if (game.settings.get("cof", "useIncompetentPJ")) {
        malus += actor.getIncompetentSkillMalus(stat);
      }

      // Prise en compte de la notion d'encombrement
      malus += actor.getOverloadedSkillMalus(stat);
    }

    // Prise en compte des bonus ou malus liés à la caractéristique
    let skillBonus = statObj.skillbonus;
    if (skillBonus) bonus += skillBonus;
    let skillMalus = statObj.skillmalus;
    if (skillMalus) malus += skillMalus;

    if (dialog) {
      CofRoll.skillRollDialog(
        actor,
        label && label.length > 0 ? label : game.i18n.localize(statObj.label),
        mod,
        bonus,
        malus,
        "20",
        statObj.superior,
        onEnter,
        description,      
        actor.isWeakened(),
        dice,
        rollMode,
        difficulty
      );
    } else {
      return new CofSkillRoll(label && label.length > 0 ? label : game.i18n.localize(statObj.label), dice, "+" + +mod, bonus, malus, difficulty, "20", description).roll();
    }
  };

  /**
   * @name rollItemMacro
   * @description
   *
   * @param {*} itemId
   * @param {*} itemName
   * @param {*} itemType
   * @param {*} bonus
   * @param {*} malus
   * @param {*} dmgBonus
   * @param {*} dmgOnly
   * @param {*} customLabel
   * @param {*} skillDescr
   * @param {*} dmgDescr
   * @param {*} dialog
   * @returns
   */
  static rollItemMacro = async function (itemId, itemName, itemType, bonus = 0, malus = 0, dmgBonus = 0, dmgOnly = false, customLabel, skillDescr, dmgDescr, dialog = true, rollMode = 'publicroll') {
    const actor = this.getSpeakersActor();
    // Several tokens selected
    if (actor === null) return;
    // Aucun acteur cible
    if (actor === undefined) return ui.notifications.error(game.i18n.localize("COF.notification.MacroNoActorAvailable"));

    const item = actor.items.get(itemId);
    if (!item) return ui.notifications.warn(game.i18n.format("COF.notification.MacroItemMissing", { item: itemName }));

    // Objet
    if (item.type === "item") {
      if (item.system.properties.weapon || item.system.properties.heal) {
        if (item.system.properties.weapon) {
          if (item.system.properties.equipable && !item.system.worn) {
            return ui.notifications.warn(game.i18n.format("COF.notification.MacroItemUnequiped", { item: itemName }));
          }
          const label = customLabel && customLabel.length > 0 ? customLabel : item.name;
          const critrange = item.system.critrange;

          // Compute MOD
          const itemModStat = item.system.skill.split("@")[1];
          const itemModBonus = parseInt(item.system.skillBonus);
          const weaponCategory = item.getMartialCategory();

          let mod = actor.computeWeaponMod(itemModStat, itemModBonus, weaponCategory);

          // Compute DM
          const itemDmgBase = item.system.dmgBase;
          const itemDmgStat = item.system.dmgStat.split("@")[1];
          const itemDmgBonus = parseInt(item.system.dmgBonus);
          const skillDmgBonus = eval("actor.system." + itemModStat.replace("mod", "dmBonus"));

          let dmg = actor.computeDm(itemDmgBase, itemDmgStat, itemDmgBonus, skillDmgBonus);

          if (dialog) {
            if (dmgOnly) CofRoll.rollDamageDialog(actor, label, dmg, 0, false, "submit", dmgDescr, rollMode);
            else CofRoll.rollWeaponDialog(actor, label, mod, bonus, malus, critrange, dmg, dmgBonus, "submit", skillDescr, dmgDescr, null, actor.isWeakened());
          } else {
            let formula = dmgBonus ? dmg + "+" + dmgBonus : dmg;
            if (dmgOnly) new CofDamageRoll(label, formula, false, dmgDescr).roll();
            else {
              let skillRoll = await new CofSkillRoll(label, "1d20", "+" + +mod, bonus, malus, null, critrange, skillDescr).roll();

              let result = skillRoll.dice[0].results[0].result;
              let critical = result >= critrange.split("-")[0] || result == 20;

              new CofDamageRoll(label, formula, critical, dmgDescr).roll();
            }
          }
        }
        if (item.system.properties.heal) {
          if (item.system.properties.consumable) {
            actor.consumeItem(item);
          } else {
            new CofHealingRoll(item.name, item.system.effects.heal.formula, false).roll(actor);
          }
        }
      }
    }
    // Capacité
    else if (item.type === "capacity") {
      const options = {
        bonus: bonus,
        malus: malus,
        dmgBonus: dmgBonus,
        dmgOnly: dmgOnly,
        customLabel: customLabel,
        skillDescr: skillDescr,
        dmgDescr: dmgDescr,
        dialog: dialog
      }
      if (item.system.activable && (item.system.heal || item.system.attack || item.system.useMacro || item.system.buff)) {
        return actor.activateCapacity(item, options);
      }
    } else return item.sheet.render(true);
  };

  static rollHealMacro = async function (label, healFormula, isCritical, title, showButtons = true, description, rollMode = 'publicroll') {
    const actor = this.getSpeakersActor();
    // Several tokens selected
    if (actor === null) return;
    // No token selected
    if (actor === undefined) return ui.notifications.error(game.i18n.localize("COF.notification.MacroNoTokenSelected"));

    return new CofHealingRoll(label, healFormula, isCritical, title, showButtons, description, rollMode).roll(actor);
  };

  static rollSkillMacro = async function (label, mod, bonus, malus, critRange, isSuperior = false, description, dialog = true, dice = "1d20", difficulty, rollMode = 'publicroll') {
    const actor = this.getSpeakersActor();

    // Several tokens selected
    if (actor === null) return;
    // Aucun acteur cible
    if (actor === undefined) return ui.notifications.error(game.i18n.localize("COF.notification.MacroNoActorAvailable"));

    let crit = parseInt(critRange);
    crit = !isNaN(crit) ? crit : 20;

    if (dialog) {
      CofRoll.skillRollDialog(actor = actor, label = label, mod = mod, bonus = bonus, malus = malus, critrange = crit, superior = isSuperior, onEnter = "submit", description = description, rollMode = rollMode);
    } else {
      new CofSkillRoll(label, dice, "+" + +mod, bonus, malus, difficulty, critRange, description, rollMode).roll(actor);
    }
  };

  static rollDamageMacro = async function (label, dmgFormula, dmgBonus, isCritical, dmgDescr, dialog = true, rollMode = 'publicroll') {
    const actor = this.getSpeakersActor();

    // Several tokens selected
    if (actor === null) return;
    // Aucun acteur cible
    if (actor === undefined) return ui.notifications.error(game.i18n.localize("COF.notification.MacroNoActorAvailable"));

    if (dialog) {
      CofRoll.rollDamageDialog(actor, label, dmgFormula, dmgBonus, isCritical, "submit", dmgDescr);
    } else {
      let formula = dmgBonus ? `${dmgFormula} + ${dmgBonus}` : dmgFormula;
      return new CofDamageRoll(label, formula, isCritical, dmgDescr, rollMode).roll();
    }
  };
}
