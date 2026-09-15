# EchecTuto — prototype web immersif

Ouvrez `index.html` dans un navigateur moderne.

Fonctionnalités présentes :
- Landing immersive animée
- Design responsive PC / tablette / smartphone
- Carte de mondes
- Défis avec progression
- Coach IA simulé
- Clans / compétition
- Boutique cosmétique
- Première mission interactive sur l'échiquier
- PWA légère avec cache local
- Support de `prefers-reduced-motion`

Pour un déploiement public, placez simplement le contenu du dossier sur un hébergeur statique ou une plateforme web.


## Nouveautés v2
- Sélecteur d'apparence intégré
- Thèmes : Système, Dark Royal, Light Ivory, Midnight Blue, Emerald, Crimson, Purple Nebula, Golden Chess, OLED Black
- Préférence de thème sauvegardée localement
- Mode Système suivant l'apparence de l'appareil
- Option "Réduire les animations"
- Les couleurs de l'échiquier, des halos et des surfaces évoluent avec le thème


## Nouveautés v3
- Le thème Light Ivory est conservé mais corrigé avec contraste adaptatif sur cartes, visuels et pièces.
- Nouveau hub de missions du Monde 01.
- 5 missions réellement jouables et déverrouillées séquentiellement.
- Bouton « Mission suivante » après réussite.
- Progression du monde en pourcentage et nombre de missions validées.
- Sauvegarde locale de la progression.
- Exercices : coordonnées, Tour, Fou, Cavalier et épreuve finale.


## Nouveautés v4
- Nouvelle zone « Jouer ».
- Échiquier interactif complet.
- Déplacements légaux pour Roi, Dame, Tour, Fou, Cavalier et Pion.
- Blocage des coups laissant son propre roi en échec.
- Captures.
- Alternance Blancs / Noirs.
- Détection de l'échec, du mat et du pat.
- Promotion automatique du pion en Dame.
- Première IA débutante « Milo l'Apprenti ».
- IA qui privilégie certaines captures mais reste volontairement faible.
- Historique des coups.
- Nouvelle partie et annulation.
- Interface responsive PC / smartphone.
- Roque et prise en passant non encore intégrés dans cette version.


## Nouveautés v5
- Règles enrichies : roque roi/dame, prise en passant et promotion choisie (Dame, Tour, Fou, Cavalier).
- Échec, mat, pat et interdiction des coups laissant son roi en échec.
- Tour des IA : Milo ~300, Nova ~500, Le Garde ~700.
- Styles de force différents et sélection de l'adversaire.
- Coach en partie avec indice contextuel.
- XP, niveau joueur et compteur de victoires IA persistants.
- Récompenses XP après victoire/nulle.
- Dernier coup visuellement indiqué.
- Progression sauvegardée localement.


## Nouveautés v6
- Différenciation forte des équipes : Blancs ivoire/doré et Noirs charbon.
- Pièces rendues avec relief, contour et ombre pour rester lisibles sur toutes les cases.
- Échiquier premium avec cadre bois/or, coordonnées a-h et 1-8.
- Cases figées dans une grille 8 × 8 stricte : elles ne changent plus de taille quand une case est vide.
- Contraste amélioré sur le thème Light Ivory.
- Légende visuelle « Ton équipe / Équipe IA ».
- Surbrillance plus claire des coups légaux, captures, échec et dernier coup.


## Nouveautés v7
- Boucle complète apprendre → jouer → analyser → progresser.
- Objectif de partie visible et suivi en direct.
- Déverrouillage progressif des IA :
  - Milo disponible au départ.
  - Nova après une victoire contre Milo.
  - Le Garde après une victoire contre Nova.
- Bonus d'XP pour victoire sans aide du Coach.
- Statistiques de partie : résultat, coups, captures, XP gagnée.
- Bilan post-partie automatique.
- Analyse simplifiée : point fort, faiblesse détectée, mission recommandée.
- Bouton « Défi suivant » qui enchaîne automatiquement sur l'IA nouvellement déverrouillée.
- Historique des victoires par IA sauvegardé localement.
- Nouvelle jauge de maîtrise joueur.


## Nouveautés v8
- Carte d’Aventure améliorée avec parcours de chapitre.
- Progression visuelle plus claire des missions.
- Récompense de chapitre affichée.
- Nouveau Boss : « Le Gardien des 64 Cases ».
- Boss verrouillé jusqu’à validation des 5 missions.
- Récompenses de Boss : XP + badge + préparation du Monde 02.
- État du Boss sauvegardé localement.
- Indication dynamique du nombre de missions restantes avant le Boss.
- Expérience plus proche d’un vrai jeu d’aventure pédagogique.


## Nouveautés v9
- Correction complète du thème Light Ivory : titres, paragraphes, textes secondaires, modales, navigation, cartes et boutons ont désormais un contraste sombre adapté.
- Light Ivory conserve les pièces et l’échiquier lisibles.
- Début du Monde 02 « Premières Batailles ».
- Monde 02 verrouillé jusqu’à la victoire contre le Boss du Monde 01.
- 4 nouvelles missions pédagogiques : pièce attaquée, défense, capture et vision de menace.
- Progression du Monde 02 sauvegardée localement.
- Enchaînement Mission suivante dans le nouveau monde.


## v13 — reconstruction stable
- Repart de la v9 avant les correctifs qui ont cassé l'initialisation.
- Réparation structurelle de saveProgress() et du système Boss.
- Le Boss du Monde 01 s'ouvre depuis la carte d'Aventure.
- Le Monde 02 reste conservé.
- Plateau conservé sur le moteur stable et cases transformées en boutons interactifs.
- Refonte finale du contraste Light Ivory : surfaces claires = texte sombre, zones sombres = texte clair.


## v14 — correctif de démarrage
- Le jeu ne dépend plus obligatoirement de localStorage pour démarrer.
- Si le navigateur bloque le stockage local, EchecTuto continue à fonctionner en session.
- Cela évite le symptôme : échiquier absent + Aventure inactive + écran d’introduction bloquant.
- Les sauvegardes persistent normalement lorsque le navigateur autorise le stockage.


