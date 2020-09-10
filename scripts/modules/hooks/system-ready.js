/**
 * Ready hook loads tables, and override's foundry's entity link functions to provide extension to pseudo entities
 */

import {Logger} from "../logger.js";
import {DataLoader} from "../data.js";

Hooks.once("ready", async () => {

    if (game.settings.get("cof", "importData")) {
        Logger.info("Importing data");
        DataLoader.loadData("capacities");
        DataLoader.loadData("items");
        DataLoader.loadData("paths");
        DataLoader.loadData("profiles");
        DataLoader.loadData("species");
        DataLoader.loadData("spells");
    }

    await COF.getProfiles();
    await COF.getSpecies();
    await COF.getPaths();
    await COF.getCapacities();


    Logger.info("System Initialized.");

});
