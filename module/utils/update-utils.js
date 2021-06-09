import {Traversal} from "./traversal.js";
import {Compendia} from "./compendia.js";

import { COF } from "../system/config.js";
export class UpdateUtils {

    static updatePacks() {
        return Traversal.getIndex().then(index => {
            // PATHS
            return Promise.all([
                Traversal.getEntitiesOfType(["path"]).then(paths => {
                    paths.forEach(path => {
                        let data = duplicate(path.data);
                        data.data.capacities = data.data.capacities.map(cid => {
                            if (typeof cid === "string") {
                                // not updated
                                return index[cid];
                            } else {
                                // updated
                                return index[cid._id];
                            }
                        });
                        if (COF.debug) console.log(data);
                        return path.update(data);
                    })
                }),
                // PROFILES
                Traversal.getEntitiesOfType(["profile"]).then(profiles => {
                    profiles.forEach(profile => {
                        let data = duplicate(profile.data);
                        data.data.paths = data.data.paths.map(pid => {
                            if (typeof pid === "string") {
                                // not updated
                                return index[pid];
                            } else {
                                // updated
                                return index[pid._id];
                            }
                        });
                        if (COF.debug) console.log(data);
                        return profile.update(data);
                    })
                }),
                // SPECIES
                Traversal.getEntitiesOfType(["species"]).then(species => {
                    species.forEach(specie => {
                        let data = duplicate(specie.data);
                        data.data.capacities = data.data.capacities.map(cid => {
                            if (typeof cid === "string") {
                                // not updated
                                return index[cid];
                            } else {
                                // updated
                                return index[cid._id];
                            }
                        });
                        data.data.paths = data.data.paths.map(pid => {
                            if (typeof pid === "string") {
                                // not updated
                                return index[pid];
                            } else {
                                // updated
                                return index[pid._id];
                            }
                        });
                        if (COF.debug) console.log(data);
                        return specie.update(data);
                    })
                })
            ]);
        });
    }

    static updatePaths() {
        return Traversal.getEntitiesOfType(["path"]).then(paths => {
            paths.forEach(path => {
                return Traversal.getIndex().then(index => {
                    let data = duplicate(path.data);
                    data.data.capacities = data.data.capacities.map(cid => {
                        if (typeof cid === "string") {
                            // not updated
                            return index[cid];
                        } else {
                            // updated
                            return index[cid._id];
                        }
                    });
                    if (COF.debug) console.log(data);
                    return path.update(data);
                });
            })
        });
    }

    static updateProfiles() {
        return Traversal.getEntitiesOfType(["profile"]).then(profiles => {
            profiles.forEach(profile => {
                return Traversal.getIndex().then(index => {
                    let data = duplicate(profile.data);
                    data.data.paths = data.data.paths.map(pid => {
                        if (typeof pid === "string") {
                            // not updated
                            return index[pid];
                        } else {
                            // updated
                            return index[pid._id];
                        }
                    });
                    if (COF.debug) console.log(data);
                    return profile.update(data);
                });
            })
        });
    }

    static updateSpecies() {
        return Traversal.getEntitiesOfType(["species"]).then(species => {
            species.forEach(specie => {
                return Traversal.getIndex().then(index => {
                    let data = duplicate(specie.data);
                    data.data.capacities = data.data.capacities.map(cid => {
                        if (typeof cid === "string") {
                            // not updated
                            return index[cid];
                        } else {
                            // updated
                            return index[cid._id];
                        }
                    });
                    data.data.paths = data.data.paths.map(pid => {
                        if (typeof pid === "string") {
                            // not updated
                            return index[pid];
                        } else {
                            // updated
                            return index[pid._id];
                        }
                    });
                    if (COF.debug) console.log(data);
                    return specie.update(data);
                });
            })
        });
    }

    static async updateEncounters() {
        return Traversal.getIndex().then(index => {
            // PATHS
            return game.packs.get("cof-srd.encounters").getContent().then(encounters =>{
                encounters.forEach(encounter => {
                    let data = duplicate(encounter.data);
                    // data.data.capacities = data.data.capacities.map(cid => {
                    //     if (typeof cid === "string") {
                    //         // not updated
                    //         return index[cid];
                    //     } else {
                    //         // updated
                    //         return index[cid._id];
                    //     }
                    // });
                    if (COF.debug) console.log(data);
                    // return encounter.update(data);
                })
            });
            // return Traversal.getEntitiesOfType(["encounter"]).then(encounters => {
            //     console.log(encounters);
            //     encounters.forEach(encounter => {
            //         let data = duplicate(encounter.data);
            //         // data.data.capacities = data.data.capacities.map(cid => {
            //         //     if (typeof cid === "string") {
            //         //         // not updated
            //         //         return index[cid];
            //         //     } else {
            //         //         // updated
            //         //         return index[cid._id];
            //         //     }
            //         // });
            //         if (COF.debug) console.log(data);
            //         // return encounter.update(data);
            //     })
            // });
        });
    }
}