## v15 — correctif final d'interaction
- L'écran d'introduction devenait transparent mais pouvait encore intercepter les clics.
- Une fois l'introduction terminée, il passe désormais en pointer-events:none + visibility:hidden.
- Les boutons, l'Aventure et l'échiquier restent donc réellement cliquables.


## v16 — Themes overhaul + étape suivante
- Reconstruction systématique du thème Light Ivory avec séparation stricte :
  - surfaces claires → textes sombres ;
  - cartes sombres → textes ivoire.
- Ajout d’un nouveau thème : « Champagne Élégant ».
- Champagne Élégant est un thème clair premium plus chaleureux avec contraste renforcé.
- Correction spécifique des textes de Coach IA, Aventure, missions, cartes, profil, boutique, défis et jeu.
- Ajout d’un encart « Visibilité / Contraste renforcé » dans le sélecteur de thèmes.
- Conservation du plateau premium avec contraste spécifique au nouveau thème.

- Correctif final v16 : « Champagne Élégant » est maintenant sélectionnable directement dans le panneau Apparence.


## v17 — Déverrouillage Monde 02 + étape suivante
- Correction du passage Monde 01 → Monde 02 après victoire contre le Boss.
- Le bouton du Monde 02 devient immédiatement actif après la victoire.
- Ajout d’un bouton « Accéder au Monde 02 » dans l’écran de victoire du Boss.
- Le déverrouillage reste persistant via le stockage local quand il est disponible.
- Ajout de la prochaine étape : Boss du Monde 02 « La Sentinelle des Menaces ».
- Ce Boss se débloque après les 4 missions du Monde 02.


## v18 — correction définitive Monde 01 → Monde 02
- La carte du Monde 02 possède désormais de vrais identifiants, une progression et un bouton d’accès.
- Suppression des mauvais noms internes `world2CompletedIds` et `world2Hub`.
- Après victoire du Boss du Monde 01, « Entrer dans le Monde 02 » apparaît immédiatement.
- La progression existante du Boss Monde 01 est conservée grâce à la même clé de sauvegarde.
- Les 4 missions du Monde 02 sont désormais reliées séquentiellement.
- Ajout du Boss Monde 02 : « La Sentinelle des Menaces ».
- Après les 4 missions, le Boss se déverrouille.
- Ajout de l’aperçu de la prochaine étape : Monde 03 « Royaume des Tacticiens ».


## v19 — Rejouer Monde 01 + étape suivante
- Le Monde 01 peut désormais être rouvert après l’avoir terminé.
- Toutes les missions déjà réussies du Monde 01 peuvent être rejouées.
- Le Boss « Le Gardien des 64 Cases » peut être réaffronté autant de fois que souhaité.
- Le mode rejeu n’ajoute pas de récompense principale supplémentaire : principe anti-farming conservé.
- Ajout d’une section « Archives d’entraînement » pour les mondes terminés.
- Préparation de la logique globale : tous les mondes terminés resteront rejouables à l’avenir.

- Correctif d’interface v19 : le bouton « Rejouer le Monde 01 » est maintenant réellement visible sur la carte du Monde 01.
- Le bloc « Archives d’entraînement » est désormais affiché sous la carte des mondes.


## v20 — flux Boss Monde 01 corrigé
- Suppression du bouton supplémentaire « Rejouer le Monde 01 » sous la carte du Royaume de l’Échiquier.
- Après victoire contre le Boss, le bouton du Boss devient « Rejouer » et fonctionne réellement.
- Après une victoire contre le Boss, le bouton principal devient « Mission suivante → Monde 02 ».
- « Mission suivante » ouvre directement le Monde 02.
- Les replays du Boss ne redonnent pas la récompense principale.


## v21 — comportement exact demandé pour le Boss du Monde 01
- Aucun nouveau bouton « Recommencer » n’est ajouté sous le Royaume de l’Échiquier.
- Dans les missions normales du Monde 01, le bouton générique « Recommencer » en bas est masqué.
- Après avoir vaincu Le Gardien des 64 Cases, le bouton du Boss devient « Rejouer ».
- « Rejouer » relance réellement une nouvelle tentative du Boss sans effacer la progression.
- Après la victoire, « Mission suivante → Monde 02 » ouvre directement le hub de Premières Batailles.
- Les replays du Boss ne redonnent pas la récompense principale.


## v22 — restauration visuelle et contraste
- La bonne case sur l’échiquier pédagogique est de nouveau fortement surlignée.
- Une bonne réponse affiche maintenant un contour vert lumineux + halo + coche visible.
- Les mauvaises cases disposent d’un contour rouge renforcé.
- Les états de réussite ne peuvent plus être effacés visuellement par Light Ivory ou Champagne.
- Les boutons « Jouer », « Rejouer », « Mission suivante » et les boutons Boss retrouvent une taille et un contraste importants.
- Les cartes Boss sont de nouveau visuellement mises en avant.
- Les thèmes Light Ivory et Champagne disposent de boutons brun foncé / texte ivoire à contraste renforcé.
- Sur mobile, les actions principales gardent une hauteur confortable.


## v23 — Boss Monde 01 rallumé + progression suivante
- Le Boss du Royaume de l’Échiquier ne paraît plus « éteint » lorsqu’il est disponible ou déjà vaincu.
- La carte Boss distingue désormais trois états visuels : verrouillé, disponible, vaincu/rejouable.
- Après victoire, la carte affiche « BOSS VAINCU • REJOUABLE ».
- Le bouton « Rejouer » reste pleinement contrasté et interactif.
- Light Ivory et Champagne disposent d’un état Boss clair à contraste renforcé.
- Étape suivante : ajout d’un bandeau de transition visible Monde 01 → Monde 02 dans l’Aventure.


## v24 — alignement des mondes
- Le bandeau « Monde 01 → Monde 02 » a été déplacé hors de la grille des mondes.
- Monde 01, Monde 02 et Monde 03 s’affichent désormais sur la même ligne sur desktop.
- Sur tablette : 2 colonnes.
- Sur smartphone : 1 colonne.
- Les cartes gardent la même hauteur et le même alignement visuel.


