import {Stats} from "./stats.js";
import {Spec} from "./spec.js";
import {Profile} from "./profile.js";

export class Character {
    constructor() {
        this.name = "";
        this._stats = new Stats();
        this._armor = 0;
        this._shield = 0;
        this._hp = 0;
        this._dr = 0;
    }

    create(stats) {
        this._stats = stats;
    }

    get def() {
        return 10 + this._stats.dex.currentMod + this._armor + this._shield;
    }

    get init() {
        return this._stats.dex.currentValue;
    }

    get armor() {
        return this._armor;
    }

    set armor(value) {
        this._armor = value;
    }

    get shield() {
        return this._shield;
    }

    set shield(value) {
        this._shield = value;
    }

    get hp() {
        return this._hp;
    }

    set hp(value) {
        this._hp = value;
    }

    get fp() {
        return this._fp;
    }

    set fp(value) {
        this._fp = value;
    }

    get rp() {
        return this._rp;
    }

    set rp(value) {
        this._rp = value;
    }

    get dr() {
        return this._dr;
    }

    set dr(value) {
        this._dr = value;
    }
}

export class PC extends Character {
    constructor() {
        super();
        this._spec = new Spec();
        this._profile = new Profile();
        this._fp = 0;
        this._rp = 0;
    }

    get spec() {
        return this._spec;
    }

    set spec(value) {
        this._spec = value;
    }

    get profile() {
        return this._profile;
    }

    set profile(value) {
        this._profile = value;
    }

    get fp() {
        return this._fp;
    }

    set fp(value) {
        this._fp = value;
    }

    get rp() {
        return this._rp;
    }

    set rp(value) {
        this._rp = value;
    }
}

export class NPC extends Character {}

export class Creature extends Character {}
