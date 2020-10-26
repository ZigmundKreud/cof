/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
import {Stats} from "../system/stats.js";

export class CofActor extends Actor {

    /* -------------------------------------------- */

    // /** @override */
    // prepareData() {
    //     super.prepareData(); // <==> this.data = duplicate(this._data);
    // }

    /* -------------------------------------------- */

    /** @override */
    prepareBaseData() {
        super.prepareBaseData();
        let actorData = this.data;
        if (actorData.type === "character") this._prepareBaseCharacterData(actorData);
        else if (actorData.type === "npc") this._prepareBaseCharacterData(actorData);
        else if (actorData.type === "encounter") this._prepareBaseEncounterData(actorData);
    }

    /* -------------------------------------------- */

    /** @override */
    prepareDerivedData() {
        super.prepareDerivedData();
        let actorData = this.data;
        if (actorData.type === "character") this._prepareDerivedCharacterData(actorData);
        else if (actorData.type === "npc") this._prepareDerivedCharacterData(actorData);
        else if (actorData.type === "encounter") this._prepareDerivedEncounterData(actorData);
    }

    /* -------------------------------------------- */

    _prepareBaseCharacterData(actorData) {
        console.debug("_prepareBaseCharacterData");
        // console.log(actorData);
        let stats = actorData.data.stats;
        let attributes = actorData.data.attributes;
        // COMPUTE MODS
        for (let stat of Object.values(stats)) {
            stat.value = stat.base + stat.racial + stat.bonus;
            stat.mod = Stats.getModFromStatValue(stat.value);
        }
        attributes.init.base = stats.dex.value;
        attributes.init.value = attributes.init.base + attributes.init.bonus;

        // const chaMod = stats.cha.mod;
        attributes.fp.base = 3 + stats.cha.mod;
        attributes.fp.max = attributes.fp.base + attributes.fp.bonus;
        attributes.dr.value = attributes.dr.base.value + attributes.dr.bonus.value;

        // STATS
        let strMod = stats.str.mod;
        let dexMod = stats.dex.mod;
        let intMod = stats.int.mod;
        let wisMod = stats.wis.mod;
        let chaMod = stats.cha.mod;

        // XP
        let lvl = actorData.data.level.value;

        // ATTACKS
        let attacks = actorData.data.attacks;
        let melee = attacks.melee;
        let ranged = attacks.ranged;
        let magic = attacks.magic;

        // ITEMS
        let items = actorData.items;
        let profile = this.getProfile(items);

        // STATS RELATED TO PROFILE
        let magicMod = intMod;
        if(profile){
            switch (profile.data.spellcasting) {
                case "wis" :
                    magicMod = wisMod;
                    break;
                case "cha" :
                    magicMod = chaMod;
                    break;
                default :
                    magicMod = intMod;
                    break;
            }
            switch (profile.data.key) {
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
        }
        melee.base = (strMod) ? strMod + lvl : lvl;
        ranged.base = (dexMod) ? dexMod + lvl : lvl;
        magic.base = (magicMod) ? magicMod + lvl : lvl;
        for (let attack of Object.values(attacks)) {
            attack.mod = attack.base + attack.bonus;
        }
    }

    /* -------------------------------------------- */

    _prepareBaseEncounterData(actorData) {
        console.debug("_prepareBaseEncounterData");
        // STATS
        let stats = actorData.data.stats;
        // COMPUTE STATS FROM MODS
        for (let stat of Object.values(stats)) {
            stat.value = Stats.getStatValueFromMod(stat.mod);
        }

        // ATTACKS
        if(!actorData.data.attacks){
            actorData.data.attacks = {
                "melee" : {
                    "key" : "melee",
                    "label": "COF.attacks.melee.label",
                    "abbrev": "COF.attacks.melee.abbrev",
                    "stat": "@stats.str.mod",
                    "enabled": true,
                    "base": Math.ceil(actorData.data.nc.value) + actorData.data.stats.str.mod,
                    "bonus": 0,
                    "mod": Math.ceil(actorData.data.nc.value) + actorData.data.stats.str.mod
                },
                "ranged" : {
                    "key" : "ranged",
                    "label": "COF.attacks.ranged.label",
                    "abbrev": "COF.attacks.ranged.abbrev",
                    "stat": "@stats.dex.mod",
                    "enabled": true,
                    "base": Math.ceil(actorData.data.nc.value) + actorData.data.stats.dex.mod,
                    "bonus": 0,
                    "mod": Math.ceil(actorData.data.nc.value) + actorData.data.stats.dex.mod
                },
                "magic" : {
                    "key" : "magic",
                    "label": "COF.attacks.magic.label",
                    "abbrev": "COF.attacks.magic.abbrev",
                    "stat": "@stats.int.mod",
                    "enabled": true,
                    "base": Math.ceil(actorData.data.nc.value) + actorData.data.stats.int.mod,
                    "bonus": 0,
                    "mod": Math.ceil(actorData.data.nc.value) + actorData.data.stats.int.mod
                }
            }
        }
        else {
            let attacks = actorData.data.attacks;
            for (let attack of Object.values(attacks)) {
                attack.mod = attack.base + attack.bonus;
            }
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

    /* -------------------------------------------- */

    _prepareDerivedCharacterData(actorData) {
        console.debug("_prepareDerivedCharacterData");
        // STATS
        let stats = actorData.data.stats;
        // let dex = stats.dex.value;
        // let strMod = stats.str.mod;
        let dexMod = stats.dex.mod;
        // let conMod = stats.con.mod;
        // let intMod = stats.int.mod;
        // let wisMod = stats.wis.mod;
        // let chaMod = stats.cha.mod;
        //
        // // ATTRIBUTES
        let attributes = actorData.data.attributes;
        //
        // // XP
        // let lvl = actorData.data.level.value;
        // let xp = actorData.data.xp;
        //
        // // ATTACKS
        // let attacks = actorData.data.attacks;
        // let melee = attacks.melee;
        // let ranged = attacks.ranged;
        // let magic = attacks.magic;
        //
        // // ITEMS
        let items = actorData.items;
        // let profile = this.getProfile(items);
        // let species = this.getSpecies(items);
        let armors = this.getWornArmors(items);
        let shields = this.getWornShields(items);

        // COMPUTE DEF SCORES
        let armor = armors.map(armor => armor.data.def).reduce((acc, curr) => acc + curr,0);
        let shield = shields.map(shield => shield.data.def).reduce((acc, curr) => acc + curr,0);
        attributes.def.base = 10 + armor + shield + dexMod;
        attributes.def.value = attributes.def.base + attributes.def.bonus;



        // const alert = actorData.data.alert;

        // let currxp = 0;
        // const maxxp = 2 * lvl;
        // let sc, hd, profileKey;

        // items.forEach(item => {
        //     switch (item.type) {
        //         case "armor" : {
        //             item.data.def = item.data.defBase + item.data.defBonus;
        //             if (item.data.worn) armor += parseInt(item.data.def);
        //             break;
        //         }
        //         case "capacity" : {
        //             if (item.data.checked) {
        //                 if (item.data.rank > 2) currxp += 2;
        //                 else currxp += 1;
        //             }
        //             break;
        //         }
        //         case "shield" : {
        //             var skillMod = eval(item.data.skill.split("@")[1]);
        //             var dmgStat = eval(item.data.dmgStat.split("@")[1]);
        //             var r = new Roll("@dmgBase + @bonuses", {
        //                 dmgBase: item.data.dmgBase,
        //                 bonuses: parseInt(dmgStat) + parseInt(item.data.dmgBonus)
        //             });
        //             item.data.mod = parseInt(skillMod) + parseInt(item.data.skillBonus);
        //             item.data.dmg = r.formula;
        //             item.data.def = parseInt(item.data.defBase) + parseInt(item.data.defBonus);
        //
        //             if (item.data.worn) shield += item.data.def;
        //             break;
        //         }
        //         case "melee" :
        //             var skillMod = eval(item.data.skill.split("@")[1]);
        //             let melee = attacks.melee;
        //             console.log(melee);
        //             console.log(melee.mod);
        //             var dmgStat = eval(item.data.dmgStat.split("@")[1]);
        //             var r = new Roll("@dmgBase + @bonuses", {
        //                 dmgBase: item.data.dmgBase,
        //                 bonuses: parseInt(dmgStat) + parseInt(item.data.dmgBonus)
        //             });
        //             item.data.mod = parseInt(skillMod) + parseInt(item.data.skillBonus);
        //             item.data.dmg = r.formula;
        //             break;
        //         case "ranged" :
        //             var skillMod = eval(item.data.skill.split("@")[1]);
        //             var dmgStat = eval(item.data.dmgStat.split("@")[1]);
        //             var dmgBonus = parseInt(item.data.dmgBonus);
        //             if (dmgStat) dmgBonus += parseInt(dmgStat);
        //             var r = null;
        //             if (dmgBonus != 0) {
        //                 r = new Roll("@dmgBase + @bonuses", {
        //                     dmgBase: item.data.dmgBase,
        //                     bonuses: dmgBonus
        //                 });
        //             } else {
        //                 r = new Roll("@dmgBase", {
        //                     dmgBase: item.data.dmgBase
        //                 });
        //             }
        //             item.data.mod = parseInt(skillMod) + parseInt(item.data.skillBonus);
        //             item.data.dmg = r.formula;
        //             item.data.critrange = (item.data.critrange) ? item.data.critrange : 20;
        //             break;
        //         case "spell" :
        //             var skillMod = eval(item.data.skill.split("@")[1]);
        //             var dmgStat = eval(item.data.dmgStat.split("@")[1]);
        //             var r = new Roll("@dmgBase + @bonuses", {
        //                 dmgBase: item.data.dmgBase,
        //                 bonuses: parseInt(dmgStat) + parseInt(item.data.dmgBonus)
        //             });
        //             item.data.mod = parseInt(skillMod) + parseInt(item.data.skillBonus);
        //             item.data.dmg = r.formula;
        //             item.data.critrange = (item.data.critrange) ? item.data.critrange : 20;
        //             break;
        //         case "profile" :
        //             profileKey = item.data.key;
        //             sc = item.data.spellcasting;
        //             hd = item.data.dv;
        //             break;
        //         case "path" :
        //             // for (let rank = 0; rank < 5; rank++) {
        //             //     const capacity = item.data.capacities[rank];
        //             //     if(capacity.checked){
        //             //         currxp += (capacity.level >2) ? 2 : 1;
        //             //     }
        //             // }
        //             break;
        //         default:
        //             break;
        //     }
        // });

        // // UPDATE ARMOR, SHIELD & DEF FROM ITEMS IN INVENTORY


        // // UPDATE HP
        // attributes.hp.max = attributes.hp.base + attributes.hp.bonus;
        //
        // // UPDATE XP
        // xp.max = maxxp;
        // xp.value = maxxp - currxp;
        //
        // if (maxxp - currxp < 0) {
        //     const diff = currxp - maxxp;
        //     alert.msg = (diff == 1) ? `Vous avez dépensé ${diff} point de capacité en trop !` : `Vous avez dépensé ${diff} points de capacité en trop !`;
        //     alert.type = "error";
        // } else if (maxxp - currxp > 0) {
        //     const diff = maxxp - currxp;
        //     alert.msg = (diff == 1) ? `Il vous reste ${diff} point de capacité à dépenser !` : `Il vous reste ${diff} points de capacité à dépenser !`;
        //     alert.type = "info";
        // } else {
        //     alert.msg = null;
        //     alert.type = null;
        // }
    }

    /* -------------------------------------------- */

    _prepareDerivedEncounterData(actorData) {
        console.debug("_prepareDerivedEncounterData");
        // console.log(actorData);
    }

    /* -------------------------------------------- */

    // _getItemDamageFormula(item) {
    //     console.debug("_getItemDamageFormula");
    //     let dmgStat = eval(item.data.dmgStat.split("@")[1]);
    //     let dmgBonus = parseInt(item.data.dmgBonus);
    //     if(dmgStat) dmgBonus += parseInt(dmgStat);
    //     let r = null;
    //     if(dmgBonus != 0) {
    //         r = new Roll("@dmgBase + @bonuses", {
    //             dmgBase: item.data.dmgBase,
    //             bonuses: dmgBonus
    //         });
    //     }else {
    //         r = new Roll("@dmgBase", {
    //             dmgBase: item.data.dmgBase
    //         });
    //     }
    //     return r.formula;
    // }

    /* -------------------------------------------- */

    getWornShields(items) {
        console.debug("getWornShields");
        return items.filter(item => item.type === "shield" && item.data.worn)
    }

    /* -------------------------------------------- */

    getWornArmors(items) {
        console.debug("getWornArmors");
        return items.filter(item => item.type === "armor" && item.data.worn)
    }

    /* -------------------------------------------- */

    getProfile(items) {
        console.debug("getProfile");
        return items.find(i=> i.type === "profile")
    }

    /* -------------------------------------------- */

    getSpecies(items) {
        console.debug("getSpecies");
        return items.find(i=> i.type === "species")
    }

    /* -------------------------------------------- */

    _getDefFromItems(items) {    }

}
