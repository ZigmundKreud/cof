export class Compendia {

    static getContent(filters = []) {
        let promises = game.packs.entries.map(comp => {
            return comp.getContent().then(content => {
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
        let promises = game.packs.entries.map(comp => {
            return comp.getIndex().then(index => {
                return index.map(entry => {
                    entry.source = comp.metadata.package + "." + comp.metadata.name;
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
            return game.packs.get(entry.source).getEntity(id).then(entity => {
                return entity
            });
        });
    }
}
