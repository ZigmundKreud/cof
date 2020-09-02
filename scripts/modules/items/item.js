/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */

import {Logger} from "../logger.js";

export class CofItem extends Item {

    /** @override */
    prepareData() {
        super.prepareData();
        Logger.debug("prepareData");
        Logger.log(this);
    }

}
