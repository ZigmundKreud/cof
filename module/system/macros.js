export class Macros {

    static rollVigilanceMacro = function (token) {

        if(token){
            let d = new Dialog({
                title: "Modificateur",
                content: `
            <form> 
              <div class="form-group">
                <label>Modificateur:</label>
                <select id="vision-type" name="vision-type">
                  <option value="-1">-1</option>
                  <option value="2">2</option>
                </select>
              </div>
            </form>
          `,
                buttons: {
                    cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel",
                        callback: (html) => {
                            console.log("Vous avez cliqué sur Cancel");
                        }
                    },
                    roll: {
                        icon: '<i class="fas fa-dice-d20"></i>',
                        label: "OK",
                        callback: (html) => {
                            console.log(token);
                            const mod = html.find('#vision-type').val();
                            console.log(mod);
                            const vigilance = token.actor.data.data.stats[0].value + eval(mod);
                            console.log(vigilance);
                            const formula = `2d6 <= ${vigilance}`;
                            const r = new Roll(formula);
                            r.roll();
                            const rollFlavor = (r.total <= vigilance) ? "<h2>Succès !</h2>" : "<h2>Echec... !</h2>";
                            r.toMessage({
                                user: game.user._id,
                                flavor: rollFlavor,
                                speaker: ChatMessage.getSpeaker({actor: token.actor})
                            });
                        }
                    }
                },
                default: "ok",
                close: () => {
                }
            });
            d.render(true);
        } else {
            ui.notifications.error("Vous devez sélectionner un token pour pouvoir exécuter cette macro.");
        }
    };

    static rollItemMacro = function (itemName, itemType, bypassData) {
        const speaker = ChatMessage.getSpeaker();
        let actor;
        if (speaker.token) actor = game.actors.tokens[speaker.token];
        if (!actor) actor = game.actors.get(speaker.actor);
        console.log(itemName, itemType, bypassData);
        // let item;
        // // Not technically an item, used for convenience
        // if (itemType == "characteristic")
        // {
        //     return actor.setupCharacteristic(itemName, bypassData)
        // }
        // else
        // {
        //     item = actor ? actor.items.find(i => i.name === itemName && i.type == itemType) : null;
        // }
        // if (!item) return ui.notifications.warn(`${game.i18n.localize("Error.MacroItemMissing")} ${itemName}`);
        //
        // item = item.data;
        //
        // // Trigger the item roll
        // switch (item.type)
        // {
        //     case "weapon":
        //         return actor.setupWeapon(item, bypassData)
        //     case "spell":
        //         return actor.spellDialog(item, bypassData)
        //     case "prayer":
        //         return actor.setupPrayer(item, bypassData)
        //     case "trait":
        //         return actor.setupTrait(item, bypassData)
        //     case "skill":
        //         return actor.setupSkill(item, bypassData)
        // }
    };


}
