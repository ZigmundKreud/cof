import { ArrayUtils } from "../utils/array-utils.js";
import { EntitySummary } from "./entity-summary.js";

export class Capacity {

    /**
     * 
     * @param {*} actor 
     * @param {*} capsData 
     * @returns 
     */
    static addCapacitiesToActor(actor, capsData) {
        //let items = [];
        //capsData.forEach(c => { items.push(c.) });
        return actor.createEmbeddedDocuments("Item", capsData);
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
     * @param {*} capacity 
     * @returns 
     */
    static addToItem(item, capacity) {
       let capacities = item.system.capacities;
       let capsIds = capacities.map(c => c._id);
       if (capsIds && !capsIds.includes(capacity._id)) {
            capacities.push(EntitySummary.create(capacity));
            return item.update({'system.capacities': capacities});
        }
        else ui.notifications.error(game.i18n.localize("COF.notification.CapacityAlreadyOnItem"));
    }

    /**
     * 
     * @param {*} actor 
     * @param {*} capId Id de la capacité sur laquelle a eu lieu le clic
     * @param {*} pathId
     * @param {*} isUncheck True si l'action a été de décocher la capacité
     * 
     */
    static async toggleCheck(actor, capId, pathId, isUncheck) {

        // Mise à jour de la voie : mise à jour des capacités apprises ou non
        let capacities = actor.items.get(pathId).system.capacities;
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
        const updates = {"_id": pathId, "system.capacities": capacities};
        await actor.updateEmbeddedDocuments("Item", [updates]);

        // Mise à jour des capacités apprises en se basant sur le champ key
        let items = actor.items.filter(i => i.type === "capacity" && i.system.path?._id === pathId);
        let itemsIds = items.map(i => i.flags.core.sourceId.split(".").pop());
        
        if (isUncheck) {
            const uncheckedKeys = capacities.filter(c => !c.data.checked).map(c => c.data.key);
            const itemsKeys = items.map(i => i.system.key);
            // Liste des capacités déjà cochées
            let inter = ArrayUtils.intersection(uncheckedKeys, itemsKeys);
            let toRemove = items.filter(i => inter.includes(i.system.key)).map(i => i.id);
            return actor.deleteEmbeddedDocuments("Item", toRemove);
        }
        else {
            const checked = capacities.filter(c => c.data.checked);
            const checkedIds = checked.map(c => c.sourceId.split('.').pop());
            
            // Différence entre les capacités déjà cochées et les capacités cochées
            let diff = ArrayUtils.difference(checkedIds, itemsIds);
            let checkedFiltered = checked.filter(c => diff.includes(c.sourceId.split('.').pop()));

            let toAdd = [];
            for (const c of checkedFiltered) {
                const newCap = await fromUuid(c.sourceId);
                const newCapObject = newCap.toObject();
                newCapObject.system.rank = c.data.rank;
                newCapObject.system.path = c.data.path;
                newCapObject.system.checked = c.data.checked;
                newCapObject.flags.core = { sourceId: c.sourceId };
                toAdd.push(newCapObject);
            }

            toAdd = toAdd instanceof Array ? toAdd : [toAdd];

            return actor.createEmbeddedDocuments("Item", toAdd);
        }
      }
    
    /**
     * @name removeCapacitiesFromActor
     * @description Supprime les capacités de l'acteur en paramêtre
     * @public
     * 
     * @param {CofActor} actor
     * @param {Array} capacities la liste des capacités à supprimer
     * 
     * @returns l'acteur 
     */
    static removeCapacitiesFromActor(actor, capacities) {
        capacities = capacities instanceof Array ? capacities : [capacities];
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
        // Capacité issue d'une voie
        if (capacity.system.path) {
            let path = actor.items.find(item => item.id === capacity.system.path._id);
            if (path) {
                let capacities = path.system.capacities;
                if (capacity.flags.core.sourceId) {
                    let pcap = capacities.find(c => c.sourceId === capacity.flags.core.sourceId);
                    pcap.data.checked = false;
                }
                return path.update({'system.capacities': capacities}).then(() => { return actor.deleteEmbeddedDocuments("Item", [capacity.id]); });
            }
        }
        // Capacité hors voie
        return actor.deleteEmbeddedDocuments("Item", [capacity.id]);
    }
}