### Correctif final v24
- La ligne décorative `world-path` ne compte plus comme une cellule de la grille.
- Les Mondes 01, 02, 03 et 04 occupent maintenant réellement les quatre colonnes de la même ligne sur desktop.


## v25 — Boss du Monde 02 jouable
- Correction du déverrouillage après les 4 missions de Premières Batailles.
- Le bouton « Affronter la Sentinelle » devient réellement actif.
- Le Boss Monde 02 ouvre correctement son épreuve.
- La bonne réponse `f7` est maintenant validée avec surbrillance.
- Après victoire, le Boss devient rejouable.
- Le bouton « Rejouer » relance une nouvelle tentative sans supprimer la progression.
- L’état visuel du Boss Monde 02 distingue verrouillé, disponible et vaincu/rejouable.


## v26 — Monde 03 : Royaume des Tacticiens
- Le Boss du Monde 02 débloque maintenant le Monde 03.
- Nouveau hub complet « Royaume des Tacticiens ».
- 5 missions : fourchette, clouage, enfilade, attaque découverte et lecture tactique.
- Progression séquentielle sauvegardée.
- Nouveau Boss : « Viper, l’Œil Tactique ».
- Viper se débloque après les 5 missions.
- Récompense Boss : +300 XP + Badge Œil Tactique.
- Missions et Boss restent rejouables en entraînement.


## v27 — Monde 04 : Royaume du Mat
- Viper débloque désormais le Monde 04.
- 5 missions : reconnaître l’échec, fermer une fuite, dernière rangée, coordination dame/roi, mat en un.
- Nouveau Boss : Le Roi de Fer.
- Progression sauvegardée, déverrouillage séquentiel et rejouabilité.
- Première victoire Boss : +400 XP + Badge Mat Royal.
- Transition directe Monde 03 → Monde 04.

## v28 — Monde 05 : Royaume du Développement
- Le Roi de Fer débloque le Monde 05.
- 6 missions : centre, cavaliers, fou, roque, tempo et coordination.
- Nouveau Boss : Orion, le Commandant.
- Progression séquentielle sauvegardée et missions rejouables.
- Première victoire Boss : +500 XP + Badge Commandant.
- Transition directe Monde 04 → Monde 05.

## v29 — Monde 06 : Royaume du Stratège
- Orion débloque désormais le Monde 06.
- 6 missions : structure de pions, case forte, colonne ouverte, espace, pire pièce et construction d’un plan.
- Nouveau Boss : Atlas, l’Architecte.
- Progression sauvegardée, déverrouillage séquentiel et rejouabilité.
- Première victoire Boss : +650 XP + Badge Architecte.
- Transition directe Monde 05 → Monde 06.

## v30 — Monde 07 : Royaume des Finales
- Atlas débloque désormais le Monde 07.
- 7 missions : roi actif, pion passé, règle du carré, opposition, tour derrière le pion, promotion sans pat et conversion d’avantage.
- Nouveau Boss : Fortress, le Gardien des Finales.
- Progression sauvegardée, déverrouillage séquentiel et rejouabilité.
- Première victoire Boss : +800 XP + Badge Gardien des Finales.
- Transition directe Monde 06 → Monde 07.

## v31 — Monde 08 : Royaume du Calcul
- Fortress débloque désormais le Monde 08.
- 7 missions : coups candidats, profondeur de calcul, comparaison de variantes, visualisation, coup intermédiaire et calcul sous pression.
- Nouveau Boss : Mirror, l’Oracle.
- Progression sauvegardée, déverrouillage séquentiel et rejouabilité.
- Première victoire Boss : +1000 XP + Badge Oracle du Calcul.
- Transition directe Monde 07 → Monde 08.

## v32 — Monde 09 : Royaume de la Défense
- Mirror débloque désormais le Monde 09.
- 7 missions : menace, défense, prophylaxie, sécurité du roi, pièce clouée, contre-jeu et résistance.
- Nouveau Boss : Aegis, la Sentinelle.
- Première victoire : +1200 XP + Badge Bouclier Royal.
- Boss et missions rejouables sans farming de la récompense principale.
- Transition directe Monde 08 → Monde 09.

## v33 — Campagne principale complète : Mondes 10, 11 et 12
- Monde 10 : Royaume de la Compétition — 7 missions + Chronos, le Maître du Temps.
- Monde 11 : Royaume des Maîtres — 7 missions + Titan, le Maître.
- Monde 12 : La Citadelle — 7 épreuves intégrales + Grand Maître de la Citadelle.
- Transitions automatiques Monde 09 → 10 → 11 → 12.
- Tous les Boss restent rejouables ; récompenses principales attribuées une seule fois.
- La victoire finale affiche « Campagne principale terminée ✓ ».
- La structure des 12 mondes de la campagne Lite est désormais implémentée.

## v34 — Premier vrai moteur d’exercices d’échecs
- Monde 03 entièrement converti en positions avec pièces.
- Interaction en deux temps : sélectionner la pièce puis sa destination.
- Missions : fourchette, clouage, enfilade, attaque découverte et coup calme.
- Viper utilise désormais une vraie position sur l’échiquier.
- Surlignage source/destination, erreurs visuelles et rejouabilité conservée.
- Progression, récompenses, Boss et transition vers le Monde 04 préservés.

## v35 — Architecture officielle des niveaux de difficulté
- Les 12 mondes historiques constituent désormais le niveau 01 « Très facile » dans la progression globale.
- La génération commencée en v34 est identifiée comme niveau 02 « Facile ».
- Échelle préparée : Très facile → Facile → Moyen → Difficile → Très difficile → Expert → Maître → Grand Maître.
- Chaque palier est prévu pour 12 mondes thématiques, avec difficulté pédagogique et adversaires croissants.
- Le Monde 03 déjà converti en v34 est explicitement marqué « REAL CHESS • FACILE ».
- Les clés de progression existantes ne sont pas supprimées afin de préserver les sauvegardes.
- Les prochains travaux doivent convertir progressivement les autres mondes du palier Facile vers de vraies positions et séquences de coups.

