export class ArrayUtils {

    static remove(array, elem) {
        let index = array.indexOf(elem);
        if (index > -1) {
            array.splice(index, 1);
        }
    }

    static intersection(array1, array2) {
        return array1.filter(value => array2.includes(value));
    }

    static difference(array1, array2) {
        return array1.filter(value => !array2.includes(value));
    }
}