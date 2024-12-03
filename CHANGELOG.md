12.331.4
--------
- Release avec la fonctionnalité (oubliée) de la 12.331.3

12.331.3
--------
- Ajout d'un attribut pour les capacités : coût à 0 points d'expérience dans le calcul total des points dépensés.

12.331.2
--------
- Correction du remplacement des points de vie via le bouton Vitalité

12.331.1
--------
- Correction type sur le slot Sac à dos
- Ajout d'une option pour la visibilité par défaut des jets d'un MJ : public ou privé
- Correction pour la prise en compte du rollMode pour l'attaque des adversaires

12.331.0
--------
- Correction de la prise en compte de la caractéristique supérieure dans le dialogue de Jet

12.330.0
--------
- Prise en compte du type de dé et de la difficulté pour la macro rollStatMacro
- Ajout de la visibilité du jet au niveau du dialogue pour tous les types de jet

12.328.1
--------
- Fix deprecated message

12.328.0
--------
- Compatibilité V12

11.315.2
--------
- Corrige le processus de release

11.315.1
--------
- Dernière version v11 (avec version maximum de Foundry à 11)

11.315.0
--------
- Correction drop d'une macro sur une capacité depuis la hotbar

11.313.1
--------
- Release technique identique à la 11.313.0

11.313.0
--------
- Prise en compte des effets de type Dommages Attaque de Contact, à Distance, Magique

11.307.0
--------
- Possibilité d'utiliser les @ dans les bonus aux compétences et la base des dommages d'une capacité

11.301.0
--------
- Compatibilité V11

10.291.8
--------
- Correction du déplacement d'un objet vers un marchand

10.291.7
--------
- Prise en compte de la réduction aux dégâts des objets qui apportent une résistance aux dégâts

10.291.6
--------
- Correction de l'affichage de la liste déroulante dans les effets

10.291.5
--------
- Prise en compte des options de la macro Item dans la résolution d'une capacité d'attaque
- Ajout d'un champ pour la saisie d'un bonus de compétence pour une capacité d'attaque

10.291.4
--------
- Correction mineure

10.291.3
--------
Corrections
- Correction sur le statut de l'équipement porté
- Correction mineure

10.291.2
--------
Corrections
- Correction de l'affichage de la description pour toutes les fiches de type Actor

10.291.1
--------
Nouvelles fonctionnalités
- Système compatible avec Foundry v10
- Nouvelle option du système pour désactiver le son de certaines actions et changement de l'ordre des options
- Ajout d'une action sur les onglets inventaire et capacités pour envoyer des informations sur l'objet dans la fenêtre de chat
- Ajout des infots de l'onglet combat dans l'onglet inventaire
- Statistique anonyme de la création d'un monde

9.269.3
-------
Corrections
- Recharge la page si l'option de l'initiative est modifiée
- Corrige le bonus au jet pour CON/INT/SAG/CHA

9.269.2
-------
Corrections
- Correction mod et critique de CofSkillRoll

9.269.1
-------
Corrections
- Bug sur la montée de niveau #128
- Correction de l'activation d'une capacité pour prendre en compte les capacités du SRD dupliquées dans un autre compendium
- Correction de la méthode getPathRank pour obtenir le rang dans une voie
- Ajout d'un contrôle lors du déplacement d'un item pour éviter les duplications accidentelles
- Affichage d'une capacité dans des compendiums locals au monde

Nouvelles fonctionnalités
- Ajout de paramètres pour la macro skillMacro
- Mise à jour des macros de base avec affichage de toutes les options

9.255.1
-------
Corrections
- Prise en compte effective du contenu de la 9.245.1

Nouvelles fonctionnalités
- Pour la configuration des Active Effects, la liste déroulante est proposée par défaut

9.249.1
-------
Corrections
- Bouton application des soins dans le chat qui ne fonctionnait plus

Nouvelles fonctionnalités
- Calcul de l'expérience pour les voies de prestige

9.245.1
-------
Corrections
- Finalisation de la localisation en anglais

Nouvelles fonctionnalités
- La taille des tokens au moment de la pose sur le canvas dépend de la valeur de size
- Un token d'un PJ a automatiquement les options Peut voir et Lié au personnage