## v36 — Économie cumulative, boutique fonctionnelle et bandeaux aléatoires
- XP, Pièces et Étoiles sont désormais conservés dans un portefeuille persistant.
- Les récompenses XP s’additionnent réellement ; une conversion Lite ajoute aussi des Pièces gagnées en jouant.
- La boutique Lite devient opérationnelle : achat, possession et équipement de cosmétiques.
- Les achats utilisent seulement les Pièces gagnées en jeu, sans avantage pay-to-win.
- Bandeaux aléatoires ajoutés sur les cartes de mondes : Mission du jour, Bonus XP, Tactique, Défi rapide, Coach IA, etc.
- Les bandeaux apparaissent de façon non systématique afin de préserver l’effet premium et la surprise.

## v37 — HUD des points, vies et chrono
- Le portefeuille flottant n’affiche plus l’XP afin d’éviter le doublon avec la bannière d’accueil.
- Le portefeuille de jeu se concentre sur les monnaies utilisables (Pièces et Étoiles).
- Chaque mission démarre avec 3 vies.
- Une mauvaise réponse retire désormais 1 vie.
- À 0 vie, la tentative s’arrête et le joueur doit recommencer la mission.
- Chaque mission possède un chrono visible MM:SS.
- Le chrono démarre à l’ouverture/réinitialisation de la mission et s’arrête à la réussite ou à l’échec total.
- Les éléments de progression, économie et boutique de v36 sont conservés.

## v38 — HUD fusionné + mécanique cumulative par niveau
- La bannière flottante des points est supprimée.
- XP, Pièces et Étoiles sont désormais intégrés directement à la bannière d’accueil.
- Le mini-profil de la barre supérieure n’affiche plus un second compteur XP.
- Le chrono montant de v37 est remplacé par une architecture dépendante du niveau.
- Très facile : aucun chrono, temps libre.
- Facile : compte à rebours de 2:00 par tentative.
- À 00:00 : tentative terminée et bouton « Recommencer la mission ».
- Les 30 dernières secondes changent visuellement ; les 10 dernières sont critiques.
- Architecture préparée pour que chaque niveau ajoute une mécanique cumulative :
  Moyen = moins d’indices ; Difficile = réponses adverses ; Très difficile = 2 vies ;
  Expert = variantes profondes ; Maître = 1 vie ; Grand Maître = pression maximale.
- La campagne v34+ est traitée comme le niveau « Facile ».

## v39 — Boucle de victoire, récompenses animées et boutique modale
- Chaque réussite affiche une fenêtre « Félicitations, vous avez gagné ! ».
- La fenêtre détaille les récompenses obtenues : XP, Pièces, Étoiles et badge si applicable.
- Les récompenses sont animées vers les compteurs cumulés de la bannière d’accueil.
- Les compteurs XP/Pièces/Étoiles augmentent visuellement jusqu’à leur nouveau total.
- Les gains continuent d’être sauvegardés de façon persistante.
- La boutique reste visible sur la page web.
- Un clic sur « Boutique » / « Ouvrir la boutique » ouvre désormais une fenêtre modale animée.
- Les cartes de la boutique utilisent animation d’apparition, flottement et orbite.
- Achat, possession et équipement fonctionnent aussi depuis la fenêtre modale.

## v40 — Correctif de fonctionnement v39
- Le script principal est maintenant chargé après les fenêtres modales dans le DOM.
- Les événements Fermer / Continuer de la victoire sont réellement reliés.
- Tous les liens « Boutique » ouvrent la boutique modale.
- « Ouvrir la boutique » fonctionne également.
- Les anciennes missions utilisant `addXP()` transmettent maintenant leur vrai montant à la fenêtre de récompense.
- La récompense n’est plus perdue entre l’ajout des points et l’affichage de la victoire.
- Les fonctions de v39 (animation des gains, compteurs cumulés, achats et équipement) sont conservées.

## v41 — Correctif racine récompenses + boutique
- Correction du bug structurel introduit en v36 : l’économie était accidentellement imbriquée dans `safeStorage.setItem`.
- `playerEconomy`, `ECONOMY_KEYS`, les achats et les récompenses sont désormais réellement disponibles au niveau global.
- Monde 11 / niveau Facile : chaque réussite déclenche explicitement la fenêtre de victoire.
- Première validation : XP + Pièces + Étoile sont attribués et affichés.
- Rejouer une mission : victoire affichée, mais aucune récompense principale dupliquée (anti-farming).
- Nouvelle animation : les gains se dispersent depuis la fenêtre de victoire, puis s’envolent vers XP/Pièces/Étoiles de la bannière principale avant que les totaux ne s’incrémentent visuellement.
- Le bouton « Ouvrir la boutique » est maintenant placé en haut du visuel de la boutique.
- Navigation Boutique + bouton principal utilisent aussi une délégation d’événements robuste.
- Achat / équipement utilisent le même portefeuille persistant.

## v42 — Une seule boutique visible
- La deuxième boutique complète du bas de page est retirée de l’affichage principal.
- Son contenu reste disponible dans la fenêtre Boutique animée.
- La première section Boutique reste visible dans le site.
- Le bouton « Boutique » est placé à droite de la phrase :
  « Échiquiers, pièces, effets, avatars, cadres, thèmes et collections — sans pay-to-win. »
- Le bouton ouvre la fenêtre Boutique avec catalogue, achats et équipement.

## v43 — Boutique profonde + Profil
- Le compteur de Pièces de la fenêtre Boutique est éloigné du bouton de fermeture.
- Les produits visuels de la première section Boutique sont aussi disponibles dans la fenêtre Boutique.
- Les boutons d’achat de la section visible ouvrent directement la Boutique sur l’item concerné.
- Si le joueur n’a pas assez de Pièces : message explicite « Fonds insuffisants » avec prix requis et solde actuel.
- Le bouton Boutique de la bannière d’accueil ouvre maintenant la Boutique.
- Un clic sur le Profil ouvre une fenêtre dédiée avec niveau, XP, Pièces, Étoiles, difficulté et progression.

## v44 — Profil + navigation Boutique
- Le bouton × de la fenêtre Profil ferme désormais la fenêtre via un gestionnaire d’événement robuste.
- Un clic sur le fond sombre ferme aussi le Profil.
- La touche Échap ferme également la fenêtre Profil.
- Le bouton « Boutique » de la bannière d’accueil ne déclenche plus la fenêtre Boutique.
- Il fait désormais défiler la page jusqu’à la section Boutique visible.
- Le bouton Boutique situé dans la section Boutique continue, lui, d’ouvrir la fenêtre complète du catalogue.

