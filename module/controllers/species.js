import {Traversal} from "../utils/traversal.js";

export class Species {

    static addToActor(actor, event, itemData) {
        if (actor.items.filter(item => item.type === "species").length > 0) {
            ui.notifications.error("Vous avez déjà une race.");
            return false;
        } else {
            return Traversal.getItemsOfType(["path"]).then(items => {
                // add profile
                items = items.filter(p => itemData.data.paths.includes(p._id))
                items.push(itemData);
                return actor.createOwnedItem(items)
            });
        }
    }

    static removeFromActor(actor, event, entity) {
        const actorData = actor.data;
        const speciesData = entity.data;
        return Dialog.confirm({
            title: "Supprimer la race ?",
            content: `<p>Etes-vous sûr de vouloir supprimer la race de ${actor.name} ?</p>`,
            yes: () => {
                return Traversal.getItemsOfType(["capacity"]).then(caps => {
                    caps = caps.filter(c => speciesData.data.capacities.includes(c._id));
                    const capsKeys = caps.map(c => c.data.key);
                    const capsIds = actorData.items.filter(item => capsKeys.includes(item.data.key) && item.type === "capacity").map(c => c._id);
                    return Traversal.getItemsOfType(["path"]).then(paths => {
                        paths = paths.filter(p => speciesData.data.paths.includes(p._id));
                        const pathsKeys = paths.map(p => p.data.key);
                        const pathsIds = actorData.items.filter(item => pathsKeys.includes(item.data.key) && item.type === "path").map(p => p._id);
                        let items = capsIds.concat(pathsIds);
                        items.push(entity.data._id);
                        return actor.deleteOwnedItem(items);
                    });
                });
            },
            defaultYes: false
        });
    }
}