/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
import { Capacity } from "../controllers/capacity.js";
import { Path } from "../controllers/path.js";
import { Profile } from "../controllers/profile.js";
import { Species } from "../controllers/species.js";
import { CofRoll } from "../controllers/roll.js";
import { ArrayUtils } from "../utils/array-utils.js";
import { System } from "../system/config.js";
import { CofBaseSheet } from "./base-sheet.js";
import { COF } from "../system/config.js";
import { LevelUpSheet } from "./levelUp-sheet.js";
import { CofHealingRoll } from "../controllers/healing-roll.js";
import { COFActiveEffectConfig } from "../system/active-effect-config.js";

export class CofActorSheet extends CofBaseSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cof", "sheet", "actor"],
      template: System.templatesPath + "/actors/actor-sheet.hbs",
      width: 1200,
      height: 750,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
    });
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Click right to open the compendium
    html.find(".cof-compendium-pack").contextmenu((ev) => {
      ev.preventDefault();
      const li = $(ev.currentTarget);
      const pack = game.packs.get(this.getPackPrefix() + "." + li.data("pack"));
      if (pack) {
        if (li.attr("data-open") === "1") {
          li.attr("data-open", "0");
          pack.apps[0].close();
        } else {
          li.attr("data-open", "1");
          pack.render(true);
        }
      }
    });
    // Click to open
    html.find(".item-create.cof-compendium-pack").click((ev) => {
      ev.preventDefault();
      let li = $(ev.currentTarget),
        pack = game.packs.get(this.getPackPrefix() + "." + li.data("pack"));
      if (li.attr("data-open") === "1") {
        li.attr("data-open", "0");
        pack.apps[0].close();
      } else {
        li.attr("data-open", "1");
        pack.render(true);
      }
    });

    // Initiate a roll with a left click
    html.find(".rollable").click((ev) => {
      ev.preventDefault();
      return this._onRoll(ev);
    });
    // Items controls
    html.find(".inventory-consume").click(this._onConsume.bind(this));
    html.find(".inventory-equip").click(this._onToggleEquip.bind(this));
    html.find(".inventory-qty").click(this._onIncrease.bind(this));
    html.find(".inventory-qty").contextmenu(this._onDecrease.bind(this));
    html.find(".item-edit").click(this._onEditItem.bind(this));
    html.find(".item .item-name h4").click(this._onItemSummary.bind(this));
    html.find(".item-delete").click(this._onDeleteItem.bind(this));
    html.find(".item-to-chat").click(this._onSendToChatItem.bind(this));
    html.find(".foldable h3.item-name").click((ev) => {
      ev.preventDefault();
      const li = $(ev.currentTarget);
      const ol = li.parents(".inventory-list");
      const tab = ol.data("tab");
      const category = ol.data("category");
      const itemList = ol.find(".item-list");
      const actor = this.actor;
      itemList.slideToggle("fast", function () {
        ol.toggleClass("folded");
        if (actor.system.settings) {
          if (ol.hasClass("folded")) {
            if (!actor.system.settings[tab].folded.includes(category)) {
              actor.system.settings[tab].folded.push(category);
            }
          } else {
            ArrayUtils.remove(actor.system.settings[tab].folded, category);
          }
        }
        actor.update({ "system.settings": actor.system.settings });
      });
    });
    // Check/Uncheck capacities
    html.find(".capacity-checked").click((ev) => {
      ev.preventDefault();
      return this._onCheckedCapacity(this.actor, ev, true);
    });
    html.find(".capacity-unchecked").click((ev) => {
      ev.preventDefault();
      return this._onCheckedCapacity(this.actor, ev, false);
    });
    html.find(".capacity-toggle").click((ev) => {
      ev.preventDefault();
      const li = $(ev.currentTarget).closest(".capacity");
      li.find(".capacity-description").slideToggle(200);
    });
    html.find(".capacity-activate").click(this._onActivateCapacity.bind(this));
    html.find(".capacity-qty").click(this._onIncreaseCapacityUse.bind(this));
    html.find(".capacity-qty").contextmenu(this._onDecreaseCapacityUse.bind(this));

    // Effects controls
    html.find(".effect-toggle").click((ev) => {
      ev.preventDefault();
      const elt = $(ev.currentTarget).parents(".effect");
      const effectId = elt.data("itemId");
      let updateData = foundry.utils.duplicate(this.actor);
      let effects = updateData.effects;
      const effect = effects.find((e) => e._id === effectId);
      if (effect) {
        effect.disabled = !effect.disabled;
        return this.actor.update(updateData);
      }
    });
    html.find(".effect-create").click((ev) => {
      ev.preventDefault();
      return this.actor.createEmbeddedDocuments("ActiveEffect", [
        {
          label: game.i18n.localize("COF.ui.newEffect"),
          img: "icons/svg/aura.svg",
          origin: this.actor.uuid,
          "duration.rounds": undefined,
          disabled: true,
        },
      ]);
    });
    html.find(".effect-edit").click(this._onEditItem.bind(this));
    html.find(".effect-delete").click((ev) => {
      ev.preventDefault();
      const elt = $(ev.currentTarget).parents(".effect");
      const effectId = elt.data("itemId");
      let effect = this.actor.effects.get(effectId);
      if (effect) effect.delete();
    });

    // WEAPONS (Encounters)
    html.find(".weapon-add").click((ev) => {
      ev.preventDefault();
      let weapons = Object.values(this.actor.system.weapons);
      weapons.push({ name: "", mod: 0, dmg: 0 });
      this.actor.update({ "system.weapons": weapons });
    });

    html.find(".weapon-remove").click((ev) => {
      ev.preventDefault();
      const elt = $(ev.currentTarget).parents(".weapon");
      const idx = elt.data("itemId");
      //const data = this.getData();
      //data.weapons = Object.values(data.weapons);
      let weapons = Object.values(this.actor.system.weapons);
      //weapons = weapons instanceof Array ? weapons : [weapons];
      if (weapons.length == 1) weapons = [];
      else weapons.splice(idx, 1);
      this.actor.update({ "system.weapons": weapons });
    });

    html.find(".levelUp").click((ev) => {
      ev.preventDefault;

      let dv = this.actor.getDV();
      let modCon = this.actor.getStatMod("con");
      let healingRoll = new CofHealingRoll(game.i18n.localize("COF.roll.healing.label"), `${dv}+${modCon}`, false, game.i18n.localize("COF.roll.healing.title"), false);

      healingRoll.roll(this.actor).then((roll) => {
        let levelUp = new LevelUpSheet(this.actor, { resizable: true, hpRoll: roll });
        levelUp.render(true);
      });
    });
  }

  /* -------------------------------------------- */
  /* ITEMS MANAGEMENT                             */

  /* -------------------------------------------- */
  /**
   * @name _onCheckedCapacity
   * @description Evènement sur la case à cocher d'une capacité dans la partie voie
   * @param {CofActor} actor l'acteur
   * @param {Event} event l'évènement
   * @param {boolean} isUncheck la capacité est décochée
   * @returns l'acteur modifié
   * @private
   */
  _onCheckedCapacity(actor, event, isUncheck) {
    const elt = $(event.currentTarget).parents(".capacity");
    // get id of clicked capacity
    const capId = elt.data("itemId");
    // get id of parent path
    const pathId = elt.data("pathId");
    return Capacity.toggleCheck(actor, capId, pathId, isUncheck);
  }

  /**
   * @name _onIncrease
   * @description Augmente la quantité d'un objet de 1
   * @param {*} event
   * @returns l'objet modifié
   * @private
   */
  _onIncrease(event) {
    event.preventDefault();
    const li = $(event.currentTarget).closest(".item");
    const item = this.actor.items.get(li.data("itemId"));
    return item.modifyQuantity(1, false);
  }

  /**
   * @name _onDecrease
   * @description Diminue la quantité d'un objet de 1
   * @param {*} event
   * @returns l'objet modifié
   * @private
   */
  _onDecrease(event) {
    event.preventDefault();
    const li = $(event.currentTarget).closest(".item");
    const item = this.actor.items.get(li.data("itemId"));
    return item.modifyQuantity(1, true);
  }

  /**
   * @name _onToggleEquip
   * @description Equipe / Déséquipe un objet
   * @param {*} event
   * @returns l'acteur mis à jour
   * @private
   */
  _onToggleEquip(event) {
    event.preventDefault();
    const li = $(event.currentTarget).closest(".item");
    const item = this.actor.items.get(li.data("itemId"));

    const bypassChecks = event.shiftKey;

    return this.actor.toggleEquipItem(item, bypassChecks);
  }

  /**
   * @name _onConsume
   * @description Consomme un objet
   * @param event
   * @private
   */
  _onConsume(event) {
    event.preventDefault();
    const li = $(event.currentTarget).closest(".item");
    const item = this.actor.items.get(li.data("itemId"));

    this.actor.consumeItem(item);
  }

  /**
   * Callback on delete item actions
   * @param event
   * @private
   */
  _onDeleteItem(event) {
    event.preventDefault();
    const li = $(event.currentTarget).parents(".item");
    let itemId = li.data("itemId");
    const entity = this.actor.items.find((item) => item.id === itemId);
    itemId = itemId instanceof Array ? itemId : [itemId];
    switch (entity.type) {
      case "capacity":
        return Capacity.removeFromActor(this.actor, entity);
      case "path":
        return Path.removeFromActor(this.actor, entity);
      case "profile":
        return Profile.removeFromActor(this.actor, entity);
      case "species":
        return Species.removeFromActor(this.actor, entity);
      default:
        return this.actor.deleteEmbeddedDocuments("Item", itemId);
    }
  }

  /**
   * Callback on render item actions
   * @param event
   * @private
   */
  _onEditItem(event) {
    event.preventDefault();
    const li = $(event.currentTarget).parents(".item");
    const id = li.data("itemId");
    const type = li.data("itemType") ? li.data("itemType") : "item";
    const uuid = li.data("uuid");

    if (type === "effect") {
      let effects = this.actor.effects;
      const effect = effects.get(id);
      if (effect) {
        return new COFActiveEffectConfig(effect, {}).render(true);
      } else return false;
    } else if (type === "capacity") {
      // Recherche d'un capacité existante avec la même clé
      const key = li.data("key");
      let entity = this.actor.items.find((i) => i.type === "capacity" && i.system.key === key);
      return entity ? entity.sheet.render(true) : fromUuid(uuid).then((e) => e.sheet.render(true));
    } else {
      // look first in actor embedded items
      let entity = this.actor.items.get(id);
      return entity ? entity.sheet.render(true) : fromUuid(uuid).then((e) => e.sheet.render(true));
    }
  }

  /**
   * Callback on the senf to chat action
   * @private
   */
  async _onSendToChatItem(event) {
    event.preventDefault();
    const id = $(event.currentTarget).parents(".item").data("itemId");
    console.log("Send to chat", id);

    let item = this.actor.items.get(id);

    // decription may begin by "<h1>Description</h1>", we suppress it
    let description = item.system.description;
    if (description.startsWith("<h1>Description</h1>")) {
      description = description.substr(20);
    }

    const templateData = {
      itemName: item.name,
      itemUuid: item.uuid,
      description: description,
      limited: item.system.limited,
      spell: item.system.spell,
      ranged: item.system.properties.ranged,
      limitedUsage: item.system.limitedUsage,
      save: item.system.save,
      activable: item.system.properties.activable,
    };

    const html = await renderTemplate("systems/cof/templates/chat/item-card.hbs", templateData);
    let chatData = {
      speaker: ChatMessage.getSpeaker(),
      content: html,
    };
    ChatMessage.create(chatData, {});
  }

  /**
   * Callback on render item actions : display or not the summary
   * @param event
   * @private
   */
  _onItemSummary(event) {
    event.preventDefault();
    let li = $(event.currentTarget).parents(".item").children(".item-summary");
    let entity = this.actor.items.get($(event.currentTarget).parents(".item").data("itemId"));
    if (entity && entity.type === "capacity") {
      if (li.hasClass("expanded")) {
        li.css("display", "none");
      } else {
        li.css("display", "block");
      }
      li.toggleClass("expanded");
    } else {
      this._onEditItem(event);
    }
  }

  /**
   * @name _onActivate
   * @description Active un objet
   * @param event
   * @private
   */
  _onActivateCapacity(event) {
    event.preventDefault();
    const li = $(event.currentTarget).closest(".item");
    const capacity = this.actor.items.get(li.data("itemId"));

    this.actor.activateCapacity(capacity, null);
  }

  _onIncreaseCapacityUse(event) {
    event.preventDefault();
    const li = $(event.currentTarget).closest(".item");
    const item = this.actor.items.get(li.data("itemId"));
    return item.modifyUse(1, false);
  }

  _onDecreaseCapacityUse(event) {
    event.preventDefault();
    const li = $(event.currentTarget).closest(".item");
    const item = this.actor.items.get(li.data("itemId"));
    return item.modifyUse(1, true);
  }

  /* -------------------------------------------- */
  /* ROLL EVENTS CALLBACKS                        */

  /* -------------------------------------------- */

  /**
   * Initiates a roll from any kind depending on the "data-roll-type" attribute
   * @param event the roll event
   * @private
   */
  async _onRoll(event) {
    const elt = $(event.currentTarget)[0];
    const rolltype = elt.attributes["data-roll-type"].value;
    const data = await this.getData();
    // SHIFT + click
    if (event.shiftKey) {
      switch (rolltype) {
        // Spend recovery point without getting hit points
        case "recovery":
          return CofRoll.rollRecoveryUse(data.system, this.actor, event, false);
      }
    }
    switch (rolltype) {
      case "skillcheck":
        return CofRoll.skillCheck(data.data, this.actor, event);
      case "weapon":
        return CofRoll.rollWeapon(data.data, this.actor, event);
      case "encounter-weapon":
        return CofRoll.rollEncounterWeapon(data.data, this.actor, event);
      case "encounter-damage":
        return CofRoll.rollEncounterDamage(data.data, this.actor, event);
      case "damage":
        return CofRoll.rollDamage(data.data, this.actor, event);
      case "hp":
        return CofRoll.rollHitPoints(data.system, this.actor, event);
      case "attributes":
        return CofRoll.rollAttributes(data.data, this.actor, event);
      case "recovery":
        return CofRoll.rollRecoveryUse(data.system, this.actor, event, true);
    }
  }

  /* -------------------------------------------- */
  /* DRAG EVENTS CALLBACKS                        */
  /* -------------------------------------------- */
  /** @override */
  _onDragStart(event) {
    super._onDragStart(event);

    // Si le drag concerne une arme de rencontre
    const li = event.currentTarget;
    if (li.dataset.weaponId) {
      let dragData = {};
      let weapon = this.actor.system.weapons[+li.dataset.weaponId];
      dragData.type = "Weapon";
      dragData.data = weapon;
      dragData.weaponId = +li.dataset.weaponId;

      event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    }
  }

  /* -------------------------------------------- */
  /* DROP EVENTS CALLBACKS                        */

  /* -------------------------------------------- */

  /** @override */
  async _onDrop(event) {
    event.preventDefault();
    // Get dropped data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch (err) {
      return false;
    }
    if (!data) return false;
    if (data.type === "Item") {
      return this._onDropItem(event, data);
    }
    if (data.type === "Actor") {
      return false;
    }
  }

  /**
   * Handle dropping of an item reference or item data onto an Actor Sheet
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {Object} data         The data transfer extracted from the event : only type and uuid are provided
   * @returns {Promise<Item[]|boolean>}  The created or updated Item instances, or false if the drop was not permitted.
   * @private
   */
  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;

    // Get the item from the drop
    const item = await Item.implementation.fromDropData(data);
    if (!COF.actorsAllowedItems[this.actor.type]?.includes(item.type)) return;

    const itemData = item.toObject();

    // Handle item sorting within the same Actor
    if (this.actor.uuid === item.parent?.uuid) return this._onSortItem(event, itemData);

    // Create the owned item
    return this._onDropItemCreate(itemData, data.uuid, event.shiftKey);
  }

  /**
   * Handle the final creation of dropped Item data on the Actor.
   * @param {object[]|object} itemData     The item data requested for creation
   * @param {String(uuid)} source uuid of the source
   * From a compendium : "Compendium.cof-srd.items.qg4bkUka4VQXwchl"
   * From another actor : "Actor.rIfuglFJjCzhkaTg.Item.KIcttA6qTUgXxthB"
   * From the items Directory : "Item.vf3pOZ4AssSB8Wy4"
   * @param {boolean} shiftKey Shift key was pressed during the drop
   * @returns {Promise<Item[]>}
   * @private
   */
  async _onDropItemCreate(itemData, source, shiftKey) {
    switch (itemData.type) {
      case "path":
        return await Path.addToActor(this.actor, itemData);
      case "profile":
        return await Profile.addToActor(this.actor, itemData);
      case "species":
        return await Species.addToActor(this.actor, itemData);
      case "capacity":
        return await Capacity.addToActor(this.actor, itemData);
      default: {
        const itemId = itemData._id;

        // Faut-il déplacer ou copier l'item ?
        let moveItem = game.settings.get("cof", "moveItem");

        // Récupération de l'actor d'origine
        let originalActorID = null;
        let originalActor = null;
        if (source.includes("Actor")) {
          originalActorID = source.split(".")[1];
          originalActor = ActorDirectory.collection.get(originalActorID);
        }

        // Si l'item doit être déplacé ET qu'il n'est plus dans l'inventaire d'origine, affichage d'un message d'avertissement et on arrête le traitement
        if (moveItem && originalActor && !originalActor.items.get(itemData._id)) {
          ui.notifications.warn(game.i18n.format("COF.notification.ItemNotInInventory", { itemName: itemData.name, actorName: originalActor.name }));
          return null;
        }

        // On force le nouvel Item a ne pas être équipé (notamment lors du transfert d'un inventaire à un autre)
        if (itemData.system.worn) itemData.system.worn = false;

        itemData = itemData instanceof Array ? itemData : [itemData];
        // Create the owned item
        return this.actor.createEmbeddedDocuments("Item", itemData).then((item) => {
          // Si il n'y as pas d'originalActor l'objet ne vient pas d'un autre acteur
          if (!originalActor) return item;

          // Si l'item doit être "move", on le supprime de l'actor précédent
          if (moveItem ^ shiftKey) {
            if (!originalActor.token) {
              originalActor.deleteEmbeddedDocuments("Item", [itemId]);
            } else {
              let token = TokenLayer.instance.placeables.find((token) => token.id === data.tokenId);
              let oldItem = token?.document.getEmbeddedCollection("Item").get(itemId);
              oldItem?.delete();
            }
          }
        });
      }
    }
  }

  /* -------------------------------------------- */
  /* DATA CONSOLIDATION FOR TEMPLATE RENDERING    */
  /* -------------------------------------------- */
  /** @override */
  async getData(options = {}) {
    const context = super.getData(options);
    if (COF.debug) console.log("COF | ActorSheet getData", context);

    let lockDuringPause = game.settings.get("cof", "lockDuringPause") && game.paused;
    options.editable &= game.user.isGM || !lockDuringPause;

    context.config = game.cof.config;
    context.profile = context.items.find((item) => item.type === "profile");
    context.species = context.items.find((item) => item.type === "species");
    context.combat = {
      count: context.items.filter((i) => i.system.worn).length,
      categories: [],
    };
    context.inventory = {
      count: context.items.filter((i) => i.type === "item").length,
      categories: [],
    };
    for (const category of Object.keys(game.cof.config.itemCategories)) {
      context.combat.categories.push({
        id: category,
        label: game.cof.config.itemCategories[category],
        items: Object.values(context.items)
          .filter((item) => item.type === "item" && item.system.subtype === category && item.system.worn && (item.system.properties.weapon || item.system.properties.protection))
          .sort((a, b) => (a.name > b.name ? 1 : -1)),
      });
      context.inventory.categories.push({
        id: category,
        label: "COF.category." + category,
        items: Object.values(context.items)
          .filter((item) => item.type === "item" && item.system.subtype === category)
          .sort((a, b) => (a.name > b.name ? 1 : -1)),
      });
    }

    context.combat.categories.forEach((category) => {
      if (category.items.length > 0) {
        category.items.forEach((item) => {
          if (item.system.properties?.weapon) {
            // Compute MOD
            const itemModStat = item.system.skill.split("@")[1];
            const itemModBonus = parseInt(item.system.skillBonus);
            const weaponCategory = this.getCategory(item);

            item.system.mod = this.actor.computeWeaponMod(itemModStat, itemModBonus, weaponCategory);

            // Compute DM
            const itemDmgBase = item.system.dmgBase;
            const itemDmgStat = item.system.dmgStat.split("@")[1];
            const itemDmgBonus = parseInt(item.system.dmgBonus);

            const skillDmgBonus = eval("this.actor.system." + itemModStat.replace("mod", "dmBonus"));

            item.system.dmg = this.actor.computeDm(itemDmgBase, itemDmgStat, itemDmgBonus, skillDmgBonus);
          }
        });
      }
    });

    // PATHS & CAPACITIES
    context.paths = context.items.filter((item) => item.type === "path");
    context.pathCount = context.paths.length;
    context.capacities = {
      count: context.items.filter((item) => item.type === "capacity").length,
      collections: [],
    };
    context.capacities.collections.push({
      id: "standalone-capacities",
      label: game.i18n.localize("COF.ui.OffPathsCapacities"),
      items: Object.values(context.items)
        .filter((item) => {
          if (item.type === "capacity" && !item.system.path) {
            return true;
          }
        })
        .sort((a, b) => (a.name > b.name ? 1 : -1)),
    });
    for (const path of context.paths) {
      context.capacities.collections.push({
        id: path.system.key ? path.system.key : path.name.slugify({ strict: true }),
        label: path.name,
        items: Object.values(context.items)
          .filter((item) => {
            if (item.type === "capacity" && item.system.path._id === path._id) return true;
          })
          .sort((a, b) => (a.system.rank > b.system.rank ? 1 : -1)),
      });
    }
    const overloadedMalus = this.actor.getOverloadedMalus();
    const overloadedOtherMod = this.actor.getOverloadedOtherMod();
    let overloadedTotal = 0;
    if (overloadedMalus !== 0) {
      overloadedTotal = overloadedMalus + overloadedOtherMod <= 0 ? overloadedMalus + overloadedOtherMod : 0;
    }
    context.overloaded = {
      armor: overloadedMalus,
      total: overloadedTotal,
    };
    // Gestion des boutons de modification des effets (visible pour l'actor si il en propriétaire)
    context.isEffectsEditable = options.editable;

    context.enrichedDescription = await TextEditor.enrichHTML(this.object.system.description, { async: true });

    context.diceValues = COF.DICE_VALUES;

    return context;
  }

  /**
   * @description Retourne la catégorie de l'arme
   *      -> à implémenter dans chacun des modules Chroniques Oubliées.
   *
   * @param {*} itemData
   * @returns Retourne "cof" en attendant l'implémentation
   */
  getCategory(itemData) {
    return "cof";
  }
}