9.238.1
-------
Corrections
- Clés manquantes en anglais dans le type de bonus d'un Active Effect
- Cas où la RD est supérieure aux dommages subis

9.238.1
-------
Nouvelles fonctionnalités
- Compatibilité avec Foundry v9

0.8.9.5
-------
Nouvelles fonctionnalités
- Fenêtre Active Effect customisée : bouton permettant de passer en mode liste déroulante au lieu d'un champ texte libre
- Nouvelle option sur les objets consommables : Supprimer quand la quantité atteint 0
- Mise en place des capacités de soin, d'attaque, de buff (via Active Effect) et gérées par une macro
- Mise en place des Status Effects : aveuglé, étourdi, renversé, affaibli, immobilisé et mort. Changement de l'ordre des icônes et de la couleur de fond.
- Nouvelle option : Verrouillage des feuilles pour les joueurs pendant le mode pause


0.8.9.4
-------
Nouvelles fonctionnalités
- Nouveau paramètre WithDialog dans les macros lors du Drag n drop pour faire un jet avec ou sans boite de dialogue
- La description d'une attaque ou des dommages est en italique dans le chat

Corrections
- Masquage de la zone difficulté dans la fenêtre de dialogue si elle n'est pas visible
- Correction du bug sur les DM dans le cas d'un appel via la hotbar ou TA Hud (#114])

0.8.9.3
-------
Nouvelles fonctionnalités
- Ecran de montée de niveau avec gestion des points de vie, des capacités et des différents bonus
- Ajout option et affichage de la difficulté conditionnelle avec 3 options
		"Ne pas utiliser ni afficher la difficulté",
        "Utiliser la difficulté et l'afficher pour tout le monde",
        "Utiliser la difficulté et l'afficher uniquement au MJ"
- Ajout champ dmBonus pour les attaques simples (mêlée, distance, magique)

Corrections
- Affichage du nombre de mains dans l'onglet Combat
- La désélection des propriétés d'un objet entraine la désélection des propriétés liées
- Corrige checkbox DR cachée si option non activée

0.8.9.2
-------
Nouvelles fonctionnalités
- Ajout du support du module Token Action HUD
	Caractéristiques : 
		Clic gauche : Jet avec dialogue
		Clic droit : Jet sans dialogue
		
		Caractéristiques : Jet de dé
		Attaques : Jet de dé

	Combat
		Clic gauche : Toucher + DM
		Shift + Click : DM
		
		Armes : armes de contact ou à distance équipées
		Sorts : de type armes ou les sorts activables
			Cliquer sur un sort activable ouvre sa fiche
		
	Inventaire
		Clic droit (si option activée): ouvre la fiche de l'objet
		Clic gauche :
			Armes et Protections : Equipe/Déséquipe
			Consommables : affiche les objets consommables sauf les sorts, consomme une unité de l'objet
			Sorts : consomme le sort s'il est "consommable", sinon ne fait rien
			Equipement : les autres objets, ne fait rien
			
	Capacité 
		Clic gauche : ouvre la capacité


0.8.9.1
-------
Corrections
- Menu Options du système : la sélection multiple ne marche pas

Nouvelles fonctionnalités
- Ajout d'une option Mode de déplacement des items
		Permet de choisir si le déplacement est une copie ou un transfert de l'objet. SHIFT lors du drag n' drop permet d'avoir l'autre comportement
		
- Prise en compte du droit Limité sur un acteur

- Gestion des droits sur une fiche :
			- Propriétaire : Le joueur peut voir la fiche dans sa totalité et la modifier 
			- Observateur : Le joueur peut voir la fiche dans sa totalité MAIS ne peut pas la modifier
			- Limité : Le joueur ne peut voir qu'une partie des informations de la fiche et ne peut pas la modifier
	
		Sur un Personnage ou un PNJ : de nombreuses informations sont masquées.
		Il reste 2 onglets :
			- onglet Description
			- onglet Combat : des infos générales sur les armes équipées
		Sur une Rencontre : seule la description est visible
		
	Dans la description, le contenu d'un texte formaté avec Custom/Secret n'est visible que par le MJ.
	
