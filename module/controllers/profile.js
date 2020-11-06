import {Traversal} from "../utils/traversal.js";

export class Profile {

    static addToActor(actor, event, itemData) {
        if (actor.items.filter(item => item.type === "profile").length > 0) {
            ui.notifications.error("Vous avez déjà un profil.");
            return false;
        } else {
            // add paths from profile
            let items = Traversal.getItemsOfType("path").filter(p => itemData.data.paths.includes(p._id));
            // add profile
            items.push(itemData);
            return actor.createOwnedItem(items)
        }
    }

    static removeFromActor(actor, event, entity) {
        const profileData = entity.data;
        return Dialog.confirm({
            title: "Supprimer le profil ?",
            content: `<p>Etes-vous sûr de vouloir supprimer le profil de ${actor.name} ?</p>`,
            yes: () => {
                // retrieve path data from profile paths
                const pathsKeys = Traversal.getItemsOfType("path").filter(p => profileData.data.paths.includes(p._id)).map(p => p.data.key);
                // retrieve owned items matching profile paths
                const ownedPaths = actor.items.filter(item => pathsKeys.includes(item.data.data.key) && item.data.type === "path");
                const ownedPathsIds = ownedPaths.map(c => c.data._id);
                const ownedPathsCapacities = ownedPaths.map(c => c.data.data.capacities).flat();
                // retrieve owned capacities matching profile paths capacities
                const capsKeys = Traversal.getItemsOfType("capacity").filter(p => ownedPathsCapacities.includes(p._id)).map(c => c.data.key);
                const capsIds = actor.items.filter(item => capsKeys.includes(item.data.data.key) && item.data.type === "capacity").map(c => c.data._id);
                let items = ownedPathsIds.concat(capsIds);
                // add the profile item to be removed
                items.push(entity._id);
                return actor.deleteOwnedItem(items);
            },
            defaultYes: false
        });
    }

}