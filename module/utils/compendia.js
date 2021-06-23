export class Compendia {

    /**
     * @todo : Renommer la méthode getContent en getDocuments
     * 
     * @param {*} filters 
     * @returns 
     */
    static getContent(filters = []) {
        let promises = game.packs.map(comp => {
            return comp.getDocuments().then(content => {
                if (filters.length > 0) return content.filter(i => filters.includes(i.type));
                else return content;
            });
        });
        return Promise.all(promises).then(function (indices) {
            return indices.flat().reduce(function (map, obj) {
                map[obj.id] = obj;
                return map;
            }, {});
        });
    }

    static getIndex() {
        let promises = game.packs.map(comp => {
            return comp.getIndex().then(index => {
                return index.map(entry => {
                    entry.sourceId = "Compendium."+comp.metadata.package + "." + comp.metadata.name + "." + entry._id;
                    return entry;
                });
            });
        });
        return Promise.all(promises).then(function (indices) {
            return indices.flat().reduce(function (map, obj) {
                map[obj._id] = obj;
                return map;
            }, {});
        });
    }

    static find(id) {
        return this.getIndex().then(idx => {
            const entry = idx[id];
            return game.packs.get(entry.source).getDocument(id).then(entity => {
                return entity
            });
        });
    }
}
