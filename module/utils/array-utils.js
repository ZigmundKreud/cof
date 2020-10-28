export class ArrayUtils {

    static remove(array, elem) {
        let index = array.indexOf(elem);
        if (index > -1) {
            array.splice(index, 1);
        }
    }
}