## v45 — Vitrine et vraie Boutique séparées
- Les objets visuels de la section Boutique de la page sont désormais purement illustratifs.
- Aucun achat n’est possible directement depuis cette vitrine.
- Ces mêmes objets sont repris dans la fenêtre « La Boutique EchecTuto » comme vrais articles.
- Dans la vraie Boutique : prix en Pièces, bouton Acheter, contrôle du solde et message « Fonds insuffisants ».
- Les achats des articles de vitrine sont persistants et marqués « Acheté ».
- L’article à 2 400 Pièces est inclus dans le catalogue marchand.

## v46 — Boutique illustrée
- Direction artistique basée sur la maquette Boutique EchecTuto validée.
- Les cartes de la vraie Boutique ont désormais un visuel correspondant à leur catégorie : échiquier, pièces, effet, avatar, cadre, thème ou collection.
- Les animations existantes (orbite, glow, hover) sont conservées et superposées aux nouveaux visuels.
- Une bannière d’aperçu de la direction artistique est intégrée en haut du catalogue.

## v47 — Échiquiers découpés en vrais assets individuels
- La grande maquette Boutique n’est plus utilisée comme une image unique pour les produits.
- 12 échiquiers ont été extraits et enregistrés comme fichiers WebP indépendants.
- Chaque carte produit charge maintenant son propre visuel :
  Classique Bois, Marbre Impérial, Glace Éternelle, Forêt Enchantée, Volcanique, Cosmos,
  Dragon Royal, Or Royal, Futuriste, Jardin Zen, Divin et Ombre Éternelle.
- Les images conservent zoom/hover/glow.
- Achat réel avec Pièces, vérification des fonds, persistance de possession.
- Après achat, un échiquier peut être équipé depuis la Boutique.

## v48 — Correction réelle du catalogue d’échiquiers
- Correction du bug v47 : le bloc d’échiquiers avait été injecté au milieu du gestionnaire d’achat d’anciens articles.
- `renderShopModal()` a été entièrement réécrit proprement.
- Les 12 échiquiers avec images indépendantes sont désormais rendus en premier dans la Boutique.
- Achat, fonds insuffisants, possession et équipement sont isolés et fonctionnent indépendamment.
- Ajout d’un fallback visuel si une image ne peut pas être chargée.
- Le script principal est replacé tout à la fin du `body`.

## v49 — Correctif ouverture Boutique
- Cause identifiée : `openShopModal()` avait disparu du JavaScript en v48.
- Fonction `openShopModal()` recréée explicitement.
- Fonction `closeShopModal()` recréée explicitement.
- Un seul gestionnaire d’événements ouvre/ferme désormais la Boutique.
- Le bouton de la section Boutique ouvre le modal.
- Le bouton Boutique de la bannière d’accueil reste un raccourci de défilement vers la section.
- Le modal est forcé en `display:flex` uniquement lorsqu’il possède la classe `.open`.

## v50 — Échiquiers image-first
- Suppression des boutons HTML ajoutés sous les images des échiquiers.
- Les boutons dessinés dans les visuels restent visibles et font partie de l’image.
- La zone image entière est interactive pour acheter ou équiper l’échiquier.
- Les images sont affichées avec `object-fit: contain` afin d’être visibles en entier.
- La grande section image d’aperçu sous « Échiquiers, pièces, effets, avatars, cadres, thèmes et collections — sans pay-to-win. » est supprimée.

## v51 — Achat et équipement des échiquiers
- Chaque échiquier non possédé affiche son prix et un bouton Acheter.
- Le bouton Acheter vérifie le solde et affiche « Fonds insuffisants » si nécessaire.
- Après achat, le prix et le bouton Acheter disparaissent ; la carte affiche « Possédé ».
- Un échiquier possédé mais non équipé affiche une icône ⚔ pour l’équiper.
- Un seul échiquier peut être équipé à la fois.
- Quand un nouvel échiquier est équipé, le badge « Équipé » disparaît automatiquement de l’ancien et apparaît sur le nouveau.
- L’échiquier actif est aussi affiché dans l’en-tête de la Boutique et dans le Profil.

## v52 — Fonds insuffisants + monnaie ETS
- Le message « Fonds insuffisants » apparaît désormais dans une alerte visible de la Boutique et directement sur la carte concernée.
- Le message indique le prix, le solde actuel et le montant ETS manquant.
- L’affichage du solde est déplacé près de la fin de la phrase « sans pay-to-win. ».
- L’icône de Pièce est remplacée par l’unité texte `ETS`.
- Les prix des échiquiers sont affichés en ETS.

## v53 — Solde ETS visible + Boutique agrandie et centrée
- Le solde Boutique utilise désormais explicitement `playerEconomy.coins`.
- Le montant ETS est rafraîchi à chaque ouverture de la Boutique.
- Le compteur utilise un identifiant dédié `shopETSBalance` en plus du système global `data-economy="coins"`.
- La fenêtre Boutique est agrandie jusqu’à 1320 px / 96 vw.
- La fenêtre est centrée horizontalement et verticalement avec `margin:auto` et sans transform parasite.

## v55 — Boutique plus grande, centrée, solde ETS visible
- Fenêtre Boutique élargie jusqu’à 1480 px / 99 vw.
- Marges extérieures fortement réduites.
- Centrage horizontal et vertical forcé.
- Nouveau bloc clair `Solde` dans l’en-tête.
- Le solde affiche explicitement `X ETS` et se synchronise avec `playerEconomy.coins`.
- Le solde est rafraîchi à l’ouverture et lors de chaque mise à jour économique.

## v56 — Fonds insuffisants fiabilisé + échiquier réellement équipé
### Achat
- Vérification stricte `solde ETS < prix` avant toute déduction.
- Message global visible et persistant dans la Boutique.
- Message local sur la carte concernée.
- Affichage du prix, du solde et du montant exact manquant.
- Bouton momentanément désactivé pour éviter les doubles clics.
- Confirmation distincte après achat réussi.

