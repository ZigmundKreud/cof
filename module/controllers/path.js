import { EntitySummary } from "./entity-summary.js";
import { CofItem } from "../items/item.js";

export class Path {
  /**
   *
   * @param {*} actor
   * @param {*} pathsData
   * @returns
   */
  static addPathsToActor(actor, pathsData) {
    let items = [];
    pathsData = pathsData instanceof Array ? pathsData : [pathsData];
    // pathsData.forEach(p => { items.push(p.toObject(false)) });
    pathsData.forEach(p => { 
        let path = p instanceof CofItem ? p.toObject() : p;
        if (p.system.profile != null) {
          const profile = p.system.profile;        
          path.system.profile = profile;
        }
        if (p.system.species != null) {
          const species = p.system.species;        
          path.system.species = species;
        }        
        items.push(path);
    });
    return actor.createEmbeddedDocuments("Item", items).then(newPaths => {
        // on ajoute toutes les metadonnees aux voies nouvellement creees pour faciliter la gestions des capacites qui en dependent
        let updatedPaths = newPaths.map(newPath => {
            const index = newPaths.indexOf(newPath);
            let updatedPath = foundry.utils.duplicate(newPath);
            updatedPath.system.capacities = updatedPath.system.capacities.map(cap => {
                // Ajout de données utilisées pour la gestion des voies/capa
                cap.data = {
                    key: cap.name.slugify({ strict: true }),
                    rank: updatedPath.system.capacities.indexOf(cap) + 1,
                    sourceId: cap.sourceId,
                    checked: false,
                    path: {
                        _id: updatedPath._id,
                        name: updatedPath.name,
                        img: updatedPath.img,
                        key: updatedPath.system.key,
                        sourceId: pathsData[index]._stats.compendiumSource,
                    }
                };
                return cap;
            });
            return updatedPath;
        });
        updatedPaths = updatedPaths instanceof Array ? updatedPaths : [updatedPaths];
        return actor.updateEmbeddedDocuments("Item", updatedPaths);
    });
  }

  /**
   *
   * @param {*} actor
   * @param {*} pathData
   * @returns
   */
  static addToActor(actor, pathData) {
    if (actor.items.filter((item) => item.type === "path" && item.name === pathData.name).length > 0) {
      ui.notifications.error(game.i18n.localize("COF.notification.PathAlreadyOwned"));
      return false;
    } else {
      return this.addPathsToActor(actor, pathData);
    }
  }

  /**
   *
   * @param {*} entity
   * @param {*} pathData
   * @returns
   */
  static addToItem(entity, pathData) {
    let paths = entity.system.paths;
    let pathsIds = paths.map((p) => p._id);
    if (pathsIds && !pathsIds.includes(pathData._id)) {
      paths.push(EntitySummary.create(pathData));
      return entity.update({ "system.paths": paths });
    } else ui.notifications.error(game.i18n.localize("COF.notification.PathAlreadyOnItem"));
  }

  /**
   *
   * @param {*} actor
   * @param {*} path
   */
  static removeFromActor(actor, path) {
    Dialog.confirm({
      title: game.i18n.format("COF.dialog.deletePath.title"),
      content: game.i18n.format("COF.dialog.deletePath.confirm", { name: actor.name }),
      yes: () => {
        let items = actor.items.filter((item) => item.type === "capacity" && item.system.path._id === path._id).map((c) => c._id);
        items.push(path.id);
        return actor.deleteEmbeddedDocuments("Item", items);
      },
      defaultYes: true,
    });
  }

  /**
   *
   * @param {*} actor
   * @param {*} paths
   * @returns
   */
  static removePathsFromActor(actor, paths) {
    let items = [];
    paths = paths instanceof Array ? paths : [paths];
    paths.map((path) => {
      let caps = actor.items.filter((item) => item.type === "capacity" && item.system.path._id === path._id);
      caps.map((c) => items.push(c.id));
      items.push(path.id);
    });
    return actor.deleteEmbeddedDocuments("Item", items);
  }
}
