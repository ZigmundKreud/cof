/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
import {CharacterGeneration} from "../system/chargen.js";
import {CofSkillRoll} from "../system/skill-roll.js";
import {CofDamageRoll} from "../system/dmg-roll.js";
import {Traversal} from "../utils/traversal.js";

export class CofActorSheet extends ActorSheet {

    /**
     * Activate event listeners using the prepared sheet HTML
     * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
     */
    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        // Click to open
        html.find('.compendium-pack').dblclick(ev => {
            ev.preventDefault();
            let li = $(ev.currentTarget), pack = game.packs.get(li.data("pack"));
            if (li.attr("data-open") === "1") pack.close();
            else {
                li.attr("data-open", "1");
                pack.render(true);
            }
        });

        // Click to open
        html.find('.item-create.compendium-pack').click(ev => {
            ev.preventDefault();
            let li = $(ev.currentTarget), pack = game.packs.get(li.data("pack"));
            if (li.attr("data-open") === "1") pack.close();
            else {
                li.attr("data-open", "1");
                pack.render(true);
            }
        });

        // Initiate a roll
        html.find('.rollable').click(ev => {
            ev.preventDefault();
            return this._onRoll(ev);
        });

        // Actor reset (debug mode only)
        html.find('.actor-reset').click(ev => {
            ev.preventDefault();
            return this._onReset();
        });

        // Check/Uncheck capacities
        html.find('.capacity-checked').click(ev => {
            ev.preventDefault();
            return this._onCheckCapacity(ev, true);
        });
        html.find('.capacity-unchecked').click(ev => {
            ev.preventDefault();
            return this._onCheckCapacity(ev, false);
        });
        html.find('.capacity-edit').click(ev => {
            ev.preventDefault();
            const li = $(ev.currentTarget).closest(".capacity");
            let item = this.actor.getOwnedItem(li.data("itemId"));
            if(item) {
                item.sheet.render(true);
            }else{
                game.packs.get("cof.capacities").getEntity(li.data("itemId")).then(i => i.sheet.render(true));
            }
        });
        html.find('.capacity-create').click(ev => {
            ev.preventDefault();
            return this._onCapacityCreate(ev);
        });
        html.find('.capacity-toggle').click(ev => {
            ev.preventDefault();
            const li = $(ev.currentTarget).closest(".capacity");
            li.find(".capacity-description").slideToggle(200);
        });

        // Equip/Unequip items
        html.find('.item-equip').click(ev => {
            ev.preventDefault();
            return this._onEquipItem(ev);
        });

        html.find('.item-increase').click(ev => {
            ev.preventDefault();
            const li = $(ev.currentTarget).closest(".item");
            const item = this.actor.getOwnedItem(li.data("itemId"));
            let itemData = item.data;
            itemData.data.qty = (itemData.data.qty) ? itemData.data.qty +1 : 1;
            return this.actor.updateOwnedItem(itemData).then(() => this.render(true));
        });

        html.find('.item-decrease').click(ev => {
            ev.preventDefault();
            const li = $(ev.currentTarget).closest(".item");
            const item = this.actor.getOwnedItem(li.data("itemId"));
            let itemData = item.data;
            itemData.data.qty = (itemData.data.qty > 0) ? itemData.data.qty -1 : 0;
            return this.actor.updateOwnedItem(itemData).then(() => this.render(true));
        });