### Étape suivante
- L’échiquier équipé dans la Boutique applique désormais un thème visuel au plateau de jeu.
- Les 12 échiquiers ont chacun une palette de cases, cadre et halo dédiée.
- Changer d’échiquier remplace immédiatement l’ancien thème.
- Le choix reste persistant après rechargement.
- Les surbrillances pédagogiques vertes/rouges restent prioritaires.

## v57 — Feedback Boutique raccourci
- « Fonds insuffisants » reste visible 1 seconde.
- Le message local de la carte disparaît également après 1 seconde.
- Après Acheter, la carte reste visible pendant 1 seconde avec « Acheté ✓ » avant de passer à l’état Possédé.
- Les confirmations d’équipement sont également ramenées à 1 seconde.

## v58 — Une carte achetée ne disparaît plus
- Après achat, la carte reste strictement à la même place.
- Aucun rerender complet de la Boutique n’est effectué après achat.
- Pendant 1 seconde, le bouton affiche `Acheté ✓`.
- Ensuite, la même carte passe en état `Possédé`.
- L’icône d’équipement apparaît directement sur cette même carte.
- L’état équipé est mis à jour sans retirer la carte.
- Le plateau actif continue de changer immédiatement selon l’échiquier équipé.

## v59 — Cartes totalement stables + en-tête simplifié
- Suppression du doublon `Échiquier actif`.
- Seul `Plateau actif : …` reste affiché en haut.
- Après achat, la carte ne disparaît plus et ne revient plus : aucun rerender global.
- La carte passe immédiatement en état `Possédé`.
- Le feedback `Acheté ✓` reste uniquement comme confirmation transitoire.
- L’équipement se met à jour en place.
- L’échiquier équipé reçoit un halo discret pour être identifiable immédiatement.

## v60 → v66 — 7 étapes de progression Boutique

1. **v60 — Équipement stable** : suppression du dernier rerender de carte lors de l’équipement ; achat et équipement restent en place.
2. **v61 — Filtres** : Tous, À acheter, Possédés et Favoris.
3. **v62 — Tri** : catalogue, prix croissant/décroissant, rareté et nom.
4. **v63 — Favoris** : étoile persistante sur chaque échiquier et vue dédiée.
5. **v64 — Historique** : achats enregistrés avec nom, prix ETS et date/heure.
6. **v65 — Détail rapide** : clic sur les informations ou double-clic sur le visuel pour ouvrir un aperçu agrandi.
7. **v66 — Collection** : compteur `possédés / total`, barre de progression et état équipé renforcé.

Toutes ces fonctions conservent le principe essentiel : **acheter ou équiper un échiquier ne recharge plus la Boutique et ne fait plus disparaître sa carte**.

## v67 → v76 — 10 étapes supplémentaires

1. **v67 — Recherche instantanée** : recherche par nom, description ou rareté.
2. **v68 — Filtres de rareté** : Commun, Rare, Épique, Légendaire.
3. **v69 — Filtre “Solde suffisant”** : n’affiche que les échiquiers déjà possédés ou actuellement achetables.
4. **v70 — Tri recommandé** : favoris, accessibilité, possession et rareté influencent l’ordre.
5. **v71 — Aperçu temporaire sur le plateau** : prévisualiser un échiquier avant achat sans le posséder ni l’équiper.
6. **v72 — Consultés récemment** : mémorisation persistante des derniers échiquiers ouverts.
7. **v73 — Paliers de collection** : 25 %, 50 %, 75 % et 100 % avec titres de collection.
8. **v74 — Barre d’outils collante** : les filtres restent disponibles pendant le défilement de la Boutique.
9. **v75 — Accessibilité clavier** : navigation entre cartes avec les flèches et ouverture avec Entrée.
10. **v76 — Statistiques Boutique** : nombre possédé, nombre actuellement accessible avec le solde ETS et nombre de légendaires possédés.

La règle de stabilité est conservée : acheter/équiper ne doit jamais faire disparaître une carte.

## v77 → v86 — 10 étapes supplémentaires

1. **v77 — Préférences persistantes** : recherche, tri, rareté, filtre de prix, solde suffisant et masquage des possédés sont mémorisés.
2. **v78 — Filtre par prix** : 0–1 000, 1 001–2 000, 2 001–3 000, 3 001+ ETS.
3. **v79 — Masquer les possédés** : vue concentrée sur ce qu’il reste à acquérir.
4. **v80 — Découverte aléatoire** : ouvre un échiquier au hasard parmi la sélection filtrée.
5. **v81 — Comparaison** : jusqu’à trois échiquiers peuvent être placés dans un plateau comparatif.
6. **v82 — Aperçu rapide** : survol ou focus d’une carte prévisualise temporairement son thème sur le plateau.
7. **v83 — Reçu d’achat** : prix, solde avant et solde après, sans modifier le système économique.
8. **v84 — États vides améliorés** : bouton de réinitialisation lorsqu’aucun produit ne correspond aux filtres.
9. **v85 — Raccourci clavier** : Ctrl/Cmd + K place le focus dans la recherche lorsque la Boutique est ouverte.
10. **v86 — Motion & mobile polish** : comparaison/reçu responsives et respect de `prefers-reduced-motion`.

Les achats et équipements continuent de modifier les cartes en place, sans rerender qui les ferait disparaître.

