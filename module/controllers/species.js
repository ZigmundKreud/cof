import { Traversal } from "../utils/traversal.js";
import { Path } from "./path.js";
import { Capacity } from "./capacity.js";

export class Species {
    /**
     * 
     * @param {CofActor} actor 
     * @param {CofItem} itemData 
     * @returns 
     */
    static addToActor(actor, itemData) {
        if (actor.items.filter(item => item.type === "species").length > 0) {
            ui.notifications.error("Vous avez déjà une race.");
            return false;
        } else {
            // add species
            return actor.createEmbeddedDocuments("Item",[itemData]).then(newSpecies => {
                return Traversal.mapItemsOfType(["path", "capacity"]).then(entities => {
                    newSpecies.data.data.capacities = newSpecies.data.data.capacities.map(cap => {
                        let capData = entities[cap._id];
                        capData.flags.core = { sourceId: cap.sourceId };
                        capData.data.species = {
                            _id: newSpecies._id,
                            name: newSpecies.name,
                            img: newSpecies.img,
                            key: newSpecies.data.data.key,
                            sourceId: newSpecies.flags.core.sourceId,
                        };
                        return capData;
                    });
                    newSpecies.data.paths = newSpecies.data.paths.map(p => {
                        let pathData = entities[p._id];
                        pathData.flags.core = { sourceId: p.sourceId };
                        pathData.data.species = {
                            _id: newSpecies._id,
                            name: newSpecies.name,
                            img: newSpecies.img,
                            key: newSpecies.data.data.data.key,
                            sourceId: newSpecies.flags.core.sourceId,
                        };
                        return pathData;
                    });
                    // add caps from species
                    return Capacity.addCapsToActor(actor, newSpecies.data.data.capacities).then(newCaps => {
                        newSpecies.data.data.capacities = newCaps;
                        // add paths from species
                        return Path.addPathsToActor(actor, newSpecies.data.data.paths).then(newPaths => {
                            newSpecies.data.data.paths = newPaths;
                            // update profile with new ids
                            return actor.updateEmbeddedDocuments("Item",newSpecies);
                        });
                    });
                });
            });
        }
    }

    /**
     * @name removeFromActor
     * @description Supprime la race et ses capacités de l'acteur en paramêtre
     * @public @static 
     * 
     * @param {CofActor} actor l'acteur sur lequel supprimer la race
     * @param {CofItem} specie l'item race à supprimer
     * @returns 
     */
    static removeFromActor(actor, specie) {
        const paths = actor.items.filter(item => item.type === "path" && item.data.data.species?._id === specie.data._id);
        const capacities = actor.items.filter(item => item.type === "capacity" && item.data.data.species?._id === specie.data._id);
        return Dialog.confirm({
            title: game.i18n.format("COF.dialog.deleteSpecie.title"),
            content: `<p>Etes-vous sûr de vouloir supprimer la race de ${actor.name} ?</p>`,
            yes: () => {
                Path.removePathsFromActor(actor, paths).then(() => {
                    ui.notifications.info(parseInt(paths.length) + ((paths.length > 1) ? " voies ont été supprimées." : " voie a été supprimée"));
                });
                Capacity.removeCapacitiesFromActor(actor, capacities).then(() => {
                    ui.notifications.info(parseInt(capacities.length) + ((capacities.length > 1) ? " capacités ont été supprimées." : " capacité a été supprimée"));
                });
                ui.notifications.info("la race a été supprimé.");
                return actor.deleteEmbeddedDocuments("Item",specie.data._id);
            },
            defaultYes: false
        });
    }
}