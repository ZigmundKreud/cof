import {EntitySummary} from "./entity-summary.js";

export class Path {

    static addPathsToActor(actor, pathsData) {
        return actor.createEmbeddedEntity("OwnedItem", pathsData).then(newPaths => {
            // dans le cas où newPaths n'est pas un tableau et ne dispose pas de la methode "map"
            if(!newPaths.length) newPaths = [newPaths];
            if(newPaths.flat().length > 0){
                // on ajoute toutes les metadonnees aux voies nouvellement creees pour
                // faciliter la gestions des capacites qui en dependent
                let updatedPaths = newPaths.map( newPath => {
                    let updatedPath = duplicate(newPath);
                    updatedPath.data.capacities = updatedPath.data.capacities.map(cap => {
                        // Ajout de données utilisées pour la gestion des voies/capa
                        cap.data = {
                            key : cap.name.slugify({strict:true}),
                            rank : updatedPath.data.capacities.indexOf(cap) + 1,
                            checked : false,
                            path : {
                                _id : updatedPath._id,
                                name : updatedPath.name,
                                img : updatedPath.img,
                                key : updatedPath.data.key,
                                sourceId : updatedPath.flags.core.sourceId,
                            }
                        };
                        return cap;
                    });
                    return updatedPath;
                });
                return actor.updateOwnedItem(updatedPaths);
            }
        });
    }

    static addToActor(actor, pathData) {
        if (actor.items.filter(item => item.type === "path" && item.data.name === pathData.name).length > 0) {
            ui.notifications.error("Vous possédez déjà cette voie.");
            return false;
        }
        else return this.addPathsToActor(actor, [pathData]);
    }

    static addToItem(entity, pathData) {
        let data = duplicate(entity.data);
        let paths = data.data.paths;
        let pathsIds = paths.map(p => p._id);
        if(pathsIds && !pathsIds.includes(pathData._id)){
            data.data.paths.push(EntitySummary.create(pathData));
            return entity.update(data);
        }
        else ui.notifications.error("Cet objet contient déjà cette voie.")
    }

    static removeFromActor(actor, path) {
        Dialog.confirm({
            title: game.i18n.format("COF.dialog.deleteProfile.title"),
            content: `<p>Etes-vous sûr de vouloir supprimer la voie ${path.name} ?</p>`,
            yes: () => {
                const pathData = path.data;
                let items = actor.items.filter(item => item.data.type === "capacity" && item.data.data.path._id === pathData._id).map(c => c.data._id);
                items.push(path._id);
                return actor.deleteOwnedItem(items);
            },
            defaultYes: true
        });
    }

    static removePathsFromActor(actor, paths) {
        if(!paths.length) paths = [paths];
        let items = [];
        paths.map(path => {
            const caps = actor.items.filter(item => {
                if(item.data.type === "capacity") {
                    if (item.data.data.path._id === path._id) return true;
                }
            });
            const ids = caps.map(c => c.data._id);
            items.push(ids);
            items.push(path._id);
        });
        return actor.deleteOwnedItem(items.flat());
    }
}