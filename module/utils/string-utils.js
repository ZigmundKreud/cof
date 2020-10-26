export class StringUtils {
    static normalize (str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    static toKey (str) {
        return StringUtils.normalize(str).split(/[\s;:,\']+/).join('-');
    }
}