        // Display item sheet
        html.find('.item-name').click(ev => {
            ev.preventDefault();
            const li = $(ev.currentTarget).closest(".item");
            const item = this.actor.getOwnedItem(li.data("itemId"));
            return item.sheet.render(true);
        });
        html.find('.item-edit').click(ev => {
            ev.preventDefault();
            const li = $(ev.currentTarget).closest(".item");
            const item = this.actor.getOwnedItem(li.data("itemId"));
            return item.sheet.render(true);
        });
        // Delete items
        html.find('.item-delete').click(ev => {
            return this._onDeleteItem(ev);
        });
    }

    /* -------------------------------------------- */
    /**
     * Callback on capacity create action
     * @param event the create event
     * @private
     */
    async _onCapacityCreate(event) {
        const data = {name: "New Capacity", type: "capacity", data: {checked: true}};
        const created = await this.actor.createOwnedItem(data, {renderSheet: true}); // Returns one Entity, saved to the database
        // const created = await Item.create(data); // Returns one Entity, saved to the database
        // game.items.insert(item);
        // const li = $(ev.currentTarget).closest(".capacity");
        // const item = this.actor.getOwnedItem(li.data("itemId"));
    }

    /* -------------------------------------------- */
    /**
     * Callback on delete item actions
     * @param event the roll event
     * @private
     */
    _onDeleteItem(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const itemId = li.data("itemId");
        const itemData = this.actor.items.find(item => item._id === itemId);
        switch (itemData.data.type) {
            case "species" :
                this._onDeleteSpecies(event, itemData);
                break;
            case "path" :
                this._onDeletePath(event, itemData);
                break;
            case "profile" :
                this._onDeleteProfile(event, itemData);
                break;
            default: {
                this.actor.deleteOwnedItem(li.data("itemId"));
                li.slideUp(200, () => this.render(false));
            }
        }
        return true;
    }

    /* -------------------------------------------- */
    _onDeleteSpecies(event, itemData) {
        const actorData = this.actor.data;
        Dialog.confirm({
            title: "Supprimer la race ?",
            content: `<p>Etes-vous sûr de vouloir supprimer la race de ${this.actor.name} ?</p>`,
            yes: () => {
                let items = actorData.items.filter(i => i.type === "capacity" && i.data.scope === "species").map(e => e._id);
                items.push(itemData.data._id);
                return this.actor.deleteOwnedItem(items);
            },
            defaultYes: false
        });
    }

    /* -------------------------------------------- */
    _onDeletePath(event, itemData) {
        const li = $(event.currentTarget).parents(".item");
        const actor = this.actor;
        const parent = this;
        let d = Dialog.confirm({
            title: "Supprimer la voie ?",
            content: `<p>Etes-vous sûr de vouloir supprimer la voie ${itemData.name} ?</p>`,
            yes: () => {
                let itemsToDelete = actor.items.filter(item => item.data.type === "capacity" && item.data.data.path === itemData.data.data.key).map(c => c.data._id);
                itemsToDelete.push(li.data("itemId"));
                actor.deleteOwnedItem(itemsToDelete);
                li.slideUp(200, () => parent.render(false));
            },
            defaultYes: false
        });
    }

    /* -------------------------------------------- */
    _onDeleteProfile(event, itemData) {
        const li = $(event.currentTarget).parents(".item");
        const actor = this.actor;
        const parent = this;
        let d = Dialog.confirm({
            title: "Supprimer le profil ?",
            content: `<p>Etes-vous sûr de vouloir supprimer le profil de ${this.actor.name} ?</p>`,
            yes: () => {
                // delete profile related capacities
                let itemsToDelete = actor.items.filter(item => {
                    return item.data.type === "capacity" && item.data.data.profile === itemData.data.data.key
                }).map(c => c.data._id);
                // add profile related paths
                itemsToDelete.push(...actor.items.filter(item => item.data.type === "path" && item.data.data.profile.id === itemData.data.data.key).map(c => c.data._id));
                // add the profile item to be removed
                itemsToDelete.push(li.data("itemId"));
                actor.deleteOwnedItem(itemsToDelete);
                li.slideUp(200, () => parent.render(false));
            },
            defaultYes: false
        });
    }

    /* -------------------------------------------- */
    /**
     * Initiates a roll from any kind depending on the "data-roll-type" attribute
     * @param event the roll event
     * @private
     */
    _onRoll(event) {
        const elt = $(event.currentTarget)[0];
        const rolltype = elt.attributes["data-roll-type"].value;
        switch (rolltype) {
            case "skillcheck" :
                return this._rollSkillCheck(event);
                break;
            case "weapon" :
                return this._rollWeapon(event);
                break;
            case "encounter-weapon" :
                return this._rollEncounterWeapon(event);
                break;
            case "encounter-damage" :
                return this._rollEncounterDamage(event);
                break;
            case "spell" :
                return this._rollSpell(event);
                break;
            case "damage" :
                return this._rollDamage(event);
                break;
            case "hp" :
                return this._rollHitPoints(event);
                break;
            case "attributes" :
                return this._rollAttributes(event);
                break;
        }
    }

    /* -------------------------------------------- */
    /**
     *  Handles skill check rolls
     * @param elt DOM element which raised the roll event
     * @param key the key of the attribute to roll
     * @private
     */
    _rollSkillCheck(event) {
        const elt = $(event.currentTarget)[0];
        let key = elt.attributes["data-rolling"].value;
        let data = this.getData().data;
        // console.log(data);
        let label = eval(`${key}.label`);
        const mod = eval(`${key}.mod`);
        let bonus = eval(`${key}.bonus`);
        const critrange = 20;
        bonus = (bonus) ? bonus : 0;
        label = (label) ? game.i18n.localize(label) : null;
        this._rollDialog(label, mod, bonus, critrange);
    }

    /* -------------------------------------------- */
    /**
     *  Handles weapon check rolls
     * @param elt DOM element which raised the roll event
     * @param key the key of the attribute to roll
     * @private
     */
    _rollWeapon(event) {
        const li = $(event.currentTarget).parents(".item");
        let item = this.actor.getOwnedItem(li.data("itemId"));
        const itemData = item.data;
        let label = itemData.name;
        let mod = itemData.data.mod;
        let critrange = itemData.data.critrange;
        let dmg = itemData.data.dmg;
        return this._rollWeaponDialog(label, mod, 0, critrange, dmg);
    }

    /* -------------------------------------------- */
    /**
     *  Handles encounter attack checks
     * @param elt DOM element which raised the roll event
     * @param key the key of the attribute to roll
     * @private
     */
    _rollEncounterWeapon(event) {
        const item = $(event.currentTarget).parents(".weapon");
        let label = item.find(".weapon-name").text();
        let mod = item.find(".weapon-mod").val();
        let critrange = item.find(".weapon-critrange").val();
        let dmg = item.find(".weapon-dmg").val();
        return this._rollWeaponDialog(label, mod, 0, critrange, dmg);
    }

    /* -------------------------------------------- */
    /**
     *  Handles encounter damage rolls
     * @param elt DOM element which raised the roll event
     * @param key the key of the attribute to roll
     * @private
     */
    _rollEncounterDamage(event) {
        const item = $(event.currentTarget).parents(".weapon");
        let label = item.find(".weapon-name").text();
        let dmg = item.find(".weapon-dmg").val();
        return this._rollDamageDialog(label, dmg, 0);
    }

    /* -------------------------------------------- */
    /**
     *  Handles spell rolls
     * @param elt DOM element which raised the roll event
     * @param key the key of the attribute to roll
     * @private
     */
    _rollSpell(event) {
        const li = $(event.currentTarget).parents(".item");
        let item = this.actor.getOwnedItem(li.data("itemId"));
        let label = item.data.name;
        let mod = item.data.data.mod;
        let critrange = item.data.data.critrange;
        let dmg = item.data.data.dmg;
        return this._rollWeaponDialog(label, mod, 0, critrange, dmg);
    }

    /* -------------------------------------------- */
    /**
     *  Handles damage rolls
     * @param elt DOM element which raised the roll event
     * @param key the key of the attribute to roll
     * @private
     */
    _rollDamage(event) {
        const li = $(event.currentTarget).parents(".item");
        let item = this.actor.getOwnedItem(li.data("itemId"));
        let label = item.data.name;
        let dmg = item.data.data.dmg;
        return this._rollDamageDialog(label, dmg, 0);
    }

    /* -------------------------------------------- */
    /**
     *  Handles Hit Points Rolls
     * @param elt DOM element which raised the roll event
     * @param key the key of the attribute to roll
     * @private
     */
    _rollHitPoints(event) {
        let data = this.getData().data;
        let hp = data.attributes.hp;
        const lvl = data.level.value;
        const conMod = data.stats.con.mod;
        const profile = this.actor.items.find(item => item.type === "profile");
        const actor = this.actor;

        Dialog.confirm({
            title: "Roll Hit Points",
            content: `<p>Êtes sûr de vouloir remplacer les points de vie de <strong>${actor.name}</strong></p>`,
            yes: () => {
                if (profile) {
                    const hd = profile.data.data.dv;
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
                        const r = new Roll(formula);
                        r.roll();
                        r.toMessage({
                            user: game.user._id,
                            flavor: "<h2>Roll Hit Points</h2>",
                            speaker: ChatMessage.getSpeaker({actor: actor})
                        });
                        hp.base = hpLvl1 + r.total;
                        hp.max = hp.base + hp.bonus;
                        hp.value = hp.max;
                    }

                    actor.update({'data.attributes.hp': hp}).then(() => this._render(false));
                } else ui.notifications.error("Vous devez sélectionner un profil.");
            },
            defaultYes: false
        });
    }

    /* -------------------------------------------- */
    /**
     *  Handles attributes rolls
     * @param elt DOM element which raised the roll event
     * @param key the key of the attribute to roll
     * @private
     */
    async _rollAttributes(elt) {

        const actor = this.actor;
        let data = this.getData();
        let stats = data.data.stats;

        Dialog.confirm({
            title: "Jet de caractéristiques",
            content: `<p>Êtes sûr de vouloir remplacer les caractériques de <strong>${actor.name}</strong></p>`,
            yes: () => {
                const rolls = CharacterGeneration.statsCommand(actor);
                let i = 0;
                for (const stat of Object.values(stats)) {
                    stat.base = rolls[i].total;
                    ++i;
                }
                actor.update({'data.stats': stats}).then(() => this._render(false));
            },
            defaultYes: false
        });
        return true;
    }

    /* -------------------------------------------- */
    /* ROLL DIALOGS                                 */

    /* -------------------------------------------- */

    async _rollDialog(label, mod, bonus, critrange) {
        const rollOptionTpl = 'systems/cof/templates/dialogs/roll-options-dialog.hbs';
        const rollOptionContent = await renderTemplate(rollOptionTpl, {mod: mod, bonus: bonus, critrange: critrange});

        let d = new Dialog({
            title: label,
            content: rollOptionContent,
            buttons: {
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("COF.ui.cancel"),
                    callback: () => {
                    }
                },
                submit: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("COF.ui.submit"),
                    callback: (html) => {
                        const dice = html.find("#dice").val();
                        const diff = html.find('#difficulty').val();
                        const critrange = html.find('input#critrange').val();
                        const m = html.find('input#mod').val();
                        const b = html.find('input#bonus').val();
                        let r = new CofSkillRoll(label, dice, m, b, diff, critrange);
                        r.roll(this.actor);
                    }
                }
            },
            default: "submit",
            close: () => {
            }
        });
        d.render(true);
    }

    /* -------------------------------------------- */

    async _rollWeaponDialog(label, mod, bonus, critrange, formula) {
        const rollOptionTpl = 'systems/cof/templates/dialogs/roll-weapon-dialog.hbs';
        let diff = null;
        if(game.settings.get("cof", "displayDifficulty") && game.user.targets.size > 0){
            diff = [...game.user.targets][0].actor.data.data.attributes.def.value;
        }
        const rollOptionContent = await renderTemplate(rollOptionTpl, {
            mod: mod,
            bonus: bonus,
            critrange: critrange,
            formula: formula,
            difficulty: diff
        });

        let d = new Dialog({
            title: "Weapon Roll",
            content: rollOptionContent,
            buttons: {
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => {
                    }
                },
                submit: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Submit",
                    callback: (html) => {
                        const dice = html.find("#dice").val();
                        const diff = html.find('#difficulty').val();
                        const critrange = html.find('input#critrange').val();
                        const m = html.find('input#mod').val();
                        const b = html.find('input#bonus').val();
                        const dmgFormula = html.find("#formula").val();
                        let r = new CofSkillRoll(label, dice, m, b, diff, critrange);
                        r.weaponRoll(this.actor, dmgFormula);
                    }
                }
            },
            default: "submit",
            close: () => {
            }
        });
        d.render(true);
    }

    /* -------------------------------------------- */

    async _rollDamageDialog(label, formula, bonus) {
        const rollOptionTpl = 'systems/cof/templates/dialogs/roll-dmg-dialog.hbs';
        const rollOptionContent = await renderTemplate(rollOptionTpl, {formula: formula, bonus: bonus, custom: ""});

        let d = new Dialog({
            title: "Damage Roll",
            content: rollOptionContent,
            buttons: {
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => {
                    }
                },
                submit: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Submit",
                    callback: (html) => {
                        const custom = html.find("#custom").val();
                        const formula = (custom) ? custom : html.find("#formula").val();
                        let r = new CofDamageRoll(label, formula, false);
                        r.roll(this.actor);
                    }
                }
            },
            default: "submit",
            close: () => {
            }
        });
        d.render(true);
    }

    /* -------------------------------------------- */

    /** @override */
    async _onDrop(event) {
        event.preventDefault();
        // Get dropped data
        let data;
        try {
            data = JSON.parse(event.dataTransfer.getData('text/plain'));
        } catch (err) {
            return false;
        }
        if (!data) return false;

        // Case 1 - Dropped Item
        if (data.type === "Item") {
            return this._onDropItem(event, data);
        }

        // Case 2 - Dropped Actor
        if (data.type === "Actor") {
            return this._onDropActor(event, data);
        }
    }

    /* -------------------------------------------- */

    /**
     * Handle dropping an Actor on the sheet to trigger a Polymorph workflow
     * @param {DragEvent} event   The drop event
     * @param {Object} data       The data transfer
     * @private
     */
    async _onDropActor(event, data) {
        return false;
    }

    /* -------------------------------------------- */

    /**
     * Handle dropping of an item reference or item data onto an Actor Sheet
     * @param {DragEvent} event     The concluding DragEvent which contains drop data
     * @param {Object} data         The data transfer extracted from the event
     * @return {Object}             OwnedItem data to create
     * @private
     */
    async _onDropItem(event, data) {
        if (!this.actor.owner) return false;
        // let authorized = true;

        let itemData = await this._getItemDropData(event, data);

        switch (itemData.type) {
            case "path"    :
                return await this._onDropPathItem(event, itemData);
            case "profile" :
                return await this._onDropProfileItem(event, itemData);
            case "species" :
                return await this._onDropSpeciesItem(event, itemData);
            case "capacity" :
            case "shield" :
            case "armor" :
            case "melee" :
            case "ranged" :
            default:
                // activate the capacity as it is droped on an actor sheet
                if (itemData.type === "capacity") itemData.data.checked = true;
                // Handle item sorting within the same Actor
                const actor = this.actor;
                let sameActor = (data.actorId === actor._id) || (actor.isToken && (data.tokenId === actor.token.id));
                if (sameActor) return this._onSortItem(event, itemData);
                // Create the owned item
                return this.actor.createEmbeddedEntity("OwnedItem", itemData);
        }
        // if (authorized) {
        //     // Handle item sorting within the same Actor
        //     const actor = this.actor;
        //     let sameActor = (data.actorId === actor._id) || (actor.isToken && (data.tokenId === actor.token.id));
        //     if (sameActor) return this._onSortItem(event, itemData);
        //     // Create the owned item
        //     return this.actor.createEmbeddedEntity("OwnedItem", itemData);
        // } else {
        //     return false;
        // }
    }

    /* -------------------------------------------- */
    async _onDropPathItem(event, itemData) {
        if (this.actor.items.filter(item => item.type === "path" && item.data.name === itemData.name).length > 0) {
            ui.notifications.error("Vous possédez déjà cette voie.");
            return false;
        } else {
            const capsContent = await game.packs.get("cof.capacities").getContent();
            let items = duplicate(capsContent.filter(entity => entity.data.data.path === itemData.data.key));
            items.push(itemData);
            return this.actor.createEmbeddedEntity("OwnedItem", items).then(() => this._render(false));
        }
    }

    /* -------------------------------------------- */
    async _onDropProfileItem(event, profileItemData) {
        if (this.actor.items.filter(item => item.type === "profile").length > 0) {
            ui.notifications.error("Vous avez déjà un profil.");
            return false;
        } else {
            // const pathsContent = await game.packs.get("cof.paths").getContent();
            // let items = pathsContent.filter(entity => entity.data.data.profile === profileItemData.data.key);
            // const capsContent = await game.packs.get("cof.capacities").getContent();
            // items.push(...capsContent.filter(entity => entity.data.data.profile === profileItemData.data.key));
            // items.push(profileItemData);
            // return this.actor.createEmbeddedEntity("OwnedItem", profileItemData).then(() => this._render(false));
            return this.actor.createOwnedItem(profileItemData)
        }
    }

    /* -------------------------------------------- */
    async _onDropSpeciesItem(event, itemData) {
        if (this.actor.items.filter(item => item.type === "species").length > 0) {
            ui.notifications.error("Vous avez déjà une race.");
            return false;
        } else {
            let items = COF.capacities.filter(e => itemData.data.capacities.includes(e._id));
            items.push(itemData);
            // return this.actor.createEmbeddedEntity("OwnedItem", items).then(() => this._render(false));
            return this.actor.createOwnedItem(items);
        }
    }

    /* -------------------------------------------- */

    /**
     * TODO: A temporary shim method until Item.getDropData() is implemented
     * https://gitlab.com/foundrynet/foundryvtt/-/issues/2866
     * @private
     */
    async _getItemDropData(event, data) {
        let itemData = null;
        // Case 1 - Import from a Compendium pack
        if (data.pack) {
            const pack = game.packs.get(data.pack);
            if (pack.metadata.entity !== "Item") return;
            itemData = await pack.getEntry(data.id);
        }
        // Case 2 - Data explicitly provided
        else if (data.data) {
            itemData = data.data;
        }
        // Case 3 - Import from World entity
        else {
            let item = game.items.get(data.id);
            if (!item) return;
            itemData = item.data;
        }
        // Return a copy of the extracted data
        return duplicate(itemData);
    }

    /* -------------------------------------------- */

    _onEquipItem(ev) {
        const elt = $(ev.currentTarget).parents(".item");
        const item = this.actor.getOwnedItem(elt.data("itemId"));
        let itemData = item.data;
        itemData.data.worn = !itemData.data.worn;
        return this.actor.updateOwnedItem(itemData).then(() => this.render(true));
    }

    /* -------------------------------------------- */

    _onCheckCapacity(ev, isUncheck) {
        const elt = $(ev.currentTarget).parents(".capacity");
        const data = duplicate(this.actor.data);
        const capId = elt.data("itemId");
        const pathId = elt.data("pathId");
        const path = Traversal.getItemsOfType("path").find(p => p._id === pathId);
        const capacities = Traversal.getItemsOfType("capacity").filter(c => path.data.capacities.includes(c._id));
        const capacity = capacities.find(c => c._id === capId);
        const items = data.items.filter(i => i.type === "capacity" && i.data.path && i.data.key);
        const itemKeys = items.map(i => i.data.key);
        const caps = (isUncheck) ? capacities.filter(c => c.data.rank >= capacity.data.rank) : capacities.filter(c => c.data.rank <= capacity.data.rank);
        if(isUncheck){
            // REMOVE SELECTED CAPS
            const capsKeys = caps.map(c => c.data.key);
            const toRemove = items.filter(i => capsKeys.includes(i.data.key)).map(i => i._id);
            console.log(toRemove);
            return this.actor.deleteOwnedItem(toRemove);
        }else {
            // ADD CAPS IF NOT EXISTS
            return this.actor.createOwnedItem(caps.filter(c => !itemKeys.includes(c.data.key)));
        }
    }

    /* -------------------------------------------- */

    /** @override */
    setPosition(options = {}) {
        const position = super.setPosition(options);
        const sheetBody = this.element.find(".sheet-body");
        const bodyHeight = position.height - 192;
        sheetBody.css("height", bodyHeight);
        return position;
    }

    /* -------------------------------------------- */

    /**
     * Provides the data to the template when rendering the actor sheet
     *
     * This function is called when rendering the sheet, where it calls the base actor class
     * to organize, process, and prepare all actor data for display. See ActorWfrp4e.prepare()
     *
     * @returns {Object} sheetData    Data given to the template when rendering
     */
    /** @override */
    getData() {
        const data = super.getData();
        return data;
    }

    /* -------------------------------------------- */
    async _onReset() {
        await this.actor.deleteOwnedItem(this.actor.items.map(item => item.data._id));
        let data = this.getData();
        let stats = data.data.stats;
        Object.values(stats).map(s => {
            s.base = 10;
            s.racial = 0;
            s.bonus = 0;
            s.tmpval = null;
        });
        this.actor.update({'data.stats': stats});
    }
}