## v87 → v116 — 30 étapes supplémentaires
1. **v87 — Centre de collection repliable**
2. **v88 — Valeur totale de la collection en ETS**
3. **v89 — Indicateur de rareté moyenne**
4. **v90 — Calcul automatique du prochain palier de collection**
5. **v91 — Projection du budget après le prochain achat accessible**
6. **v92 — Galerie horizontale des échiquiers possédés**
7. **v93 — Accès au détail depuis la galerie possédée**
8. **v94 — Action rapide « Moins cher »**
9. **v95 — Action rapide « Plus rare »**
10. **v96 — Action rapide « Un favori »**
11. **v97 — Action rapide « Achetable maintenant »**
12. **v98 — Effacement rapide de la recherche**
13. **v99 — Liste d’envies synthétique**
14. **v100 — Valeur totale des favoris non possédés**
15. **v101 — Recommandation dynamique selon solde, rareté et favoris**
16. **v102 — Carte de recommandation ouvrable**
17. **v103 — Flux d’activité Boutique persistant**
18. **v104 — Enregistrement des achats dans l’activité**
19. **v105 — Enregistrement des équipements dans l’activité**
20. **v106 — Synchronisation instantanée après ajout/retrait d’un favori**
21. **v107 — Badge « Achetable » directement sur les cartes**
22. **v108 — Badge « Souhait » pour les favoris non possédés**
23. **v109 — Affichage du solde restant après achat possible**
24. **v110 — Affichage du montant manquant si achat impossible**
25. **v111 — Synchronisation des KPI après achat**
26. **v112 — Synchronisation des KPI après équipement**
27. **v113 — Centre de collection responsive tablette**
28. **v114 — Centre de collection responsive mobile**
29. **v115 — Conservation des règles anti-clignotement des cartes**
30. **v116 — Consolidation du tableau de bord Boutique/Collection**

## v117 → v126 — Réorganisation Boutique / Inventaire
1. **v117 — Tri Boutique simplifié : Pertinence, Prix croissant, Prix décroissant**
2. **v118 — Centre de collection retiré de la Boutique principale**
3. **v119 — Nouvelle fenêtre indépendante « Collection »**
4. **v120 — Bouton Collection ajouté à l’inventaire du joueur**
5. **v121 — Liste d’envies, Activité et Recommandation retirées de la Boutique**
6. **v122 — Nouvelle fenêtre indépendante « Favoris »**
7. **v123 — Bouton Favoris ajouté à l’inventaire avec compteur**
8. **v124 — Bouton Acheter corrigé : hauteur, largeur, visibilité et responsive**
9. **v125 — Navigation fenêtres améliorée : fond cliquable, Échap, focus clavier**
10. **v126 — Synchronisation des compteurs Collection/Favoris après achat, équipement et favoris**

## v127 → v146 — 20 étapes hors Boutique : cœur du jeu
1. **v127 — Centre de commande joueur intégré à l’Aventure**
2. **v128 — Bouton Reprendre basé sur le premier monde réellement disponible**
3. **v129 — Progression globale de la campagne Facile**
4. **v130 — Compteur réel des missions validées sur les 12 mondes**
5. **v131 — Compteur réel des Boss vaincus**
6. **v132 — Identification automatique du prochain Boss**
7. **v133 — Série d’activité quotidienne persistante**
8. **v134 — Objectif quotidien : valider une mission**
9. **v135 — Objectif quotidien : progresser jusqu’à un Boss**
10. **v136 — Objectif quotidien : revoir un monde terminé**
11. **v137 — Objectif hebdomadaire de 10 missions**
12. **v138 — Carte rapide des 12 mondes avec états verrouillé/actif/terminé**
13. **v139 — Navigation directe depuis la carte rapide**
14. **v140 — Résumé de session XP / ETS / Étoiles / durée**
15. **v141 — Centre de notifications lié aux paliers de campagne**
16. **v142 — Compteur de notifications non lues + Tout marquer lu**
17. **v143 — Archives d’entraînement enrichies avec nombre de mondes terminés**
18. **v144 — Mode Focus pour isoler l’Aventure et réduire les distractions**
19. **v145 — Raccourcis clavier R = Reprendre, N = Notifications**
20. **v146 — Indicateur de sauvegarde, responsive et synchronisation automatique du tableau de bord**

## v147 — Hotfix Mission 1 / Niveau 2
- Damier 8×8 restauré à partir des classes `.light` / `.dark`.
- Taille et proportions du plateau sécurisées sur desktop et mobile.
- Démarrage systématique du chrono Facile à 02:00.
- Réinitialisation des vies et du chrono à chaque tentative.
- Missions déjà validées réellement rejouables.
- Mauvaise réponse = perte d’une vie.
- Réussite = arrêt immédiat du compte à rebours.
- Temps écoulé = plateau bloqué jusqu’à recommencer.
- Recalcul du plateau après affichage de la fenêtre.
- Cache Service Worker versionné lorsque possible.

## v148 — Récompenses cumulées et animations victoire/défaite
- Mission 1 du Niveau 2 crédite désormais réellement l’XP et les ETS lors de la première réussite.
- Le montant ETS suit la règle existante : environ 1 ETS pour 20 XP, minimum 1.
- Le portefeuille/HUD se met à jour et l’animation fait voler les récompenses vers les compteurs.
- Le Monde 02 affiche explicitement XP + ETS gagnés.
- Les replays restent sans récompense principale supplémentaire (anti-farming).
- Nouvelle animation visuelle verte lors d’une victoire.
- Le panneau de récompense existant s’ouvre à la réussite.
- Nouvelle animation rouge de défaite lorsque le chrono atteint zéro.
- Nouvelle animation de défaite lorsque toutes les vies sont perdues.
- Bouton « Recommencer la mission » intégré à l’écran de défaite.
- La monnaie est affichée comme ETS dans le HUD et la fenêtre de récompense.

## v149 — Débrief pédagogique après chaque victoire/défaite
- Après l’animation de victoire, fermeture des récompenses → ouverture du débrief pédagogique.
- Après l’animation de défaite, bouton « Voir le débrief » → analyse de l’échec.
- Explication de ce qui s’est passé dans la position.
- Principe clé à retenir.
- Point positif même en cas de défaite.
- En cas de défaite : plusieurs approches de solution, sans donner immédiatement la réponse exacte.
- Habitude concrète à appliquer à la tentative suivante.
- Bouton « Revoir la position » pour recommencer en appliquant le conseil.
- Bouton « Continuer » pour poursuivre la progression.
- Système relié aux données de mission quand elles sont disponibles, avec fallback pédagogique générique.

