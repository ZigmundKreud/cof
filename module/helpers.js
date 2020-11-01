import {Traversal} from "./utils/traversal.js";

export const registerHandlebarsHelpers = function () {

    Handlebars.registerHelper('getEmbeddedItems', function (type, ids) {
        if (ids) {
            const items = Traversal.getItemsOfType(type);
            return ids.map(id => items.find(i => i._id === id));
        } else return null;
    });

    Handlebars.registerHelper('getPaths', function (items) {
        return items.filter(item => item.type === "path");
    });

    Handlebars.registerHelper('getSpecies', function (items) {
        return items.find(item => item.type === "species");
    });

    Handlebars.registerHelper('getArmors', function (items) {
        return items.filter(item => item.type === "armor");
    });

    Handlebars.registerHelper('getShields', function (items) {
        return items.filter(item => item.type === "shield");
    });

    Handlebars.registerHelper('getMeleeWeapons', function (items) {
        return items.filter(item => item.type === "melee");
    });

    Handlebars.registerHelper('getRangedWeapons', function (items) {
        return items.filter(item => item.type === "ranged");
    });

    Handlebars.registerHelper('getSpells', function (items) {
        return items.filter(item => item.type === "spell");
    });

    Handlebars.registerHelper('getInventory', function (items) {
        let inventory = items.filter(item => item.type === "item" || item.type === "armor" || item.type === "shield" || item.type === "melee" || item.type === "ranged" || item.type === "trapping");
        inventory.sort(function (a, b) {
            const aKey = a.type + "-" + a.name.slugify({strict: true});
            const bKey = b.type + "-" + b.name.slugify({strict: true});
            return (aKey > bKey) ? 1 : -1
        });
        return inventory;
    });

    Handlebars.registerHelper('getWornItems', function (items) {
        return items.filter(item => item.data.worn || item.type === "spell");
    });

    Handlebars.registerHelper('getWornArmors', function (items) {
        return items.filter(item => item.type === "armor" && item.data.worn);
    });

    Handlebars.registerHelper('getWornShields', function (items) {
        return items.filter(item => item.type === "shield" && item.data.worn);
    });

    Handlebars.registerHelper('getWornMeleeWeapons', function (items) {
        return items.filter(item => item.type === "melee" && item.data.worn);
    });

    Handlebars.registerHelper('getWornRangedWeapons', function (items) {
        return items.filter(item => item.type === "ranged" && item.data.worn);
    });

    Handlebars.registerHelper('getTrappings', function (items) {
        return items.filter(item => item.type === "trapping");
    });

    Handlebars.registerHelper('getItems', function (items) {
        return items.filter(item => item.type === "item");
    });

    Handlebars.registerHelper('getProfile', function (items) {
        return items.find(item => item.type === "profile");
    });

    Handlebars.registerHelper('countPaths', function (items) {
        return items.filter(item => item.type === "path").length;
    });


    Handlebars.registerHelper('getActiveCapacities', function (items) {
        let caps = items.filter(item => {
            // return item.type === "capacity" && item.data.checked
            return item.type === "capacity"
        });
        caps.sort(function (a, b) {
            const aKey = a.data.path + "-" + a.data.rank;
            const bKey = b.data.path + "-" + b.data.rank;
            return (aKey > bKey) ? 1 : -1
        });
        return caps;
    });

    Handlebars.registerHelper('getCapacities', function (items) {
        let caps = items.filter(item => item.type === "capacity");
        caps.sort(function (a, b) {
            const aKey = a.data.path + "-" + a.data.rank;
            const bKey = b.data.path + "-" + b.data.rank;
            return (aKey > bKey) ? 1 : -1
        });
        return caps;
    });

    Handlebars.registerHelper('getCapacitiesByIds', function (ids) {
        if (ids) {
            const caps = Traversal.getItemsOfType("capacity").filter(c => ids.includes(c._id));
            caps.sort(function (a, b) {
                const indexA = ids.indexOf(a._id);
                const indexB = ids.indexOf(b._id);
                return (indexA > indexB) ? 1 : -1
            });
            return caps;
        } else return null;
    });

    Handlebars.registerHelper('getPath', function (items, pathKey) {
        return items.filter(item => item.type === "path").find(p => p.data.key === pathKey);
    });

    Handlebars.registerHelper('isNull', function (val) {
        return val == null;
    });

    Handlebars.registerHelper('isEmpty', function (list) {
        if (list) return list.length == 0;
        else return 0;
    });

    Handlebars.registerHelper('notEmpty', function (list) {
        return list.length > 0;
    });

    Handlebars.registerHelper('isZeroOrNull', function (val) {
        return val == null || val == 0;
    });

    Handlebars.registerHelper('isNegative', function (val) {
        return val < 0;
    });

    Handlebars.registerHelper('isNegativeOrNull', function (val) {
        return val <= 0;
    });

    Handlebars.registerHelper('isPositive', function (val) {
        return val > 0;
    });

    Handlebars.registerHelper('isPositiveOrNull', function (val) {
        return val >= 0;
    });

    Handlebars.registerHelper('equals', function (val1, val2) {
        return val1 == val2;
    });

    Handlebars.registerHelper('gt', function (val1, val2) {
        return val1 > val2;
    });

    Handlebars.registerHelper('lt', function (val1, val2) {
        return val1 < val2;
    });

    Handlebars.registerHelper('gte', function (val1, val2) {
        return val1 >= val2;
    });

    Handlebars.registerHelper('lte', function (val1, val2) {
        return val1 <= val2;
    });
    Handlebars.registerHelper('and', function (val1, val2) {
        return val1 && val2;
    });

    Handlebars.registerHelper('or', function (val1, val2) {
        return val1 || val2;
    });

    Handlebars.registerHelper('not', function (cond) {
        return !cond;
    });

    Handlebars.registerHelper('isEnabled', function (configKey) {
        return game.settings.get("cof", configKey);
    });

    Handlebars.registerHelper('split', function (str, separator, keep) {
        return str.split(separator)[keep];
    });

    Handlebars.registerHelper('listProfiles', function () {
        return Traversal.getAllProfilesData()
    });

    Handlebars.registerHelper('listSpecies', function () {
        return Traversal.getAllSpeciesData()
    });

    Handlebars.registerHelper('listPaths', function () {
        return Traversal.getAllPathsData()
    });

    Handlebars.registerHelper('findPath', function (key) {
        return Traversal.getAllPathsData().find(p => p.data.key === key);
    });

    Handlebars.registerHelper('findCapacity', function (key) {
        return Traversal.getAllCapacitiesData().find(c => c.data.key === key);
    });

    // If you need to add Handlebars helpers, here are a few useful examples:
    Handlebars.registerHelper('concat', function () {
        var outStr = '';
        for (var arg in arguments) {
            if (typeof arguments[arg] != 'object') {
                outStr += arguments[arg];
            }
        }
        return outStr;
    });

    Handlebars.registerHelper('add', function (a, b) {
        return parseInt(a) + parseInt(b);
    });

    Handlebars.registerHelper('valueAtIndex', function (arr, idx) {
        return arr[idx];
    });

    Handlebars.registerHelper('includesKey', function (items, type, key) {
        // console.log(items);
        return items.filter(i => i.type === type).map(i => i.data.key).includes(key);
    });

}