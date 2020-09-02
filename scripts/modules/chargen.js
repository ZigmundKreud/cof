export class CharacterGeneration {

    static async _buildStatsMessage(actor, flavor, rolls) {
        const tpl = 'systems/cof/templates/roll-stats.hbs';
        const grandTotal = rolls.map(r => r.total).reduce((acc, val) => acc + val);
        renderTemplate(tpl, { rolls:rolls, grandTotal: grandTotal}).then(html => {
            let msgData = {
                user: game.user._id,
                flavor: flavor,
                sound: CONFIG.sounds.dice,
                content : html
            };
            if(actor) msgData.speaker = ChatMessage.getSpeaker({actor: this.actor});
            ChatMessage.create(msgData);
        });
    }

    static _buildHPMessage(actor, flavor, rolls) {
        const tpl = 'systems/cof/templates/not-implemented.hbs';
        renderTemplate(tpl, {}).then(html => {
            let msgData = {
                user: game.user._id,
                flavor: flavor,
                sound: CONFIG.sounds.dice,
                content : html
            };
            if(actor) msgData.speaker = ChatMessage.getSpeaker({actor: this.actor});
            ChatMessage.create(msgData);
        });
    }

    static statsCommand(actor) {
        const stats = CharacterGeneration.rollStats();
        CharacterGeneration._buildStatsMessage(actor, "<h2>Création de personnage</h2><h3>Jets de caractéristiques</h3>", stats);
        return stats;
    }

    static rollHPCommand(actor) {
        const hp = CharacterGeneration.rollHP();
        CharacterGeneration._buildHPMessage(actor, "<h2>Création de personnage</h2><h3>Détermination des Points de Vie</h3>", hp);
        return hp;
    }

    static rollStats() {
        let stats = [];
        for(let i=0; i<6; i++){
            let r = new Roll("4d6kh3");
            r.roll();
            stats[i] = {
                formula : r.formula,
                result : r.result,
                total : r.total,
                dices : r.parts[0].rolls
            };
        }
        return stats;
    }

    static rollHP() {
    }
}