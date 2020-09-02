export class Spec {

    constructor(id, description, age, longevity, height, weight, morphology, racial, bonuses, capacities, names) {
        this._id = id;
        this._description = description;
        this._age = age;
        this._longevity = longevity;
        this._height = height;
        this._weight = weight;
        this._morphology = morphology;
        this._racial = racial;
        this._bonuses = bonuses;
        this._capacities = capacities;
        this._names = names;
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

    get age() {
        return this._age;
    }

    set age(value) {
        this._age = value;
    }

    get longevity() {
        return this._longevity;
    }

    set longevity(value) {
        this._longevity = value;
    }

    get height() {
        return this._height;
    }

    set height(value) {
        this._height = value;
    }

    get weight() {
        return this._weight;
    }

    set weight(value) {
        this._weight = value;
    }

    get morphology() {
        return this._morphology;
    }

    set morphology(value) {
        this._morphology = value;
    }

    get racial() {
        return this._racial;
    }

    set racial(value) {
        this._racial = value;
    }

    get bonuses() {
        return this._bonuses;
    }

    set bonuses(value) {
        this._bonuses = value;
    }

    get capacities() {
        return this._capacities;
    }

    set capacities(value) {
        this._capacities = value;
    }

    get names() {
        return this._names;
    }

    set names(value) {
        this._names = value;
    }
}
