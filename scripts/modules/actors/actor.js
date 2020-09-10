/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
import {Logger} from "../logger.js";

export class CofActor extends Actor {

    /** @override */
    prepareData() {
        super.prepareData();
        Logger.debug("prepareData");
        // Logger.log(this);

        // Get the Actor's data object
        const actorData = this.data;
        const items = actorData.items;
        // Logger.log(items);
        const data = actorData.data;
        // Logger.log(data);
        const flags = actorData.flags;
        // Logger.log(flags);

        // Prepare Character data
        if (actorData.type === "character") this._prepareCharacterData(actorData);
        else if (actorData.type === "npc") this._prepareNPCData(actorData);
        else if (actorData.type === "encounter") this._prepareEncounterData(actorData);
    }

    _prepareCharacterData(actorData) {
        const stats = actorData.data.stats;
        const attacks = actorData.data.attacks;
        const attributes = actorData.data.attributes;
        const alert = actorData.data.alert;
        const items = actorData.items;
        const xp = actorData.data.xp;
        const lvl = actorData.data.level.value;

        // COMPUTE MODS
        for (const stat of Object.values(stats)) {
            stat.value = stat.base + stat.racial + stat.bonus;
            stat.mod = Stats.getModFromStatValue(stat.value);
        }

        const dex = stats.dex.value;

        const strMod = stats.str.mod;
        const dexMod = stats.dex.mod;
        const conMod = stats.con.mod;
        const intMod = stats.int.mod;
        const wisMod = stats.wis.mod;
        const chaMod = stats.cha.mod;

        // DERIVE ATTACKS VALUES
        const melee = attacks.melee;
        const ranged = attacks.ranged;
        const magic = attacks.magic;

        // DERIVE SECONDARY ATTRIBUTES FROM STATS
        attributes.init.base = stats.dex.value;
        attributes.init.value = attributes.init.base + attributes.init.bonus;

        let armor = 0;
        let armorBonus = 0;
        let shield = 0;
        let shieldBonus = 0;
        let currxp = 0;
        const maxxp = 2 * lvl;
        let sc, hd, profileKey;

        items.forEach(item => {
            switch (item.type) {
                case "armor" : {
                    if(item.data.worn){
                        armor += item.data.def;
                        armorBonus += item.data.bonus;
                    }
                    break;
                }
                case "capacity" : {
                    if (item.data.checked) {
                        if (item.data.rank > 2) currxp += 2;
                        else currxp += 1;
                    }
                    break;
                }
                case "shield" : {
                    if(item.data.worn){
                        shield += item.data.def;
                        shieldBonus += item.data.bonus;
                    }
                    item.data.mod = melee.mod;
                    item.data.totaldmg = `${item.data.dmg} + ${strMod}`;
                    break;
                }
                case "melee" :
                    item.data.mod = melee.mod;
                    item.data.totaldmg = `${item.data.dmg} + ${strMod}`;
                    break;
                case "ranged" :
                    item.data.mod = ranged.mod;
                    item.data.critrange = (item.data.critrange) ? item.data.critrange : 20;
                    break;
                case "spell" :
                    item.data.mod = magic.mod;
                    item.data.critrange = (item.data.critrange) ? item.data.critrange : 20;
                    break;
                case "profile" :
                    profileKey = item.data.key;
                    sc = item.data.spellcasting;
                    hd = item.data.dv;
                    break;
                case "path" :
                    // for (let rank = 0; rank < 5; rank++) {
                    //     const capacity = item.data.capacities[rank];
                    //     if(capacity.checked){
                    //         currxp += (capacity.level >2) ? 2 : 1;
                    //     }
                    // }
                    break;
                default:
                    break;
            }
        });

        let magicMod = null;
        switch (sc) {
            case "wis" :
                magicMod = wisMod;
                break;
            case "cha" :
                magicMod = chaMod;
                break;
            case "int" :
                magicMod = intMod;
                break;
            default :
                magicMod = null;
                break;
        }

        melee.base = (strMod) ? strMod + lvl : lvl;
        ranged.base = (dexMod) ? dexMod + lvl : lvl;
        magic.base = (magicMod) ? magicMod + lvl : null;
        magic.enabled = (magicMod) ? true : false;

        for (const attack of Object.values(attacks)) {
            attack.mod = attack.base + attack.bonus;
        }

        // UPDATE ARMOR, SHIELD & DEF FROM ITEMS IN INVENTORY
        const armorDef = (armorBonus) ? armor + armorBonus : armor;
        const shieldDef = (shieldBonus) ? shield + shieldBonus : shield;
        const dodge = (dexMod) ? dexMod : 0;

        attributes.def.base = 10 + armorDef + shieldDef + dodge;
        attributes.def.value = attributes.def.base + attributes.def.bonus;

        attributes.fp.base = 3 + chaMod;
        attributes.fp.max = attributes.fp.base + attributes.fp.bonus;
        attributes.dr.value = attributes.dr.base + attributes.dr.bonus;

        switch (profileKey) {
            case "barde" :
            case "forgesort" :
            case "pretre" :
            case "druide" :
                attributes.mp.base = lvl + magicMod;
                break;
            case "ensorceleur" :
            case "magicien" :
            case "necromancien" :
                attributes.mp.base = 2 * lvl + magicMod;
                break;
            default :
                attributes.mp.base = 0;
                break;
        }
        attributes.mp.max = attributes.mp.base + attributes.mp.bonus;

        // UPDATE HP
        attributes.hp.max = attributes.hp.base + attributes.hp.bonus;

        // UPDATE XP
        xp.max = maxxp;
        xp.value = maxxp - currxp;

        if (maxxp - currxp < 0) {
            const diff = currxp - maxxp;
            alert.msg = (diff == 1) ? `Vous avez dépensé ${diff} point de capacité en trop !` : `Vous avez dépensé ${diff} points de capacité en trop !`;
            alert.type = "error";
        } else if (maxxp - currxp > 0) {
            const diff = maxxp - currxp;
            alert.msg = (diff == 1) ? `Il vous reste ${diff} point de capacité à dépenser !` : `Il vous reste ${diff} points de capacité à dépenser !`;
            alert.type = "info";
        } else {
            alert.msg = null;
            alert.type = null;
        }
    }

    _prepareNPCData(actorData) {
        this._prepareCharacterData(actorData);
    }

    _prepareEncounterData(actorData) {
    }
}
