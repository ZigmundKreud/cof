export class Path {

    static addToActor(actor, event, itemData) {
        if (actor.items.filter(item => item.type === "path" && item.data.name === itemData.name).length > 0) {
            ui.notifications.error("Vous possédez déjà cette voie.");
            return false;
        } else {
            return actor.createEmbeddedEntity("OwnedItem", itemData);
            // return Traversal.getItemsOfType("capacity").then(caps => {
            //     let items = duplicate(caps.filter(entity => {
            //         return entity.data.path === itemData.data.key
            //     }));
            //     items.push(itemData);
            //     return actor.createEmbeddedEntity("OwnedItem", items);
            // });
        }
    }

    static removeFromActor(actor, event, entity) {
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