export class DataLoader {

    /**
     * Loads JSON data from a filepath
     * @param filepath
     * @returns {Promise<any>}
     */
    static async loadJson(filepath) {
        // Load an external JSON data file which contains data for import
        const response = await fetch(filepath);
        return await response.json();
    }

    /**
     * Get a pack from a packName
     * @param filepath
     * @returns {Promise<any>}
     */
    static findPack(packName) {
        // Reference a Compendium pack by it's collection ID
        return game.packs.find(p => p.collection === `${System.name}.${packName}`);
    }

    /**
     * Clears data from a given pack
     * @param pack
     * @returns {Promise<boolean>}
     */
    static async clearPack(pack) {
        const packItems = await pack.getContent();
        try {
            // Delete all current compendium entries
            for (let item of packItems) {
                await pack.deleteEntity(item.id);
            }
        }
        catch (ex) {
            return false;
        }
        return true;
    }

    /**
     * Loads data from a JSON file into pack.
     * JSON file should be located inside the System.dataPath folder and its name should the same as the pack name.
     * @param packName
     * @returns {Promise<void>}
     */
    static async loadData(packName) {
        console.info(`Importing ${packName}...`);
        // Find pack from his pack name
        let pack = this.findPack(packName);

        // Get entity type to populate the proper collection
        const entity = pack.metadata.entity;

        // Unlock the pack
        pack.locked = false;

        // Clear the current pack
        await this.clearPack(pack);

        // Load data from JSON files
        const filepath = `${System.dataPath}/${packName}.json`;
        const content = await this.loadJson(filepath);
        /* Import databases to compendiums */
        switch(entity){
            case "Item" : {
                // Create temporary items from JSON
                let newItems = await Item.create(content);
                // Make sure items are iteratable
                newItems = newItems instanceof Array ? newItems : [newItems];
                for (let item of newItems) {
                    // Import into compendium
                    await pack.importEntity(item);
                }
                pack.locked = true;
                break;
            }
            case "Actor" : {
                // Create temporary items from JSON
                let newActors = await Actor.create(content);
                // Make sure items are iteratable
                newActors = newActors instanceof Array ? newActors : [newActors];
                for (let actor of newActors) {
                    // Import into compendium
                    await pack.importEntity(actor);
                }
                pack.locked = true;
                break;
            }
        }
        console.info(`${packName} imported.`);
    }
}