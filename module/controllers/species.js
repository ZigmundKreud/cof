import { Traversal } from "../utils/traversal.js";
import { Path } from "./path.js";
import { Capacity } from "./capacity.js";

export class Species {
    /**
     * 
     * @param {CofActor} actor 
     * @param {Array<CofItem>} itemData 
     * @returns 
     */
    static addToActor(actor, itemData) {
        if (actor.items.filter(item => item.type === "species").length > 0) {
            ui.notifications.error("Vous avez déjà une race.");
            return false;
        } else {
            // ajoute la race (species) dans Items
            let items = [];
            itemData = itemData instanceof Array ? itemData : [itemData];
            itemData.forEach(s => { items.push(s.toObject(false)) });
            return actor.createEmbeddedDocuments("Item", items).then(newSpecies => {
                let newSpeciesData = newSpecies[0].data;
                return Traversal.mapItemsOfType(["path", "capacity"]).then(entities => {
                    newSpeciesData.data.capacities = newSpeciesData.data.capacities.map(cap => {
                        let capData = entities[cap._id];
                        capData.flags.core = { sourceId: cap.sourceId };
                        capData.data.species = {
                            _id: newSpeciesData._id,
                            name: newSpeciesData.name,
                            img: newSpeciesData.img,
                            key: newSpeciesData.data.key,
                            sourceId: newSpeciesData.flags.core.sourceId,
                        };
                        return capData;
                    });
                    let capacities = newSpeciesData.data.capacities
                    newSpeciesData.data.paths = newSpeciesData.data.paths.map(p => {
                        let pathData = entities[p._id];
                        pathData.flags.core = { sourceId: p.sourceId };
                        pathData.data.species = {
                            _id: newSpeciesData._id,
                            name: newSpeciesData.name,
                            img: newSpeciesData.img,
                            key: newSpeciesData.data.key,
                            sourceId: newSpeciesData.flags.core.sourceId,
                        };
                        return pathData;
                    });
                    const paths = newSpeciesData.data.paths;
                    Capacity.addCapsToActor(actor, capacities).then(() => {return Path.addPathsToActor(actor, paths);});
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
        const paths = actor.items.filter(item => item.type === "path" && item.data.data.species?._id === specie.id);
        const capacities = actor.items.filter(item => item.type === "capacity" && item.data.data.species?._id === specie.id);
        return Dialog.confirm({
            title: game.i18n.format("COF.dialog.deleteSpecie.title"),
            content: game.i18n.format('COF.dialog.deleteSpecie.confirm', {name:actor.name}),
            yes: () => {
                if (paths.length > 0 && capacities.length > 0) {
                    Path.removePathsFromActor(actor, paths).then(() => {
                        ui.notifications.info(paths.length > 1 ?  game.i18n.format("COF.dialog.deletePath.confirmSeveralPaths", {nb: paths.length}) : game.i18n.localize("COF.dialog.deletePath.confirmOnePath"));
                        Capacity.removeCapacitiesFromActor(actor, capacities).then(() => {
                            ui.notifications.info(capacities.length > 1 ? game.i18n.format("COF.dialog.deleteSpecie.confirmSeveralCapacities", {nb: capacities.length}) : game.i18n.localize("COF.dialog.deleteSpecie.confirmOneCapacity"));                            
                        });
                    });                        
                } else {
                    if (paths.length > 0 ) {
                        Path.removePathsFromActor(actor, paths).then(() => {
                            ui.notifications.info(paths.length > 1 ?  game.i18n.format("COF.dialog.deletePath.confirmSeveralPaths", {nb: paths.length}) : game.i18n.localize("COF.dialog.deletePath.confirmOnePath"));
                        });                            
                    } else if (capacities.length > 0 ) {
                        Capacity.removeCapacitiesFromActor(actor, capacities).then(() => {
                            ui.notifications.info(capacities.length > 1 ? game.i18n.format("COF.dialog.deleteSpecie.confirmSeveralCapacities", {nb: capacities.length}) : game.i18n.localize("COF.dialog.deleteSpecie.confirmOneCapacity"));                            
                        });
                    }
                }
                ui.notifications.info(game.i18n.localize("COF.dialog.deleteSpecie.confirmDelete"));
                return actor.deleteEmbeddedDocuments("Item", [specie.id]);
            },
            defaultYes: false
        });
    }
}