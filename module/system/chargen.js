export class CharacterGeneration {

    static async _buildStatsMessage(actor, flavor, rolls) {
        const tpl = 'systems/cof/templates/chat/stats-roll-card.hbs';
        const grandTotal = rolls.map(r => r.total).reduce((acc, val) => acc + val);
        renderTemplate(tpl, { rolls:rolls, grandTotal: grandTotal}).then(html => {
            let msgData = {
                user: game.user._id,
                flavor: flavor,
                sound: CONFIG.sounds.dice,
                content : html
            };
            if(actor) msgData.speaker = ChatMessage.getSpeaker({actor: actor});
            ChatMessage.create(msgData);
        });
    }

    static async statsCommand(actor) {
        const stats = await CharacterGeneration.rollStats();
        CharacterGeneration._buildStatsMessage(actor, game.i18n.localize("COF.characterGeneration"), stats);
        return stats;
    }

    static async rollStats() {
        let stats = [];
        for(let i=0; i<6; i++){
            let r = new Roll("4d6kh3");
            await r.roll();
            stats[i] = {
                formula : r.formula,
                result : r.result,
                total : r.total,
                dices : r.terms[0].results
            };
        }
        return stats;
    }
}