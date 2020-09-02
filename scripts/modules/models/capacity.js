export class Capacity {
    constructor(level, title, description, isLimited, isSpell) {
        this._level = level;
        this._title = title;
        this._description = description;
        this._isLimited = isLimited;
        this._isSpell = isSpell;
    }

    constructor(title, description) {
        this._title = title;
        this._description = description;
    }

    get title() {
        return this._title;
    }

    set title(value) {
        this._title = value;
    }

    get description() {
        return this._description;
    }

    set description(value) {
        this._description = value;
    }

    get level() {
        return this._level;
    }

    set level(value) {
        this._level = value;
    }

    get isLimited() {
        return this._isLimited;
    }

    set isLimited(value) {
        this._isLimited = value;
    }

    get isSpell() {
        return this._isSpell;
    }

    set isSpell(value) {
        this._isSpell = value;
    }
}

