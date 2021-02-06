import {Compendia} from "./compendia.js";

export class Traversal {

    static async getEntity(id, type, pack) {
        let entity = null;
        // Case 1 - Import from World entities
        if(type === "item") entity = game.items.get(id);
        else if(type === "actor") entity = game.actors.get(id);
        else if(type === "journal") entity = game.journal.get(id);
        // Case 2 - Import from a Compendium pack
        if (!entity && pack) {
            await game.packs.get(pack).getEntity(id).then(e => entity = e);
        }
        return entity;
    }

    // static async getEntity(id, type, pack) {
    //     let entity = null;
    //     // Target 1 - Compendium Link
    //     if ( pack ) {
    //         const pack = game.packs.get(pack);
    //         await pack.getIndex();
    //         entity = id ? await pack.getEntity(id) : null;
    //     }
    //     // Target 2 - World Entity Link
    //     else {
    //         if(type==="item") entity = game.items.get(id);
    //         else if(type==="journal") entity = game.journal.get(id);
    //         else if(type==="actor") entity = game.actors.get(id);
    //     }
    //     // if ( !entity ) return;
    //     // // Action 1 - Execute an Action
    //     // if ( entity.entity === "Macro" ) {
    //     //     if ( !entity.hasPerm(game.user, "LIMITED") ) {
    //     //         return ui.notifications.warn(`You do not have permission to use this ${entity.entity}.`);
    //     //     }
    //     //     return entity.execute();
    //     // }
    //     //
    //     // // Action 2 - Render the Entity sheet
    //     // return entity.sheet.render(true);
    //     return entity;
    // }

    static getAllEntitiesOfType(type, pack) {
        const compendium = game.packs.get(pack).getContent();
        const ingame = game.items.filter(item => item.type === type);
        return ingame.concat(compendium);
    }

    static getIndex() {
        return Compendia.getIndex().then(index =>{
            let items = game.items.map(entity => {
                return {
                    _id : entity.data._id,
                    name : entity.data.name,
                    img : entity.data.img,
                    source : "game.items"
                }
            });
            let actors = game.actors.map(entity => {
                return {
                    _id : entity.data._id,
                    name : entity.data.name,
                    img : entity.data.img,
                    source : "game.actors"
                }
            });
            let journal = game.journal.map(entity => {
                return {
                    _id : entity.data._id,
                    name : entity.data.name,
                    img : entity.data.img,
                    source : "game.journal"
                }
            });
            return items.concat(actors).concat(journal).concat(Object.values(index)).reduce(function (map, obj) {
                map[obj._id] = obj;
                return map;
            }, {});
        });
    }

    static mapItemsOfType(types) {
        return Compendia.getContent(types).then(content =>{
            return game.items.filter(item => types.includes(item.type)).map(entity => entity.data).concat(Object.values(content).map(entity => entity.data)).reduce(function (map, obj) {
                map[obj._id] = obj;
                return map;
            }, {});
        });
    }

    static getItemsOfType(types) {
        return Compendia.getContent(types).then(content =>{
            return game.items.filter(item => types.includes(item.type)).map(entity => entity.data).concat(Object.values(content).map(entity => entity.data));
        });
    }

    static find(id) {
        return this.getIndex().then(idx => {
            const entry = idx[id];
            if(entry && entry.source) {
                if(entry.source === "game.items") return game.items.get(id);
                if(entry.source === "game.actors") return game.actors.get(id);
                if(entry.source === "game.journal") return game.journal.get(id);
                else return game.packs.get(entry.source).getEntity(id).then(entity => entity);
            }
        });
    }

    static find(id, source) {
        if(id && source) {
            if(source === "game.items") return game.items.get(id);
            if(source === "game.actors") return game.actors.get(id);
            if(source === "game.journal") return game.journal.get(id);
            else return game.packs.get(source).getEntity(id).then(entity => entity);
        }
    }
}