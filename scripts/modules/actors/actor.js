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
        // let armorBonus = 0;
        let shield = 0;
        let shieldBonus = 0;
        let currxp = 0;
        const maxxp = 2 * lvl;
        let sc, hd, profileKey;

        items.forEach(item => {
            switch (item.type) {
                case "armor" : {
                    item.data.def = item.data.defBase + item.data.defBonus;
                    if (item.data.worn) armor += parseInt(item.data.def);
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
                    var skillMod = eval(item.data.skill.split("@")[1]);
                    var dmgStat = eval(item.data.dmgStat.split("@")[1]);
                    var r = new Roll("@dmgBase + @bonuses", {
                        dmgBase: item.data.dmgBase,
                        bonuses: parseInt(dmgStat) + parseInt(item.data.dmgBonus)
                    });
                    item.data.mod = parseInt(skillMod) + parseInt(item.data.skillBonus);
                    item.data.dmg = r.formula;
                    item.data.def = parseInt(item.data.defBase) + parseInt(item.data.defBonus);

                    if (item.data.worn) shield += item.data.def;
                    break;
                }
                case "melee" :
                    var skillMod = eval(item.data.skill.split("@")[1]);
                    var dmgStat = eval(item.data.dmgStat.split("@")[1]);
                    var r = new Roll("@dmgBase + @bonuses", {
                        dmgBase: item.data.dmgBase,
                        bonuses: parseInt(dmgStat) + parseInt(item.data.dmgBonus)
                    });
                    item.data.mod = parseInt(skillMod) + parseInt(item.data.skillBonus);
                    item.data.dmg = r.formula;
                    break;
                case "ranged" :
                    var skillMod = eval(item.data.skill.split("@")[1]);
                    var dmgStat = eval(item.data.dmgStat.split("@")[1]);
                    var r = new Roll("@dmgBase + @bonuses", {
                        dmgBase: item.data.dmgBase,
                        bonuses: parseInt(dmgStat) + parseInt(item.data.dmgBonus)
                    });
                    item.data.mod = parseInt(skillMod) + parseInt(item.data.skillBonus);
                    item.data.dmg = r.formula;
                    item.data.critrange = (item.data.critrange) ? item.data.critrange : 20;
                    break;
                case "spell" :
                    var skillMod = eval(item.data.skill.split("@")[1]);
                    var dmgStat = eval(item.data.dmgStat.split("@")[1]);
                    var r = new Roll("@dmgBase + @bonuses", {
                        dmgBase: item.data.dmgBase,
                        bonuses: parseInt(dmgStat) + parseInt(item.data.dmgBonus)
                    });
                    item.data.mod = parseInt(skillMod) + parseInt(item.data.skillBonus);
                    item.data.dmg = r.formula;
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
        attributes.def.base = 10 + armor + shield + dexMod;
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
        const stats = actorData.data.stats;

        // COMPUTE MODS
        for (const stat of Object.values(stats)) {
            stat.value = Stats.getStatValueFromMod(stat.mod);
        }

        // MODIFY TOKEN REGARDING SIZE
        switch (actorData.data.details.size) {
            case "big":
                actorData.token.width = 2;
                actorData.token.height = 2;
                break;
            case "huge":
                actorData.token.width = 4;
                actorData.token.height = 4;
                break;
            case "colossal":
                actorData.token.width = 8;
                actorData.token.height = 8;
                break;
            case "tiny":
            case "small":
            case "short":
            case "med":
            default:
                break;
        }
    }
}
