export class Stats {
    static getModFromStatValue = function (value) {
        return (value < 4) ? -4 : Math.floor(value / 2) - 5;
    };
    static getStatValueFromMod = function (mod) { return mod * 2 + 10; };
}