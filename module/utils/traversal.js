export class Traversal {

    /* PACKS */
    static getPack(key){
        return game.packs.get(key);
    }

    static getPackIndex(key){
        return this.getPack(key).getIndex(); // async
        // We can find a specific entry in the compendium by its name
        // let entry = pack.index.find(e => e.name === "Acid Splash");
    }

    static async getEntityFromPack(packId, entityId){
        const pack = game.packs.get(packId);
        return await pack.getEntity(entityId);
    }

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

    /* -------------------------------------------- */

    /*
     * ENTITIES
     */
    static getAllEntitiesOfType(type, collection) {
        const compendium = game.packs.get(collection).getContent();
        const ingame = game.items.filter(item => item.type === type);
        return ingame.concat(compendium);
    }

    static findCapacityEntityByKey (key) {
        return this.getAllEntitiesOfType().find(entity => entity.data.key === key);
    }

    static findPathEntityByKey (key) {
        return this.getAllEntitiesOfType().find(entity => entity.data.key === key);
    }

    static findProfileEntityByKey (key) {
        return this.getAllEntitiesOfType().find(entity => entity.data.key === key);
    }

    static findSpeciesEntityByKey (key) {
        return this.getAllEntitiesOfType().find(entity => entity.data.key === key);
    }

    /*
     * DATA
     */

    static getInGameEntitiesDataOfType (type) {
        return game.items.filter(item => item.type === type).map(entity => entity.data);
    }

    static getAllCapacitiesData () {
        const compendium = COF.capacities;
        const ingame = this.getInGameEntitiesDataOfType("capacity");
        return ingame.concat(compendium);
    }

    static getAllPathsData () {
        const compendium = COF.paths;
        const ingame = this.getInGameEntitiesDataOfType("path");
        return ingame.concat(compendium);
    }

    static getAllProfilesData () {
        const compendium = COF.profiles;
        const ingame = this.getInGameEntitiesDataOfType("profile");
        return ingame.concat(compendium);
    }

    static getAllSpeciesData () {
        const compendium = COF.species;
        const ingame = this.getInGameEntitiesDataOfType("species");
        return ingame.concat(compendium);
    }

    static findCapacityDataByKey (key) {
        return this.getAllCapacitiesData().find(entity => entity.data.key === key);
    }

    static findPathDataByKey (key) {
        return this.getAllPathsData().find(entity => entity.data.key === key);
    }

    static findProfileDataByKey (key) {
        return this.getAllProfilesData().find(entity => entity.data.key === key);
    }

    static findSpeciesDataByKey (key) {
        return this.getAllSpeciesData().find(entity => entity.data.key === key);
    }



    static findCapacityDataById (id) {
        return this.getAllCapacitiesData().find(entity => entity._id === id);
    }

    static findPathDataById (id) {
        return this.getAllPathsData().find(entity => entity._id === id);
    }

    static findProfileDataById (id) {
        return this.getAllProfilesData().find(entity => entity._id === id);
    }

    static findSpeciesDataById (id) {
        return this.getAllSpeciesData().find(entity => entity._id === id);
    }


    static getItemsOfType(type) {
        let compendium = [];
        let ingame = [];
        switch(type){
            case "path" :
                compendium = COF.paths;
                ingame = game.items.filter(item => item.type === "path").map(entity => entity.data);
                break;
            case "capacity" :
                compendium = COF.capacities;
                ingame = game.items.filter(item => item.type === "capacity").map(entity => entity.data);
                break;
        }
        return ingame.concat(compendium);
    }
}