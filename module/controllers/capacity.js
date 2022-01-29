import { Traversal } from "../utils/traversal.js";
import { ArrayUtils } from "../utils/array-utils.js";
import { EntitySummary } from "./entity-summary.js";

export class Capacity {
    /**
     * Callback on capacity create action
     * @param event the create event
     * @private
     */
    static create(actor, event) {
        const data = [{ name: "New Capacity", type: "capacity", data: { checked: true } }];
        return actor.createEmbeddedDocuments(data, { renderSheet: true }); // Returns one Entity, saved to the database
    }
    /**
     * 
     * @param {*} actor 
     * @param {*} capsData 
     * @returns 
     */
    static addCapsToActor(actor, capsData) {
        let items = [];
        capsData.forEach(c => { items.push(c.toObject(false)) });
        return actor.createEmbeddedDocuments("Item", items);
    }

    /**
     * 
     * @param {*} actor 
     * @param {*} capsData 
     * @returns 
     */
    static addToActor(actor, capacity) {
        capacity = capacity instanceof Array ? capacity : [capacity];
        return actor.createEmbeddedDocuments("Item", capacity);
    }

    /**
     * 
     * @param {*} item 
     * @param {*} capacityData 
     * @returns 
     */
    static addToItem(item, capacityData) {
        let data = duplicate(item.data);
        let caps = data.data.capacities;
        let capsIds = caps.map(c => c._id);
        if (capsIds && !capsIds.includes(capacityData._id)) {
            data.data.capacities.push(EntitySummary.create(capacityData));
            return item.update(data);
        }
        else ui.notifications.error(game.i18n.localize("COF.notification.CapacityAlreadyOnItem"));
    }
    /**
     * 
     * @param {*} actor 
     * @param {*} event 
     * @param {*} isUncheck 
     * @returns 
     */
    static toggleCheck(actor, capId, pathId, isUncheck) {
        // get path from owned items
        const path = duplicate(actor.items.get(pathId).data);
        const pathData = path.data;
        const capacities = pathData.capacities;
        const capsIds = capacities.map(c => c._id);
        const toggledRank = capsIds.indexOf(capId);
        if (isUncheck) {
            capacities.filter(c => capsIds.indexOf(c._id) >= toggledRank).map(cap => {
                cap.data.checked = false;
                return cap;
            });
        } else {
            capacities.filter(c => capsIds.indexOf(c._id) <= toggledRank).map(cap => {
                cap.data.checked = true;
                return cap;
            });
        }
        // modification de la voie (path)
        return actor.updateEmbeddedDocuments("Item", [path]).then(newPath => {
            newPath = newPath instanceof Array ? newPath[0].data : [newPath.data];
            // liste de toutes les capacités (capacities)
            return Traversal.mapItemsOfType("capacity").then(caps => {
                let items = actor.items.filter(i => i.type === "capacity" && i.data.data.path?._id === newPath._id);
                let itemsIds = items.map(i => i.data.flags.core.sourceId.split(".").pop());
                let itemsKeys = items.map(i => i.data.data.key);
                if (isUncheck) {
                    const unchecked = newPath.data.capacities.filter(c => !c.data.checked);
                    const uncheckedKeys = unchecked.map(c => c.data.key);
                    let inter = ArrayUtils.intersection(uncheckedKeys, itemsKeys);
                    let toRemove = items.filter(i => inter.includes(i.data.data.key)).map(i => i.id);
                    return actor.deleteEmbeddedDocuments("Item", toRemove);
                } else {
                    const checked = newPath.data.capacities.filter(c => c.data.checked);
                    const checkedIds = checked.map(c => c._id);
                    let diff = ArrayUtils.difference(checkedIds, itemsIds);
 
                    let newCap = null;
                    let toAdd = checked.filter(c => diff.includes(c._id)).map(c => {
                        newCap = caps[c._id];
                        newCap.data.rank = c.data.rank;
                        newCap.data.path = c.data.path;
                        newCap.data.checked = c.data.checked;
                        newCap.flags.core = { sourceId: c.sourceId };
                        return newCap;
                    });
                    toAdd = toAdd instanceof Array ? toAdd : [toAdd];
                    let items = [];
                    toAdd.forEach(c => { items.push(c.toObject(false)) });
                    // création de l'élément 
                    return actor.createEmbeddedDocuments("Item", items);
                }
            });
        });
    }


    /**
     * @name removeCapacitiesFromActor
     * @description Supprime les capacités de l'acteur en paramêtre
     * @public
     * 
     * @param {CofActor} actor l'acteur
     * @param {Array} capacities la liste des capacités
     * 
     * @returns l'acteur 
     */
    static removeCapacitiesFromActor(actor, capacities) {
        if (!capacities.length) capacities = [capacities];
        let items = [];
        capacities.map(capacity => { items.push(capacity.id); });
        return actor.deleteEmbeddedDocuments("Item", items);
    }
    /**
     * Supprime une capacité de la feuille de personnage et met à jour les infos d'un éventuel path
     * @param {*} actor 
     * @param {*} capacity 
     * @returns 
     */
    static removeFromActor(actor, capacity) {
        const capacityData = capacity.data;
        if (capacityData.data.path) {
            let path = actor.items.find(item => item.id === capacityData.data.path._id);
            if (path) {
                let pathData = duplicate(path.data);
                if (capacityData.flags.core.sourceId) {
                    let pcap = pathData.data.capacities.find(c => c.sourceId === capacityData.flags.core.sourceId);
                    pcap.data.checked = false;
                }
                return path.update(pathData).then(() => { return actor.deleteEmbeddedDocuments("Item", [capacity.id]); });
            }
        }
        return actor.deleteEmbeddedDocuments("Item", [capacity.id]);
    }
}