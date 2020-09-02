export class Profile {
    constructor(id, description, dv, proficiency, trappings, note, paths) {
        this._id = id;
        this._description = description;
        this._dv = dv;
        this._proficiency = proficiency;
        this._trappings = trappings;
        this._note = note;
        this._paths = paths;
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get description() {
        return this._description;
    }

    set description(value) {
        this._description = value;
    }

    get dv() {
        return this._dv;
    }

    set dv(value) {
        this._dv = value;
    }

    get proficiency() {
        return this._proficiency;
    }

    set proficiency(value) {
        this._proficiency = value;
    }

    get trappings() {
        return this._trappings;
    }

    set trappings(value) {
        this._trappings = value;
    }

    get note() {
        return this._note;
    }

    set note(value) {
        this._note = value;
    }

    get paths() {
        return this._paths;
    }

    set paths(value) {
        this._paths = value;
    }
}

