import {Traversal} from "./utils/traversal.js";

export const registerHandlebarsHelpers = async function () {

    Handlebars.registerHelper('filterByType', function (items, type) {
        if(items instanceof Object){
            return Object.values(items).filter(item => item.type === type);
        }else {
            return items.filter(item => item.type === type);
        }
    });

    Handlebars.registerHelper('isOfType', function (item, type) {
        return item.type === type;
    });

    Handlebars.registerHelper('getPathFromId', function (id) {
        const compendium = COF.paths;
        const ingame = game.items.filter(item => item.type === "path").map(entity => entity.data);
        const path = ingame.concat(compendium).find(p => p._id === id);
        // console.log(path);
        return path;
    });
    Handlebars.registerHelper('getCapacitiesFromId', function (id) {
        const compendium = COF.capacities;
        const ingame = game.items.filter(item => item.type === "capacity").map(entity => entity.data);
        const capacity = ingame.concat(compendium).find(c => c._id === id);
        return capacity;
    });


    Handlebars.registerHelper('isPath', function (item) {
        return item.type === "path";
    });
    Handlebars.registerHelper('isCapacity', function (item) {
        return item.type === "capacity";
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
        return items.filter(item => item.type === "armor" || item.type === "shield" || item.type === "melee" || item.type === "ranged" || item.type === "trapping");
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

    Handlebars.registerHelper('getProfile', function (items) {
        return items.find(item => item.type === "profile");
    });

    Handlebars.registerHelper('getActiveCapacities', function (items) {
        let caps = items.filter(item => item.type === "capacity" && item.data.checked);
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

    Handlebars.registerHelper('getCapacitiesByPath', function (items, pathKey) {
        let caps = items.filter(item => item.type === "capacity" && item.data.path === pathKey);
        caps.sort(function (a, b) {
            return (a.data.rank > b.data.rank) ? 1 : -1
        });
        return caps;
    });

    Handlebars.registerHelper('getPath', function (items, pathKey) {
        return items.filter(item => item.type === "path").find(p => p.data.key === pathKey);
    });

    Handlebars.registerHelper('isArmor', function (item) {
        return item.type === "armor";
    });

    Handlebars.registerHelper('isShield', function (item) {
        return item.type === "shield";
    });

    Handlebars.registerHelper('isMelee', function (item) {
        return item.type === "melee";
    });

    Handlebars.registerHelper('isRanged', function (item) {
        return item.type === "ranged";
    });

    Handlebars.registerHelper('isSpecies', function (item) {
        return item.type === "species";
    });

    Handlebars.registerHelper('isProfile', function (item) {
        return item.type === "profile";
    });

    Handlebars.registerHelper('isTrapping', function (item) {
        return item.type === "trapping";
    });

    Handlebars.registerHelper('is2H', function (item) {
        return parseInt(item.data.hands) === 2;
    });

    Handlebars.registerHelper('isNull', function (val) {
        return val == null;
    });

    Handlebars.registerHelper('isEmpty', function (list) {
        if(list) return list.length == 0;
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

    Handlebars.registerHelper('hasArmor', function (list) {
        return list.length > 0;
    });

    Handlebars.registerHelper('hasArmor', function (actor) {
        return actor.items.filter(i => i.type === "armor").length > 0;
    });

    Handlebars.registerHelper('hasShield', function (actor) {
        return actor.items.filter(i => i.type === "shield").length > 0;
    });

    Handlebars.registerHelper('hasArmorOrShield', function (actor) {
        return actor.items.filter(i => i.type === "shield" || i.type === "armor").length > 0;
    });

    Handlebars.registerHelper('hasRanged', function (actor) {
        return actor.items.filter(i => i.type === "ranged").length > 0;
    });

    Handlebars.registerHelper('hasMelee', function (actor) {
        return actor.items.filter(i => i.type === "melee").length > 0;
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

    Handlebars.registerHelper('isEnabled', function (configKey) {
        return game.settings.get("cof", configKey);
    });

    Handlebars.registerHelper('split', function (str) {
        return str.split(' ')[0];
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

    // Handlebars.registerHelper('filterCapacities', function (caps) {
    //     console.log(key);
    //     let list = Traversal.getAllCapacitiesData().filter(c => caps.includes(c.data.key))
    //     list.sort(function (a, b) {
    //         return (a.data.rank > b.data.rank) ? 1 : -1
    //     });
    //     return list;
    // });

    Handlebars.registerHelper('getValueAtIndex', function (array, index) {
        if (array[index]) return array[index];
        else return null;
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

    Handlebars.registerHelper('surroundWithCurlyBraces', function(text) {
        const result = '{' + text + '}';
        return new Handlebars.SafeString(result);
    });

    Handlebars.registerHelper('toLowerCase', function (str) {
        return str.toLowerCase();
    });

    Handlebars.registerHelper('i18n', function (str) {
        return game.i18n.localize(str);
    });


}