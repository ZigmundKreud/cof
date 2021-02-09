import {Traversal} from "../utils/traversal.js";
import {ArrayUtils} from "../utils/array-utils.js";
import {EntitySummary} from "./entity-summary.js";

export class Capacity {
    /**
     * Callback on capacity create action
     * @param event the create event
     * @private
     */
    static create(actor, event) {
        const data = {name: "New Capacity", type: "capacity", data: {checked: true}};
        return actor.createOwnedItem(data, {renderSheet: true}); // Returns one Entity, saved to the database
    }

    static addCapsToActor(actor, capsData){
        return actor.createEmbeddedEntity("OwnedItem", capsData);
    }

    static addToItem(entity, capacityData){
        let data = duplicate(entity.data);
        let caps = data.data.capacities;
        let capsIds = caps.map(c => c._id);
        if(capsIds && !capsIds.includes(capacityData._id)){
            data.data.capacities.push(EntitySummary.create(capacityData));
            return entity.update(data);
        }
        else ui.notifications.error("Cet objet contient déjà cette capacité.")
    }

    static toggleCheck(actor, event, isUncheck) {
        const elt = $(event.currentTarget).parents(".capacity");
        // get id of clicked capacity
        const capId = elt.data("itemId");
        // get id of parent path
        const pathId = elt.data("pathId");
        // get path from owned items
        const path = duplicate(actor.getOwnedItem(pathId).data);
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
        return actor.updateOwnedItem(path).then(newPath => {
            return Traversal.mapItemsOfType("capacity").then(caps => {
                let items = actor.items.filter(i => i.type === "capacity" && i.data.data.path?._id === newPath._id);
                let itemsIds = items.map(i => i.data.flags.core.sourceId.split(".").pop());
                let itemsKeys = items.map(i => i.data.data.key);
                if (isUncheck) {
                    const unchecked = newPath.data.capacities.filter(c => !c.data.checked);
                    const uncheckedKeys = unchecked.map(c => c.data.key);
                    let inter = ArrayUtils.intersection(uncheckedKeys, itemsKeys);
                    let toRemove = items.filter(i => inter.includes(i.data.data.key)).map(i => i._id);
                    // console.log("To Remove", toRemove);
                    return actor.deleteOwnedItem(toRemove);
                } else {
                    const checked = newPath.data.capacities.filter(c => c.data.checked);
                    const checkedIds = checked.map(c => c._id);
                    let diff = ArrayUtils.difference(checkedIds, itemsIds);
                    let toAdd = checked.filter(c => diff.includes(c._id)).map(c => {
                        let newCap = caps[c._id];
                        newCap.data.rank = c.data.rank;
                        newCap.data.path = c.data.path;
                        newCap.data.checked = c.data.checked;
                        newCap.flags.core = {sourceId: c.sourceId};
                        return newCap;
                    });
                    // console.log("To Add", toAdd);
                    return actor.createOwnedItem(toAdd);
                }
            });
        });
    }

    // Supprime une capacité de la feuille de personnage
    // et met à jour les infos d'un éventuel path
    static removeFromActor(actor, capacity) {
        const capacityData = capacity.data;
        if(capacityData.data.path){
            let path = actor.items.find(item => item._id === capacityData.data.path._id);
            if(path){
                let pathData = duplicate(path.data);
                if(capacityData.flags.core.sourceId){
                    let pcap = pathData.data.capacities.find(c => c.sourceId === capacityData.flags.core.sourceId);
                    pcap.data.checked = false;
                }
                return path.update(pathData).then(newPath => {
                    return actor.deleteOwnedItem(capacity._id);
                });
            }
        }
        return actor.deleteOwnedItem(capacity._id);
    }
}