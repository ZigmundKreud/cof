import {Traversal} from "../utils/traversal.js";
import {Path} from "./path.js";

export class Profile {

    static addToActor(actor, itemData) {
        if (actor.items.filter(item => item.type === "profile").length > 0) {
            ui.notifications.error("Vous avez déjà un profil.");
            return false;
        } else {
            // add profile
            return actor.createOwnedItem(itemData).then(newProfile => {
                return Traversal.mapItemsOfType(["path"]).then(paths => {
                    newProfile.data.paths = newProfile.data.paths.map(p => {
                        let pathData = paths[p._id];
                        pathData.flags.core = {sourceId: p.sourceId};
                        pathData.data.profile = {
                            _id: newProfile._id,
                            name: newProfile.name,
                            img: newProfile.img,
                            key: newProfile.data.key,
                            sourceId: newProfile.flags.core.sourceId,
                        };
                        return pathData;
                    });
                    // add paths from profile
                    return Path.addPathsToActor(actor, newProfile.data.paths).then(newPaths => {
                        newProfile.data.paths = newPaths;
                        // update profile with new paths ids
                        return actor.updateOwnedItem(newProfile);
                    });
                });
            });
        }
    }

    static removeFromActor(actor, entity) {
        const profileData = entity.data;
        return Dialog.confirm({
            title: "Supprimer le profil ?",
            content: `<p>Etes-vous sûr de vouloir supprimer le profil de ${actor.name} ?</p>`,
            yes: () => {
                return Path.removePathsFromActor(actor, profileData.data.paths).then(result => {
                    ui.notifications.info(parseInt(result.length + 1) + " éléments ont été supprimés.");
                    return actor.deleteOwnedItem(entity._id);
                });
            },
            defaultYes: false
        });
    }
}