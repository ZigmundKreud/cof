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
                // console.log(caps.map(c => c._id));
                let path = duplicate(entity.data);
                path.data.capacities = caps.map(c => c._id);
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

}