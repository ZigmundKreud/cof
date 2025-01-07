import { System, COF } from "../system/config.js";
import { Capacity } from "../controllers/capacity.js";

export class LevelUpSheet extends FormApplication {
    
    constructor(object={}, options={}){
        super(object,options);
    
        this.levelData = {
            level: +this.object.getLevel() + 1,
            paths:[],
            previousBaseHp: +this.object.system.attributes.hp.base,
            previousAttacks: {
                melee: this.object.system.attacks.melee.base,
                ranged: this.object.system.attacks.ranged.base,
                magic: this.object.system.attacks.magic.base
            }
        };
        this.previousTooltip;

        this.minSize = 800;
        this.maxSize = 1200;
        this.pathSize = 200;
        this.maxPaths = 6;

        let nbPaths = this.object.getEmbeddedCollection('Item').filter(item=>item.type==="path").length;
        this.position.width = Math.clamp(nbPaths*this.pathSize , this.minSize, this.maxSize);

        this.options.title = this.options.title ? this.options.title : game.i18n.format('COF.levelUp.title', {name:object.system.name});  
        
        // Si le jet n'as pas été fourni, effectue un jet de dé pour les PV Bonus
        this.hpRoll = this.options.hpRoll;
        if (!this.hpRoll){
            let dv = this.object.getDV();
            let modCon = this.object.getStatMod("con");            
            this.hpRoll = new Roll(`${dv}+${modCon}`);
            this.hpRoll.roll({async:false});
        }
        this.levelData.hpBonus = {
            dice: this.hpRoll.dice[0].total,
            con: this.object.getStatMod("con"),
            total: this.hpRoll.total
        }
    }

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: System.templatesPath + "/actors/parts/levelUp-sheet.hbs"
        });
    }

    _addCapacityToLevelUp(pathId, CapacityId){
        let path = this.object.getEmbeddedCollection('Item').get(pathId);
        let levelPath = this.levelData.paths.find(path=>path.id === pathId);

        if (levelPath){
            // Si la capacité est déjà présente, on quitte
            if (levelPath.capacities.some(capacity => capacity.id === CapacityId)) return;
        }
        else {
            levelPath = {
                id : pathId,
                name : path?.system.name,
                capacities : []
            }
            this.levelData.paths.push(levelPath);
        }
        let pathCapacity = path.system.capacities.find(capacity=>capacity._id === CapacityId);

        let levelCapacity = {
            id : CapacityId,
            name : pathCapacity.name,
            rank: pathCapacity.data.rank
        }

        levelPath.capacities.push(levelCapacity);
        
        // On range les capacités par ordre de rang
        levelPath.capacities.sort((a,b)=>{
            return a.rank < b.rank ? -1 : a.rank > b.rank ? 1 : 0;
        });
    }

    _removeCapacityFromLevelUp(pathId, CapacityId){
        let levelPath = this.levelData.paths.find(path=>path.id === pathId);
        if (!levelPath) return;
        
        let levelPathIndex = this.levelData.paths.findIndex(path=>path.id === pathId);     
        let levelCapacityIndex = levelPath.capacities.findIndex(capacity=> capacity.id === CapacityId);

        if (levelPath.capacities.length === 1) this.levelData.paths.splice(levelPathIndex, 1);
        else levelPath.capacities.splice(levelCapacityIndex, 1);        
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('.capacity-label').mouseenter(async (ev) => {
            
            let currentTarget = $(ev.currentTarget);
            let target = currentTarget[0];

            let tooltip = ev.currentTarget.parentNode.querySelector(".tooltip");

            if (target.getAttribute("loaded") === "true"){
                tooltip.classList.remove("hidden");
            }
            else {
                let parent = target.parentNode;
                let capacityUuid = parent.getAttribute('capacity-uuid');
                let capacity = await fromUuid(capacityUuid);

                let description = capacity.system.description;
                description = this._changeTooltipHeader(description, capacity);
                tooltip.innerHTML = description;

                target.setAttribute("loaded", "true");
                tooltip.classList.remove("hidden");
            }
            
            // Parfois à cause de lag l'event mouseLeave ne se déclenche pas et plusieurs tooltip s'affichent en même temps
            // Pour éviter ça, on force le tooltip précédent à disparaître            
            if (this.previousTooltip && this.previousTooltip !== tooltip) this.previousTooltip.classList.add("hidden");
            this.previousTooltip = tooltip;            
        });

        html.find('.capacity-label').mouseleave(async (ev) => {
            let tooltip = ev.currentTarget.parentNode.querySelector(".tooltip");
            tooltip.classList.add("hidden");
        });

        html.find('.select').click(ev => {
            let currentTarget = $(ev.currentTarget);
            let target = currentTarget[0];
            let parent = target.parentNode;

            let selectedPathId = parent.getAttribute('path-id');
            let selectedCapacityId = parent.getAttribute('capacity-id');
            let selectedRank = +parent.getAttribute('capacity-rank');
            
            let rankCost = selectedRank <= 2 ? 1 : 2;
            this.remainingPoints += target.checked ? -rankCost : rankCost;            

            let isLevelCapacity = this.levelData.paths.find(path=>path.id === selectedPathId)?.capacities.some(capacity=>capacity.id === selectedCapacityId);

            if (target.checked && !isLevelCapacity) this._addCapacityToLevelUp(selectedPathId, selectedCapacityId);
            else if (!target.checked && isLevelCapacity) this._removeCapacityFromLevelUp(selectedPathId, selectedCapacityId);

            let table = currentTarget.parents().get().find(elem=>elem.tagName==="TABLE");            
            
            let pathCapacitiesElems = Array.from(table.querySelectorAll(`.selectable[path-id="${selectedPathId}"]`));

            // Gestion de la Sélection/Désélection des autres capacités de la voie
            // En cas de sélection, sélection automatique des capacités de rang inférieur
            // En cas de désélection, désélection automatique des capacités de rang supérieur
            pathCapacitiesElems.forEach((capacity)=>{
                let pathId = capacity.getAttribute('path-id');
                let capacityId = capacity.getAttribute('capacity-id');
                let rank = +capacity.getAttribute('capacity-rank');                    
                let checkbox = capacity.getElementsByTagName('input')[0];

                let levelPath = this.levelData.paths.find(path=>path.id === pathId);

                if (rank < selectedRank && !checkbox.checked) {
                    checkbox.checked = true;
                    this.remainingPoints -= rank <= 2 ? 1 : 2;
                    
                    if (!levelPath?.capacities.some(capacity=>capacity.id === capacityId)){
                        this._addCapacityToLevelUp(pathId, capacityId);
                    }       
                }
                else if (rank > selectedRank && checkbox.checked){
                    checkbox.checked = false; 
                    this.remainingPoints += rank <= 2 ? 1 : 2;

                    if (levelPath?.capacities.some(capacity=>capacity.id === capacityId)){
                        this._removeCapacityFromLevelUp(pathId, capacityId);
                    }
                }                
            });

            // Gestion de l'activation/désactivation des capacités en fonction des points restants
            let selectableElements = table.querySelectorAll(`.selectable`);        
            selectableElements.forEach((elem)=>{
                let elemPathId = elem.getAttribute('path-id');
                let checkbox = elem.getElementsByTagName('input')[0];
                
                // On ne vérifie que les capacités non cochées
                if (!checkbox.checked){
                    let totalCost = 0
                    // Récupération de toutes les capacités de la même voie ET de rang inférieur ET non cochées
                    // pour calcul le coût total de la capacité
                    // (les capacités déjà cochées, ont déjà été déduite des points restants)
                    let pathCapacities = Array.from(table.querySelectorAll(`.selectable[path-id="${elemPathId}"]`)).filter(capacity=> +capacity.getAttribute("capacity-rank") < +elem.getAttribute("capacity-rank") && !capacity.getElementsByTagName('input')[0].checked);
                    pathCapacities.forEach((capa)=>{
                            totalCost += +capa.getAttribute("capacity-rank") <= 2 ? 1 : 2;
                    });
                    totalCost += +elem.getAttribute("capacity-rank") <= 2 ? 1 : 2;

                    // Si le coût total restant est > aux points restant => désactivation de la capacité
                    if (totalCost > this.remainingPoints){
                        elem.getElementsByTagName('input')[0].setAttribute("disabled","");
                        if (!elem.classList.contains('grey')) elem.classList.add('grey');
                    }
                    // Sinon, activation de la capacité
                    else
                    {
                        elem.getElementsByTagName('input')[0].removeAttribute("disabled");
                        if (elem.classList.contains('grey')) elem.classList.remove('grey');
                    }
                }
            });

            // Mise à jour de l'affichage des points restants si ils sont visible
            let remainingPoints = document.querySelector('#remainingPoints');
            if (remainingPoints) remainingPoints.textContent = Math.max(0, this.remainingPoints);            
        });

        html.find('.dialog-button').click(async (ev) => {
            ev.preventDefault();

            let actor = this.object;
            
            let level = this.levelData.level;            

            let hp = actor.system.attributes.hp;
            let baseHp = hp.base + this.levelData.hpBonus.total;
            let currentHp = hp.value + this.levelData.hpBonus.total;

            for (let p = 0; p < this.levelData.paths.length; p++){
                let path = this.levelData.paths[p];
                Capacity.toggleCheck(actor, path.capacities[path.capacities.length-1].id, path.id, false);
            };

            let history = actor.system.level.history;
            if (!history) history = [];

            let levelIndex = history.findIndex(levelData=>levelData.level === level);
            if (levelIndex > -1) history[levelIndex] = this.levelData;            
            else history.push(this.levelData);

            // Trie des niveaux par ordre croissant
            history.sort((a,b)=>{
                return a.level < b.level ? -1 : a.level > b.level ? 1 : 0;
            });
            
            await actor.update({"system.level.value":level, "system.level.history":history, "system.attributes.hp.base": baseHp, "system.attributes.hp.value": currentHp});     
            this._sendMessageToGM();
            this.close();
        });
    }

    _changeTooltipHeader(description, capacity){
        description = description.trim();                           // Retrait des espaces inutiles en début et fin de description
        description = description.replace(/^<h1>.*<\/h1>/,'');      // On retire le premier Header (en général "Description")
        description = `<h1>${capacity.name}</h1>${description}`;    // On ajoute en entête le nom de la capacité
        return description;
    }

    _getTotalPoints(){
        let level = +this.object.getLevel() + 1;
        return level * 2;
    }

    _getUsedPoints(){
        let paths = this.object.getEmbeddedCollection('Item').filter(item=>item.type==="path");
        let usedPoints = 0;
        paths.forEach((path=>{
            path.system.capacities.forEach((capacity)=>{
                if (capacity.data.checked) usedPoints += capacity.data.rank <= 2 ? 1 : 2;
            });
        }));
        return usedPoints;
    }

    _sendMessageToGM(){

        let messageData = {
            name: this.object.name,
            level: this.levelData.level,
            pv: this.levelData.hpBonus.total,
            paths: this.levelData.paths
        }

        renderTemplate("systems/cof/templates/chat/levelUp-card.hbs", messageData).then((flavor)=>{
            ChatMessage.create({
                //"type": CONST.CHAT_MESSAGE_TYPES.WHISPER,
                "flavor": flavor,
                "user": game.user.id,
                "content": "",
                "speaker": {
                    "actor": this.object.id,
                },
                "whisper": ChatMessage.getWhisperRecipients("gm")
            })
        })
    }    

    getData(options = {}) {
        const data = super.getData(options);

        let totalPoints = this._getTotalPoints();
        let usedPoints = this._getUsedPoints();
        this.remainingPoints = totalPoints - usedPoints;

        let paths = data.object.getEmbeddedCollection('Item').filter(item=>item.type==="path");
        data.paths = paths;
        data.ranks = [];

        let maxRank = 0;
        paths.forEach(path=>{
            maxRank = Math.max(maxRank, path.system.capacities.length);
        });

        for(let rankIndex = 0; rankIndex < maxRank; rankIndex++){
            
            let capacities = []
            for(let pathIndex = 0; pathIndex < paths.length; pathIndex++){
                
                // Si la voie ne possède pas de capacité pour le rang demandé, on passe à la voie suivante
                if (rankIndex >= paths[pathIndex].system.capacities.length) continue;

                let capacity = { capacity : paths[pathIndex].system.capacities[rankIndex] };
 
                capacity.cost =  rankIndex <= 1 ? 1 : 2;
                
                if (capacity.capacity.data.checked) capacity.totalCost = 0;
                else {
                    capacity.totalCost = capacity.cost;

                    // Calcul du cout de la capacité en ajoutant celui de la capacité précédente
                    // On ignore la capacacité de rang 1 (index commence à 0) car elle n'as pas de capacité précédente
                    if (rankIndex > 0) {
                        // Si il y as une capacité pour le rang et la voie en cours
                        if (data.ranks.length >= rankIndex && data.ranks[rankIndex-1].capacities.length > pathIndex){
                            // Si la capacité précédente n'est pas coché, on ajoute son coût à celui de la capacité en cours
                            let previousCapacity = data.ranks[rankIndex-1].capacities[pathIndex];
                            if (!previousCapacity.capacity.data.checked) capacity.totalCost += previousCapacity.totalCost;
                        }
                    }
                }

                capacity.checked = capacity.capacity.data.checked;

                // La capacité est sélectionnable si :
                // - La capacité n'est pas déjà coché
                // - Le coût cumulé de la capacité est <= aux points restants
                // - Le rang de la capacité est <= au nouveau niveau
                capacity.enabled = true;        
                capacity.enabled &= !capacity.capacity.data.checked;
                capacity.enabled &= this.remainingPoints >= capacity.totalCost;
                capacity.enabled &= this.levelData.level > rankIndex;
                capacity.disabled = !capacity.enabled;

                capacity.pathId = paths[pathIndex].id;
                capacity.id = capacity.capacity._id;
                capacity.uuid = capacity.capacity.sourceId;
                capacity.rank = rankIndex+1;

                capacities.push(capacity);
            }
            data.ranks.push({rank:rankIndex+1, capacities:capacities});
            data.actorIcon = data.object.img;
            data.actorName = data.object.name;
            data.level = this.levelData.level;

            data.remainingPoints = this.remainingPoints;
            data.availablePoints = this.remainingPoints;

            let dice = `d${this.hpRoll.dice[0].faces}`;
            data.diceIcon = COF.diceIcon[dice];
            data.bonusPV = this.levelData.hpBonus.total;
            data.dv = this.levelData.hpBonus.dice;
            data.modCon = this.levelData.hpBonus.con;
        }
        data.reduceDisplay = paths.length > this.maxPaths;
        return data;
    }
}