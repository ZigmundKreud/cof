import {Traversal} from "../utils/traversal.js";
import {Path} from "./path.js";
import {Capacity} from "./capacity.js";

export class Species {

    static addToActor(actor, itemData) {
        if (actor.items.filter(item => item.type === "species").length > 0) {
            ui.notifications.error("Vous avez déjà une race.");
            return false;
        } else {
            // add species
            return actor.createOwnedItem(itemData).then(newSpecies => {
                return Traversal.mapItemsOfType(["path", "capacity"]).then(entities => {
                    newSpecies.data.capacities = newSpecies.data.capacities.map(cap => {
                        let capData = entities[cap._id];
                        capData.flags.core = {sourceId: cap.sourceId};
                        capData.data.species = {
                            _id: newSpecies._id,
                            name: newSpecies.name,
                            img: newSpecies.img,
                            key: newSpecies.data.key,
                            sourceId: newSpecies.flags.core.sourceId,
                        };
                        return capData;
                    });
                    newSpecies.data.paths = newSpecies.data.paths.map(p => {
                        let pathData = entities[p._id];
                        pathData.flags.core = {sourceId: p.sourceId};
                        pathData.data.species = {
                            _id: newSpecies._id,
                            name: newSpecies.name,
                            img: newSpecies.img,
                            key: newSpecies.data.key,
                            sourceId: newSpecies.flags.core.sourceId,
                        };
                        return pathData;
                    });
                    // add caps from species
                    return Capacity.addCapsToActor(actor, newSpecies.data.capacities).then(newCaps => {
                        newSpecies.data.capacities = newCaps;
                        // add paths from species
                        return Path.addPathsToActor(actor, newSpecies.data.paths).then(newPaths => {
                            newSpecies.data.paths = newPaths;
                            // update profile with new ids
                            return actor.updateOwnedItem(newSpecies);
                        });
                    });
                });
            });
        }
    }

    static removeFromActor(actor, entity) {
        const speciesData = entity.data;
        return Dialog.confirm({
            title: "Supprimer la race ?",
            content: `<p>Etes-vous sûr de vouloir supprimer la race de ${actor.name} ?</p>`,
            yes: () => {
                return Path.removePathsFromActor(actor, speciesData.data.paths).then(result => {
                    let items = (speciesData.data.capacities && speciesData.data.capacities.length) ? speciesData.data.capacities.map(c => c._id) : [];
                    items.push(speciesData._id);
                    ui.notifications.info(parseInt(result.length + items.flat().length) + " éléments ont été supprimés.");
                    return actor.deleteOwnedItem(items);
                });
            },
            defaultYes: false
        });
    }
}