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

    static removeFromActor(actor, event, itemData) {
        Dialog.confirm({
            title: "Supprimer le profil ?",
            content: `<p>Etes-vous sûr de vouloir supprimer le profil de ${actor.name} ?</p>`,
            yes: () => {
                // delete profile related capacities
                const capsIds = actor.items.filter(item => item.data.type === "capacity" && item.data.data.profile === itemData.data.data.key).map(c => c.data._id);
                // add profile related paths
                const pathsIds = actor.items.filter(item => item.data.type === "path" && item.data.data.profile.id === itemData.data.data.key).map(c => c.data._id);
                let items = capsIds.concat(pathsIds);
                // add the profile item to be removed
                items.push(itemData._id);
                console.log(items);
                return actor.deleteOwnedItem(items);
            },
            defaultYes: false
        });
    }

}