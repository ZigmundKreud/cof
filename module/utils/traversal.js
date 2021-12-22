import {Compendia} from "./compendia.js";

export class Traversal {

    static async getDocument(id, type, pack) {
        let entity = null;
        // Case 1 - Import from World entities
        if(type === "item" || type === "capacity") entity = game.items.get(id);
        else if(type === "actor") entity = game.actors.get(id);
        else if(type === "journal") entity = game.journal.get(id);
        // Case 2 - Import from a Compendium pack
        if (!entity && pack) {
            await game.packs.get(pack).getDocument(id).then(e => entity = e);
        }
        return entity;
    }

    static getIndex() {
        return Compendia.getIndex().then(index =>{
            let items = game.items.map(entity => {
                return {
                    _id : entity.data._id,
                    name : entity.data.name,
                    img : entity.data.img,
                    sourceId : "Item."+entity.data._id
                }
            });
            let actors = game.actors.map(entity => {
                return {
                    _id : entity.data._id,
                    name : entity.data.name,
                    img : entity.data.img,
                    sourceId : "Actor."+entity.data._id
                }
            });
            let journal = game.journal.map(entity => {
                return {
                    _id : entity.data._id,
                    name : entity.data.name,
                    img : entity.data.img,
                    sourceId : "JournalEntry."+entity.data._id
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

    static getEntitiesOfType(types) {
        return Compendia.getContent(types).then(content =>{
            return game.items.filter(item => types.includes(item.type)).concat(game.actors.filter(item => types.includes(item.type))).concat(game.journal.filter(item => types.includes(item.type))).concat(Object.values(content));
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
            if(entry){
                if(entry.sourceId){
                    const elts = entry.sourceId.split(".");
                    if(elts[0] === "Item") return game.items.get(id);
                    else if(elts[0] === "Actor") return game.actors.get(id);
                    else if(elts[0] === "JournalEntry") return game.journal.get(id);
                    else if(elts[0] === "Compendium") {
                        const packName = elts[1] + "." + elts[2];
                        return game.packs.get(packName).getDocument(id).then(entity => entity);
                    }
                }
            }
        });
    }

    static findBySource(id, source) {
        if(id && source) {
            if(source === "game.items") return game.items.get(id);
            if(source === "game.actors") return game.actors.get(id);
            if(source === "game.journal") return game.journal.get(id);
            else return game.packs.get(source).getDocument(id).then(entity => entity);
        }
    }
}