## v150 → v159 — 10 étapes de débrief adaptatif
1. **v150 — Détection automatique de la compétence travaillée**
2. **v151 — Classification de l’erreur probable**
3. **v152 — Analyse de la gestion du temps**
4. **v153 — Priorité pédagogique suivante**
5. **v154 — Historique persistant des erreurs par type**
6. **v155 — Détection des erreurs récurrentes**
7. **v156 — Recommandation automatique d’un exercice ciblé**
8. **v157 — Justification pédagogique de l’exercice recommandé**
9. **v158 — Checklist personnalisée avant la prochaine tentative**
10. **v159 — Panneau Analyse personnalisée intégré au débrief**

## v160 → v189 — 30 étapes Centre d’apprentissage
1. **v160 — Création du Centre d’apprentissage dans le profil**
2. **v161 — Profil persistant de maîtrise par compétence**
3. **v162 — Score de maîtrise calculé selon réussite, expérience et série**
4. **v163 — États Nouveau / En apprentissage / Compris / Acquis / Maîtrisé**
5. **v164 — Carte visuelle des 8 grandes compétences**
6. **v165 — Détection automatique du point fort actuel**
7. **v166 — Détection automatique de la compétence la plus faible**
8. **v167 — Maîtrise globale agrégée du joueur**
9. **v168 — Taux de réussite des débriefs enregistrés**
10. **v169 — Compteur de parties analysées**
11. **v170 — Système de révision espacée**
12. **v171 — Échéances de révision selon le niveau de maîtrise**
13. **v172 — File des révisions arrivées à échéance**
14. **v173 — Action « Révisé » avec progression contrôlée**
15. **v174 — Série quotidienne d’apprentissage**
16. **v175 — Historique des 40 derniers débriefs**
17. **v176 — Vue des 8 derniers débriefs dans le profil**
18. **v177 — Carte des erreurs récurrentes issue du Coach adaptatif**
19. **v178 — Classement des tendances les plus problématiques**
20. **v179 — Recommandation de prochaine action**
21. **v180 — Priorité automatique aux révisions urgentes**
22. **v181 — Renforcement automatique de la compétence faible**
23. **v182 — Reprise de campagne si aucune faiblesse urgente**
24. **v183 — Conseil de difficulté basé sur maîtrise et réussite récente**
25. **v184 — Préparation au niveau Moyen lorsque les critères sont atteints**
26. **v185 — Objectifs automatiques quotidiens et de maîtrise**
27. **v186 — Progression des objectifs dans le Centre d’apprentissage**
28. **v187 — Courbe simplifiée d’évolution récente**
29. **v188 — Détection d’une tendance En progression / Stable / À consolider**
30. **v189 — Consolidation responsive du profil d’apprentissage et synchronisation avec chaque débrief**

## v190 — Audit complet et corrections
1. Service Worker resté sur le cache v147 : risque réel d'afficher une ancienne version après mise à jour.
2. Débordement horizontal mobile provoqué par l'échiquier héro, ses halos et ses transformations.
3. Fenêtre Profil décalée sur mobile : Collection/Favoris étaient des éléments frères du panneau principal.
4. Monnaie encore affichée comme « Pièces » dans le profil au lieu de ETS.
5. Une chaîne de récompense du Monde 11 affichait encore « Pièces ».
6. Deux systèmes XP indépendants : profil des matchs IA et économie des missions.
7. Les récompenses des matchs IA n'alimentaient pas correctement le portefeuille XP/ETS commun.
8. Les matchs IA contournaient le nouveau flux animation de résultat → analyse.
9. La fin d'un match IA pouvait relancer le compte à rebours d'une mission en arrière-plan.
10. Les matchs IA n'alimentaient pas le Centre d'apprentissage.
11. Une partie nulle était comptée comme une défaite dans le profil pédagogique.
12. Le bouton « Revoir la partie » ne faisait que fermer la fenêtre.
13. Le sélecteur de promotion n'actualisait pas correctement aria-hidden.
14. Le bouton « Révisé » du Centre d'apprentissage pouvait augmenter la maîtrise sans exercice réel.
15. Le bouton Effacer l'historique créait une incohérence : historique vide mais scores de maîtrise conservés.
16. Le raccourci « Inventaire » ouvrait en réalité le profil ; son libellé était trompeur.
17. Le script principal n'était plus réellement en fin de body, rendant les ajouts futurs plus fragiles.
18. De nombreux boutons n'avaient pas type='button', risqué si un formulaire est ajouté plus tard.
19. Le bilan de partie manquait de métadonnées d'accessibilité (dialog/label).
20. Le bilan IA n'affichait pas les ETS gagnés.

## v191 — Audit profond par section
- Aventure : doubles initialisations supprimées ; objectifs exacts masqués avant validation.
- Défis : 3 défis dynamiques avec progression persistante et récompenses XP/ETS réclamables.
- Clans : adhésion/quitter locale fonctionnelle, contribution calculée depuis la vraie progression, aucune fausse donnée serveur.
- Coach IA : conseils basés sur le profil d’apprentissage, compétences synchronisées, accès au Centre d’apprentissage.
- Jouer : typo corrigée, bonus sans aide cohérent (+20 XP), maîtrise ajustée, annulation bloquée après fin de partie.
- Boutique : vitrines reliées à de vrais articles, ETS partout, bug de chargement des préférences corrigé, stockage harmonisé.
- Service Worker : cache v191.

### Deuxième passe de correction v191
- Clans fonctionne aussi lorsque le stockage local est indisponible temporairement.
- Le plateau Comparer de la Boutique est restauré et relié aux boutons existants.
- Les cosmétiques historiques utilisent ETS et se mettent à jour sur place après achat/équipement.
- Suppression du rerender complet de Boutique pour ces objets.
- Correction du libellé OBJECTIF BONUS.

### Troisième passe de correction v191
- Défis possède maintenant un fallback mémoire si le stockage local est bloqué.
- L’objectif par défaut de la modale ne révèle plus e4.
- Le statut Coach devient « Profil synchronisé ».
- Le texte Clans distingue clairement le prototype local du futur multijoueur serveur.
- Le dock mobile donne un accès direct aux 6 sections auditées : Aventure, Défis, Coach, Jouer, Clans, Boutique.

### Nettoyage final v191
- Suppression du moteur Boutique v36 devenu inaccessible et de ses références DOM mortes.
- La Boutique active conserve uniquement le catalogue actuel et les comportements v47+ / v191.
