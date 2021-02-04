import {Traversal} from "../utils/traversal.js";

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

    static toggleCheck(actor, event, isUncheck) {
        const elt = $(event.currentTarget).parents(".capacity");
        const data = duplicate(actor.data);
        // get id of clicked capacity
        const capId = elt.data("itemId");
        // get id of parent path
        const pathId = elt.data("pathId");
        // get path from owned items
        const path = actor.getOwnedItem(pathId).data;
        Traversal.mapItemsOfType(["capacity"]).then(caps => {
            // retrieve path capacities from world/compendiums
            let capacities = path.data.capacities.map(id => {
                let cap = caps[id];
                cap.data.rank = path.data.capacities.indexOf(id) +1;
                cap.data.path = path;
                cap.flags.cof = {sourceId : id};
                return cap;
            });
            const capacitiesKeys = capacities.map(c=>c.data.key);

            // retrieve path's capacities already present in owned items
            const items = data.items.filter(i => i.type === "capacity" && capacitiesKeys.includes(i.data.key));
            const itemKeys = items.map(i => i.data.key);

            if(isUncheck){
                const caps = capacities.filter(c => path.data.capacities.indexOf(c._id) >= path.data.capacities.indexOf(capId));
                const capsKeys = caps.map(c => c.data.key);
                // const caps = capacities.filter(c => c.data.rank >= capacity.data.rank);
                // REMOVE SELECTED CAPS
                const toRemove = items.filter(i => capsKeys.includes(i.data.key)).map(i => i._id);
                return actor.deleteOwnedItem(toRemove);
            }
            else {
                const caps = capacities.filter(c => path.data.capacities.indexOf(c._id) <= path.data.capacities.indexOf(capId));
                // const caps = capacities.filter(c => c.data.rank <= capacity.data.rank);
                const toAdd = caps.filter(c => !itemKeys.includes(c.data.key));
                return actor.createOwnedItem(toAdd);
            }
        });
    }
}