- Ajout d'une option "Verrouiller les objets"
		L'activation fait que le joueur peut équiper, consommer, etc… ses propres objets, mais ne peut pas modifier les infos sur la fiche de l'objet
		
- Ajout d'une option "Vérification des mains libres" : vérifie qu'il reste assez de mains pour équipier l'objet
		Ne pas vérifier
		Vérifié : ignorable par tout le monde en utilisant SHIFT
		Vérifié : ignorable uniquement par le MJ en utilisant SHIFT

- Ajout d'une option "Vérification des emplacements d'armure" : vérifie que le slot n'est pas déjà pris par une armure équipée
		Ne pas vérifier
		Vérifié : ignorable par tout le monde en utilisant SHIFT
		Vérifié : ignorable uniquement par le MJ en utilisant SHIFT		
		
- Drag and drop des armes de rencontre
		Le Drag and drop des armes de rencontre est maintenant possible dans la hotbar
	
- Ajout compatibilité avec le module "Let Me Roll That For You" lmrfy
	
- Remplacement du jet de dé des points de récupération par un healing roll
		Ajout de la possibilité de changer le titre et de masquer les boutons dans les HealingRoll
		
- Ajout d'une option "Utiliser la règle de l'encombrement" pour gérer le malus d'armure
		L'activation fait apparaître le champ Encombrement sur la fiche, calcule le malus en fonction de l'armure, et est pris en compte pour les jets de DEX
	
- Effet d'un Item "équipable"
		Ajout d'un filtre pour n'afficher que les items de type "arme" ou "protection" sur l'onglet combat
		Activation/Désactivation des active effects provenant de l'item lors que l'on équipe/déséquipe cet item
		Possibilité d'ignorer la synchro item/effet en maintenant la touche MAJ lors du clique sur le bouton

- Synchronisation des effets avec l'état "équipé"
		Synchronisation de l'état des effets avec l'état "Equipé" de l'objet qui contient les effets : les effets ne sont appliqués que si l'objet est équipé
		Possibilité d'ignorer la synchronisation de l'état des effets en utilisant la touche SHIFT

- Ajout d'un filtre sur l'onglet combat pour n'afficher que les objets de type "arme" et "protection"		

0.8.8.4
-------
Corrections
- Pour l'initiative et les attaques, le malus n'était pas remis à 0

0.8.8.3
-------
Corrections
- Caractéristique d'attaque magique selon le profil (#83)

0.8.8.2
-------
Corrections
- Tirage aléatoire des caractéristiques (#84)
- Nombre de points de magie selon le profil

0.8.8.1
-------
Corrections
- Déplier/Replier des onglets inventaire et combat
- Image par défaut d'une rencontre
- Affichage jet de dégâts

Fonctionnalités
- Rencontre : pv ne peut être supérieur à pv max
- Application ou non de la RD aux dommages avec une case à cocher

0.8.7.1
-------
Mise à jour pour supporter Foundry 0.8

0.5.0
-----
Fonctionnalités
	- Tous les calculs de la fiche sont maintenant réalisés après la prise en compte des effets
	- Ajout de l'onglet Effets dans les Items
	- Shift + Click sur un raccourci d'arme dans la hotbar pour avoir uniquement la fenêtre des dommages
	- Prise en compte de l'encombrement pour les jets de DEX
	- Changement de l'icône par défaut des items
	- Dépense d'un PR : clic gauche avec gain de PV, clic droit sans
	- Séparation de Bonus/Malus en Bonus et Malus dans la fenêtre de dialogue Jet de compétence
	- Nouvelle Option "Affiche les boutons de dommages" : afficher ou non les boutons d'application des dégâts à tout le monde, par défaut uniquement au MJ
	- Affichage uniquement des entêtes utiles à la catégorie dans la partie Combat
	- Onglet Voies et Capacités : un clic permet de déplier/replier la description d'une capacité
	- Possibilité de changer le label, la description du jet de compétences et la description des dommages des fenêtres de jet via une macro
	
Corrections d'anomalies
	- Correction du nombre de PM pour être conforme au SRD
	- Suppression de la race, du profil ou des capacités sur la fiche de personnage
	- Traduction en français de certaines parties en anglais

Limitations ou bugs connus
    - PJ incompétent non implémenté