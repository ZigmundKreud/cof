export class Path {

    static async addToActor(actor, event, itemData) {
        if (actor.items.filter(item => item.type === "path" && item.data.name === itemData.name).length > 0) {
            ui.notifications.error("Vous possédez déjà cette voie.");
            return false;
        } else {
            // const capsContent = await game.packs.get("cof.capacities").getContent();
            // let items = duplicate(capsContent.filter(entity => entity.data.data.path === itemData.data.key));
            // items.push(itemData);
            // return actor.createEmbeddedEntity("OwnedItem", items).then(() => this._render(false));
            return actor.createEmbeddedEntity("OwnedItem", itemData);
        }
    }

    static removeFromActor(actor, event, entity) {
        console.log(entity);
        const pathData = entity.data;
        Dialog.confirm({
            title: "Supprimer la voie ?",
            content: `<p>Etes-vous sûr de vouloir supprimer la voie ${entity.name} ?</p>`,
            yes: () => {
                let items = actor.items.filter(item => item.data.type === "capacity" && item.data.data.path === pathData.data.key).map(c => c.data._id);
                items.push(entity._id);
                return actor.deleteOwnedItem(items);
            },
            defaultYes: true
        });
    }

}