export class Path {

    constructor(id, name, capacities) {
        this._id = id;
        this._name = name;
        this._capacities = capacities;
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get capacities() {
        return this._capacities;
    }

    set capacities(value) {
        this._capacities = value;
    }
}

