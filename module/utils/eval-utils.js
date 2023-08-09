export class Utils {
    /**
     * @description For an actor, evaluate the formula
     * @param {*} actor
     * @param {*} formula
     * @param {*} toEvaluate true if @xxx must be evaluated
     * @returns
     */
    static evaluate(actor, formula, toEvaluate = false) {
      if (formula === "") return 0;
      if (formula.includes("@")) return this._evaluateCustom(actor, formula, toEvaluate);
      const resultat = parseInt(formula);
      if (isNaN(resultat)) return 0;
      return resultat;
    }
  
      /**
     * @description For an actor, evaluate the formula
     * @param {*} actor
     * @param {*} formula
     * @returns
     */
      static evaluateWithDice(actor, formula) {
        if (formula === "") return "";
        if (formula.includes("@")) return this._evaluateCustom(actor, formula, true);
        return formula;      
      }
  
    /**
     * @description Evaluate a custom value
     * Shortcuts
     * @str @dex @con @int @wis @cha @mel @ran @mag @lvl
     * @param {*} actor
     * @param {} formula
     * @param {Boolean} eval : true to evaluate the replaced formula
     * @returns {string} la formule évaluée
     */
    static _evaluateCustom(actor, formula, toEvaluate) {
      // console.log("Custom Formula : ", formula);
  
      let replacedFormula = formula;
      const DSL = {
        "@for" : "actor.system.stats.str.mod",
        "@str" : "actor.system.stats.str.mod",
        "@dex" : "actor.system.stats.dex.mod",
        "@con" : "actor.system.stats.con.mod",
        "@int" : "actor.system.stats.int.mod",
        "@sag" : "actor.system.stats.wis.mod",
        "@wis" : "actor.system.stats.wis.mod",
        "@cha" : "actor.system.stats.cha.mod",
        "@atc" : "actor.system.attacks.melee.mod",
        "@melee" : "actor.system.attacks.melee.mod",
        "@atd" : "actor.system.attacks.ranged.mod",
        "@ranged" : "actor.system.attacks.ranged.mod",
        "@atm" : "actor.system.attacks.magic.mod",
        "@magic" : "actor.system.attacks.magic.mod",
        "@def" : "actor.system.attributes.def.value",
        "@niv" : "actor.system.level.value",
        "@lvl" : "actor.system.level.value"
      }
  
      // Shortcuts
      Object.keys(DSL).forEach(shortcut => {
        if(replacedFormula.includes(shortcut)) replacedFormula = replacedFormula.replace(shortcut, toEvaluate ? eval(DSL[shortcut]) : DSL[shortcut]);
      });
    
      // Remaining formula
      if (replacedFormula.includes("@")) {
        replacedFormula = replacedFormula.replace("@", "actor.system.");
      }
  
      // console.log("Custom Formula evaluated : ", replacedFormula);
  
      return replacedFormula;
    }
  }
  