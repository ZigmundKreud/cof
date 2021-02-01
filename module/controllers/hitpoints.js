export class Hitpoints {
    static applyToTargets(amount) {
        // on prend les cibles s'il y en a, sinon on prend les tokens actifs.
        // notation [...] transforme un Set en Array
        let targets = ([...game.user.targets].length > 0) ? [...game.user.targets] : canvas.tokens.objects.children.filter(t => t._controlled);
        if (targets.length == 0) {
            ui.notifications.error("Vous devez sélectionner au moins une cible pour appliquer les dégâts.");
        } else {
            for(let target of targets){
                // console.log(target);
                let data = duplicate(target.actor.data);
                let hp = data.data.attributes.hp;
                hp.value += amount;
                target.actor.update(data);
            }
        }
    }

    static onClickChatMessageApplyButton(event, html, data){
        const btn = $(event.currentTarget);
        const btnType = btn.data("apply");
        const dmg = parseInt(html.find(".dice-total").text());
        switch(btnType){
            case "full"   : Hitpoints.applyToTargets(-dmg); break;
            case "half"   : Hitpoints.applyToTargets(-Math.ceil(dmg/2)); break;
            case "double" : Hitpoints.applyToTargets(-dmg*2); break;
            case "heal"   : Hitpoints.applyToTargets(dmg); break;
        }
    }
}