/**
 * 
 */
export function customizeStatusEffects() {
    /// Parcours des modifications
    for(let modificationId in EffectsModifications) {
        // Recherche du status correspondant à la modification
        let status = CONFIG.statusEffects.find(eff=>eff.id === modificationId);
        // Si le statut a été trouvé
        // Modification du libellé et ajout de l'effet (des modificateurs) si nécessaire
        if (status){
            // Récupération de l'objet de modification concerné
            let modifications = EffectsModifications[modificationId];
            
            if (modifications.label) status.label = modifications.label;
            if (modifications.changes) status.changes = modifications.changes;
        }
    }
}

export const EffectsModifications = {     
    "prone":{
        label:"COFCUSTOMSTATUS.prone",
        changes:[
			{
				key: "data.attacks.melee.bonus",
				mode: 2,
				value: -5
			},       

			{
				key: "data.attacks.ranged.bonus",
				mode: 2,
				value: -5
			},           

			{
				key: "data.attacks.magic.bonus",
				mode: 2,
				value: -5
			},

			{
				key: "data.attributes.def.bonus",
				mode: 2,
				value: -5
			}
		]
    },
    "blind":{
        label:"COFCUSTOMSTATUS.blind",
        changes:[
			{
				key: "data.attacks.melee.bonus",
				mode: 2,
				value: -5
			},

			{
				key: "data.attacks.ranged.bonus",
				mode: 2,
				value: -10
			},

			{
				key: "data.attacks.magic.bonus",
				mode: 2,
				value: -5
			},          

			{
				key: "data.attributes.init.bonus",
				mode: 2,
				value: -5
			}          		
		]        
    },
    "stun":{
        label:"COFCUSTOMSTATUS.stun",
        changes:[
			{
				key: "data.attributes.def.bonus",
				mode: 2,
				value: -5
			}
		]        
    }
}

