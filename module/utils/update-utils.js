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
        Traversal.getAllPathsData().forEach(p =>{
            console.log(p);
        });
    }
}