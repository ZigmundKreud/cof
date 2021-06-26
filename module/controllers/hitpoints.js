export class Hitpoints {
    static applyToTargets(amount, dr) {
        // on prend les cibles s'il y en a, sinon on prend les tokens actifs.
        // notation [...] transforme un Set en Array
        let targets = ([...game.user.targets].length > 0) ? [...game.user.targets] : canvas.tokens.objects.children.filter(t => t._controlled);
        if (targets.length == 0) {
            ui.notifications.error("Vous devez sélectionner au moins une cible pour appliquer les dégâts.");
        } else {
            for(let target of targets){
                let data = duplicate(target.actor.data);
                let hp = data.data.attributes.hp;
                // Application de la RD si c'est cochée
                const finalAmount = amount + (dr ? data.data.attributes.dr.value : 0);
                hp.value += finalAmount;

                target.actor.update(data);
            }
        }
    }

    static onClickChatMessageApplyButton(event, html, data){
        const btn = $(event.currentTarget);
        const btnType = btn.data("apply");
        const dmg = parseInt(html.find(".dice-total").text());
        const dr = html.find("#dr").is(":checked");
        switch(btnType){
            case "full"   : Hitpoints.applyToTargets(-dmg, dr); break;
            case "half"   : Hitpoints.applyToTargets(-Math.ceil(dmg/2), dr); break;
            case "double" : Hitpoints.applyToTargets(-dmg*2, dr); break;
            case "heal"   : Hitpoints.applyToTargets(dmg, dr); break;
        }
    }
}