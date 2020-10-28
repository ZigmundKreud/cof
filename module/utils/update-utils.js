import {Traversal} from "./traversal.js";

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

}