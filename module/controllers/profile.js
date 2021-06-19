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
            itemData = itemData instanceof Array ? itemData : [itemData];
            // ajoute le profil dans Items
            return actor.createEmbeddedDocuments("Item", itemData).then(newProfile => {
                let newProfileData = newProfile[0].data;
                return Traversal.mapItemsOfType(["path"]).then(paths => {
                    newProfileData.data.paths = newProfileData.data.paths.map(p => {
                        let pathData = paths[p._id];
                        pathData.flags.core = { sourceId: p.sourceId };
                        pathData.data.profile = {
                            _id: newProfileData._id,
                            name: newProfileData.name,
                            img: newProfileData.img,
                            key: newProfileData.data.key,
                            sourceId: newProfileData.flags.core.sourceId,
                        };
                        return pathData;
                    });
                    // add paths from profile
                    return Path.addPathsToActor(actor, newProfileData.data.paths)
                });
            });
        }
    }
    /**
     * @name removeFromActor
     * @description Supprime le profil et ses voies de l'acteur en paramètre
     * @public @static 
     * 
     * @param {CofActor} actor l'acteur sur lequel supprimer le profil
     * @param {CofItem} profile l'item profil à supprimer
     * @returns 
     */
    static removeFromActor(actor, profile) {
        const paths = actor.items.filter(item => item.type === "path" && item.data.data.profile?._id === profile.id);
        return Dialog.confirm({
            title: game.i18n.format("COF.dialog.deletePath.title"),
            content: `<p>Etes-vous sûr de vouloir supprimer le profil de ${actor.name} ?</p>`,
            yes: () => {
                Path.removePathsFromActor(actor, paths).then(() => {
                    ui.notifications.info(parseInt(paths.length) + ((paths.length > 1) ? " voies ont été supprimées." : " voie a été supprimée"));
                });
                ui.notifications.info("Le profil a été supprimé.");
                return actor.deleteEmbeddedDocuments("Item", [profile.id]);
            },
            defaultYes: false
        });
    }
}