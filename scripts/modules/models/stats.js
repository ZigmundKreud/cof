// export class Stats {
//
//     constructor() {
//         this._str = new StatValue();
//         this._dex = new StatValue();
//         this._con = new StatValue();
//         this._int = new StatValue();
//         this._wis = new StatValue();
//         this._cha = new StatValue();
//     }
//
//     create(str, dex, con, int, wis, cha) {
//         this._str = new StatValue(str);
//         this._dex = new StatValue(dex);
//         this._con = new StatValue(con);
//         this._int = new StatValue(int);
//         this._wis = new StatValue(wis);
//         this._cha = new StatValue(cha);
//     }
//
//     create(str, dex, con, int, wis, cha, tmpstr, tmpdex, tmpcon, tmpint, tmpwis, tmpcha) {
//         this._str = new StatValue(str, tmpstr);
//         this._dex = new StatValue(dex, tmpdex);
//         this._con = new StatValue(con, tmpcon);
//         this._int = new StatValue(int, tmpint);
//         this._wis = new StatValue(wis, tmpwis);
//         this._cha = new StatValue(cha, tmpcha);
//     }
//
//     get str() {
//         return this._str;
//     }
//
//     set str(value) {
//         this._str = value;
//     }
//
//     get dex() {
//         return this._dex;
//     }
//
//     set dex(value) {
//         this._dex = value;
//     }
//
//     get con() {
//         return this._con;
//     }
//
//     set con(value) {
//         this._con = value;
//     }
//
//     get int() {
//         return this._int;
//     }
//
//     set int(value) {
//         this._int = value;
//     }
//
//     get wis() {
//         return this._wis;
//     }
//
//     set wis(value) {
//         this._wis = value;
//     }
//
//     get cha() {
//         return this._cha;
//     }
//
//     set cha(value) {
//         this._cha = value;
//     }
// }
//
// class StatValue {
//     constructor() {
//         this._value = 10;
//         this._mod = 0;
//         this._tmpval = null;
//         this._tmpmod = null;
//     }
//
//     create(value) {
//         this._value = value;
//         this._mod = this.getModFromStatValue(value);
//         this._tmpval = null;
//         this._tmpmod = null;
//     }
//
//     create(value, tmpval) {
//         this._value = value;
//         this._mod = this.getModFromStatValue(value);
//         this._tmpval = tmpval;
//         this._tmpmod = this.getModFromStatValue(tmpval);
//     }
//
//     create(value, mod, tmpval, tmpmod) {
//         this._value = value;
//         this._mod = mod;
//         this._tmpval = tmpval;
//         this._tmpmod = tmpmod;
//     }
//
//     get currentValue() {
//         if(this._tmpval) return this._tmpval;
//         else return this._value;
//     }
//
//     get currentMod() {
//         if(this._tmpmod) return this._tmpmod;
//         else return this._mod;
//     }
//
//     get value() {
//         return this._value;
//     }
//
//     set value(value) {
//         this._value = value;
//     }
//
//     get mod() {
//         return this._mod;
//     }
//
//     set mod(value) {
//         this._mod = value;
//     }
//
//     get tmpval() {
//         return this._tmpval;
//     }
//
//     set tmpval(value) {
//         this._tmpval = value;
//     }
//
//     get tmpmod() {
//         return this._tmpmod;
//     }
//
//     set tmpmod(value) {
//         this._tmpmod = value;
//     }
//
//     static getModFromStatValue(value) {
//         if(value < 4) return -4;
//         else if(value < 6) return -3;
//         else if(value < 8) return -2;
//         else if(value < 10) return -1;
//         else if(value < 12) return -0;
//         else if(value < 14) return 1;
//         else if(value < 16) return 2;
//         else if(value < 18) return 3;
//         else if(value < 20) return 4;
//         else if(value < 22) return 5;
//         else if(value < 24) return 6;
//         else if(value < 26) return 7;
//         else if(value < 28) return 8;
//         else if(value < 30) return 9;
//         else throw "Unknown value";
//     }
// }
//
// export class StatBonus {
//     constructor(stat, value, isPermanent = false) {
//         this._stat = stat;
//         this._value = value;
//         this._isPermanent = isPermanent;
//     }
//
//     get stat() {
//         return this._stat;
//     }
//
//     set stat(value) {
//         this._stat = value;
//     }
//
//     get value() {
//         return this._value;
//     }
//
//     set value(value) {
//         this._value = value;
//     }
//
//     get isPermanent() {
//         return this._isPermanent;
//     }
//
//     set isPermanent(value) {
//         this._isPermanent = value;
//     }
// }
