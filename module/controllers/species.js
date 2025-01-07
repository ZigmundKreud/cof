import { Path } from "./path.js";
import { Capacity } from "./capacity.js";

export class Species {
  /**
   *
   * @param {CofActor} actor
   * @param {object[]|object} itemData The item data requested for creation
   * @returns
   */
  static async addToActor(actor, itemsData) {
    if (actor.items.filter((item) => item.type === "species").length > 0) {
      ui.notifications.error("Vous avez déjà une race.");
      return false;
    } else {
      itemsData = itemsData instanceof Array ? itemsData : [itemsData];

      // Ajout de la race dans les Items
      let newRace = await actor.createEmbeddedDocuments("Item", itemsData);

      // Ajout des capacités dans les Items
      let capacities = [];
      for (const capacity of newRace[0].system.capacities) {
        let capacityData = await fromUuid(capacity.sourceId);
        capacityData = capacityData.toObject();
        capacityData.system.species = {
          _id: newRace[0]._id,
          name: newRace[0].name,
          img: newRace[0].img,
          key: newRace[0].system.key,
          sourceId: newRace[0]._stats.compendiumSource,
        };
        capacities.push(capacityData);
      }
      let updates = { _id: newRace[0]._id, "system.capacities": capacities };
      await actor.updateEmbeddedDocuments("Item", [updates]);

      Capacity.addCapacitiesToActor(actor, capacities);

      // Ajouts des voies dans les Items
      let paths = [];
      for (const path of newRace[0].system.paths) {
        let pathData = await fromUuid(path.sourceId);
        pathData.flags.core = { sourceId: path.sourceId };
        pathData.system.species = {
          _id: newRace[0]._id,
          name: newRace[0].name,
          img: newRace[0].img,
          key: newRace[0].system.key,
          sourceId: newRace[0]._stats.compendiumSource,
        };
        paths.push(pathData);
      }

      updates = { _id: newRace[0]._id, "system.paths": paths };
      await actor.updateEmbeddedDocuments("Item", [updates]);

      // add path
      return Path.addPathsToActor(actor, paths);
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
    const paths = actor.items.filter((item) => item.type === "path" && item.system.species?._id === specie.id);
    const capacities = actor.items.filter((item) => item.type === "capacity" && item.system.species?._id === specie.id);
    return Dialog.confirm({
      title: game.i18n.format("COF.dialog.deleteSpecie.title"),
      content: game.i18n.format("COF.dialog.deleteSpecie.confirm", { name: actor.name }),
      yes: () => {
        if (paths.length > 0 && capacities.length > 0) {
          Path.removePathsFromActor(actor, paths).then(() => {
            ui.notifications.info(
              paths.length > 1 ? game.i18n.format("COF.dialog.deletePath.confirmSeveralPaths", { nb: paths.length }) : game.i18n.localize("COF.dialog.deletePath.confirmOnePath")
            );
            Capacity.removeCapacitiesFromActor(actor, capacities).then(() => {
              ui.notifications.info(
                capacities.length > 1
                  ? game.i18n.format("COF.dialog.deleteSpecie.confirmSeveralCapacities", { nb: capacities.length })
                  : game.i18n.localize("COF.dialog.deleteSpecie.confirmOneCapacity")
              );
            });
          });
        } else {
          if (paths.length > 0) {
            Path.removePathsFromActor(actor, paths).then(() => {
              ui.notifications.info(
                paths.length > 1 ? game.i18n.format("COF.dialog.deletePath.confirmSeveralPaths", { nb: paths.length }) : game.i18n.localize("COF.dialog.deletePath.confirmOnePath")
              );
            });
          } else if (capacities.length > 0) {
            Capacity.removeCapacitiesFromActor(actor, capacities).then(() => {
              ui.notifications.info(
                capacities.length > 1
                  ? game.i18n.format("COF.dialog.deleteSpecie.confirmSeveralCapacities", { nb: capacities.length })
                  : game.i18n.localize("COF.dialog.deleteSpecie.confirmOneCapacity")
              );
            });
          }
        }
        ui.notifications.info(game.i18n.localize("COF.dialog.deleteSpecie.confirmDelete"));
        return actor.deleteEmbeddedDocuments("Item", [specie.id]);
      },
      defaultYes: false,
    });
  }
}
