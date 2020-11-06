import {Traversal} from "./traversal.js";
import {StringUtils} from "./string-utils.js";

export class UpdateUtils {

    static updateCapacities(){
        Traversal.getAllCapacitiesData().forEach(cap =>{
            console.log(cap);
            let path = Traversal.findPathDataByKey(cap.data.path);

            console.log(path);
        });
    }

    static updatePaths(){
        game.packs.get("cof.paths").getContent().then(index => {
            index.forEach(entity => {
                // console.log(entity.data);
                const caps = COF.capacities.filter(c => {
                    return c.data.path === entity.data.data.key;
                });
                caps.sort(function (a, b) {
                    return (a.data.rank > b.data.rank) ? 1 : -1
                });
                let path = duplicate(entity.data);
                path.data.capacities = caps.map(c => {
                    // const obj = {
                    //     "id" : c._id,
                    //     "rank" : c.data.rank
                    // };
                    // console.log(obj);
                    return c._id;
                });
                // console.log(path.data.capacities);
                entity.update(path);
            })
        });
    }

    static updateProfiles(){
        game.packs.get("cof.profiles").getContent().then(index => {
            index.forEach(entity => {
                // console.log(entity.data);
                const paths = COF.paths.filter(p => {
                    return p.data.profile === entity.data.data.key;
                });
                // console.log(paths.map(c => c._id));
                let profile = duplicate(entity.data);
                // console.log(profile.data.paths);
                profile.data.paths = paths.map(c => c._id);
                // console.log(profile.data.paths);
                entity.update(profile);
            })
        });
    }

    static updateSpecies(){
        game.packs.get("cof.species").getContent().then(index => {
            index.forEach(entity => {
                let spec = duplicate(entity.data);
                // console.log(spec.data);
                let bonuses = spec.data.bonuses
                let data = {
                    description: spec.data.description,
                    source: spec.data.source,
                    key: spec.data.key,
                    bonuses: {
                        "str" : 1,
                        "dex" : 2,
                        "con" : 3,
                        "int" : 4,
                        "wis" : 5,
                        "cha" : 6
                    },
                    capacities: spec.data.capacities,
                    paths: []
                }
                // Manage bonuses
                const keys = Object.keys(data.bonuses);
                for(let i=0; i < bonuses.length; i++){
                    data.bonuses[keys[i]] = bonuses[i]
                }
                // Manage paths
                const paths = COF.paths.filter(e => {
                    return e.data.scope === "species" && e.data.species.includes(spec.data.key);
                });
                data.paths = paths.map(e => e._id);

                // Manage capacities
                const caps = COF.capacities.filter(e => {
                    return spec.data.capacities.includes(e.data.key);
                });
                data.capacities = caps.map(e => e._id);
                spec.data = data;
                console.log(spec);
                entity.update(spec);
            })
        });
    }

    static async createEncounterAbilities(){
        let encounterCaps = await game.packs.get("cof.encounters-capacities");
        let capacities = [];
        await game.packs.get("cof.encounters").getContent().then(index => {
            index.forEach(entity => {
                let data = duplicate(entity.data);
                // console.log(data.data.attacks);
                // data.data.weapons = data.data.attacks;
                const caps = data.data.capacities;
                const creatureName = data.name;
                // console.log(creatureName);
                caps.forEach(c => {
                    const limited = (c.name.indexOf("(L)") > 0) ? true : false;
                    const cname = `${c.name.split("(L)")[0].trim()} (${creatureName})`;
                    const key = cname.slugify({strict:true});
                    const description = `<h1>Description</h1><p>${c.description}</p>`;
                    capacities.push({
                        name : cname,
                        type : "capacity",
                        img : `/systems/cof/ui/icons/encounter-capacities/${key}.jpg`,
                        data : {
                            key : key,
                            limited : limited,
                            description : description,
                        }
                    });
                });
                // entity.update(data);
            })
        });

        //
        // // compute a checksum of the description to identify duplicates
        // StringUtils.sha256(c.description).then(hash => {
        //     if(Object.keys(capacities).includes(hash)){
        //         const key2 = cname.slugify({strict:true});
        //         const cname2 = c.name.split("(L)")[0].trim();
        //         capacities[hash].name = cname2;
        //         capacities[hash].data.key = key2
        //     }else {
        //         capacities[hash] = {
        //             name : cname,
        //             type : "capacity",
        //             img : `/systems/cof/ui/icons/encounter-capacities/${key}.jpg`,
        //             data : {
        //                 key : key,
        //                 limited : limited,
        //                 description : description,
        //             }
        //         }
        //     }
        // });

        console.log(capacities);
        for (const c of capacities) {
            let item = new Item(c);
            await encounterCaps.importEntity(item);
        }
        console.log("Done.");
        // let itemData = {name: "Custom Death Ray", type: "capacity"};
        // let item = new Item(itemData);
        // Once we have an entity for our new Compendium entry we can import it, if the pack is unlocked
        // encounterCaps.importEntity(item);
    }


    static async updateEncounters(){
        let encounterCaps = await game.packs.get("cof.encounters-capacities").getContent().then(index => index.map(entity => entity.data));
        // console.log(encounterCaps);
        // let capacities = [];
        await game.packs.get("cof.encounters").getContent().then(index => {
            index.forEach(entity => {
                let data = duplicate(entity.data);
                const caps = data.data.capacities;
                const creatureName = data.name;
                console.log(creatureName);
                const capsIds = caps.map(c => {
                    const cname = `${c.name.split("(L)")[0].trim()} (${creatureName})`;
                    const key = cname.slugify({strict:true});
                    const ec = encounterCaps.find(e => e.data.key === key);
                    return ec._id;
                });
                // console.log(capsIds);
                const paths = data.data.paths;
                const pathCapsIds = paths.map(p => {
                    let tokens = p.key.split("-");
                    const rank = tokens.pop();
                    const pathKey = tokens.join("-");
                    // console.log(pathKey, rank);
                    const path = COF.paths.find(e => e.data.key === pathKey);
                    // console.log(path);
                    if(path && rank > 0 && path.data.capacities.length >= rank) {
                        // console.log(path.data.capacities[rank-1]);
                        return path.data.capacities[rank-1];
                    }
                    else console.error(pathKey, rank);
                });
                // console.log(pathCapsIds);
                data.data.capacities = pathCapsIds.concat(capsIds);
                // data.data.weapons = Object.values(data.data.attacks).map(att => {
                //     return {
                //         name: att.name,
                //         mod: parseInt(att.mod),
                //         dmg: att.dmg
                //     }
                // });
                // data.data.attacks = null;
                // console.log(data.data.weapons);
                // entity.update(data);
            })
        });
    }
}