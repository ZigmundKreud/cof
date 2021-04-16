import { Traversal } from "../utils/traversal.js";
import { Path } from "./path.js";

export class Profile {
    /**
     * 
     * @param {CofActor} actor 
     * @param {*} itemData 
     * @returns 
     */
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
                        pathData.flags.core = { sourceId: p.sourceId };
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
    /**
     * @name removeFromActor
     * @description Supprime le profil et ses voies de l'acteur en paramêtre
     * @public @static 
     * 
     * @param {CofActor} actor l'acteur sur lequel supprimer le profil
     * @param {CofItem} profile l'item profil à supprimer
     * @returns 
     */
    static removeFromActor(actor, profile) {
        const paths = actor.items.filter(item => item.type === "path" && item.data.data.profile?._id === profile.data._id);
        return Dialog.confirm({
            title: "Supprimer le profil ?",
            content: `<p>Etes-vous sûr de vouloir supprimer le profil de ${actor.name} ?</p>`,
            yes: () => {
                Path.removePathsFromActor(actor, paths).then(() => {
                    ui.notifications.info(parseInt(paths.length) + ((paths.length > 1) ? " voies ont été supprimés." : " voie a été supprimé"));
                });
                ui.notifications.info("le profil a été supprimé.");
                return actor.deleteOwnedItem(profile.data._id);
            },
            defaultYes: false
        });
    }
}