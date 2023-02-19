export const registerHandlebarsHelpers = function () {

    Handlebars.registerHelper('getPath', function (items, pathKey) {
        return items.filter(item => item.type === "path").find(p => p.system.key === pathKey);
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

    Handlebars.registerHelper('isNegativeOrNull', function (val) {
        return val <= 0;
    });

    Handlebars.registerHelper('isNegative', function (val) {
        return val < 0;
    });

    Handlebars.registerHelper('isPositive', function (val) {
        return val > 0;
    });

    Handlebars.registerHelper('equals', function (val1, val2) {
        return val1 == val2;
    });

    Handlebars.registerHelper('neq', function (val1, val2) {
        return val1 !== val2;
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

    Handlebars.registerHelper('count', function (list) {
        return list.length;
    });

    Handlebars.registerHelper('isEnabled', function (configKey) {
        const value = game.settings.get("cof", configKey);
        if (value === false || value === "none") return false;
        return true;
    });

    Handlebars.registerHelper('split', function (str, separator, keep) {
        return str.split(separator)[keep];
    });

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
        return items.filter(i => i.type === type).map(i => i.system.key).includes(key);
    });

    Handlebars.registerHelper('includes', function (array, val) {
        return array.includes(val);
    });

    Handlebars.registerHelper('isCategoryIn', function () {
        for (let index = 1; index < arguments.length; index++) {
            const element = arguments[index];
            if (element === arguments[0]) return true;
        }
        return false;
    });

    Handlebars.registerHelper('isNotLimited', function(options){
        return !options?.limited;    
    });

    Handlebars.registerHelper('isNotLimitedEncounter', function(options){
        return !(options?.limited && options?.actor?.type === "encounter");    
    });
        
}