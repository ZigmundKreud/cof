export class EntitySummary {
    static create(itemData){
        return {
            _id : itemData._id,
            name: itemData.name,
            img: itemData.img,
            sourceId : itemData._stats.compendiumSource
        }
    }

}
