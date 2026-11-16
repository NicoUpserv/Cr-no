# Retours de Tarek (16 novembre 2026) : ce qui est fait et pourquoi

## 1. Codes couleur du planning

**Demande :** code couleur par enseignant (direction) et par type de véhicule (boîte manuelle, automatique, moto…).

**Fait :**

- **Planning de l'enseignant** : chaque leçon est colorée selon son véhicule :
  - vert : boîte manuelle ;
  - bleu : boîte automatique ;
  - orange : moto ;
  - brun : remorque.
- **Créneaux libres** : en pointillés.
- **Leçons annulées** : en jaune, avec la mention « Annulée ». Le créneau libéré n'est pas redessiné à côté.
- **Direction, « Toute l'équipe »** : un choix « Couleurs : par enseignant / par véhicule ». Avec un seul enseignant affiché, la couleur suit toujours le véhicule.
- Une **légende** sous la semaine.
- **La couleur n'est jamais le seul repère** : le prénom de l'élève (et les initiales de l'enseignant pour la direction) reste écrit dans chaque bloc, pour les personnes qui distinguent mal les couleurs.

**Limites :**

- Le véhicule est **déduit du permis préparé par l'élève** (B-auto → automatique, A1/A2/AM → moto, BE → remorque). En production, il faudra un véhicule par leçon, car un élève en boîte manuelle peut faire une leçon en automatique.
- Au-delà de 8 enseignants, les couleurs reviennent au début de la palette.
- Stych permet de choisir ses couleurs (bouton palette). Ce n'est pas fait.

Code : `theme/tokens.ts` (`couleursCalendrier`), `lib/couleurs-planning.ts`, `features/planning/vehicules.ts`.

## 2. Ce que Tarek a demandé dans ses messages vocaux

| Demande | Décision |
|---|---|
| Le planning s'ouvre sur la semaine | Fait (planning de l'enseignant et de l'élève). |
| Toucher une leçon → toutes les infos de l'élève | Le détail de la leçon s'ouvre, avec un lien vers la fiche de l'élève (progression, dernière leçon, téléphone). |
| « Le cours commence dans 1 h 15 » avec un compteur | Fait. **Adapté** : il s'affiche « Commence dans 1 h 15 », mis à jour toutes les 30 s, puis « En cours · fin dans 20 min ». Un chronomètre à la seconde stresse plus qu'il n'aide. |
| Observation « élève à récupérer devant la gare » | Fait : une consigne de prise en charge, affichée sous le lieu. |
| Dépôt au même lieu par défaut, l'élève peut demander ailleurs | Fait : « Dépôt : même lieu », modifiable jusqu'à la fin de la leçon (lieux de l'auto-école ou domicile de l'élève). |

## 3. Documents, relances, messagerie

- **Les enseignants ne voient plus les pièces du dossier** : ni le filtre « dossier incomplet », ni le nombre de pièces manquantes, ni la ligne « Pièces » de la fiche élève. Seuls la direction et l'élève les voient.
- **Côté direction**, la fiche de l'élève contient « Pièces et relances » :
  - les pièces manquantes et les pièces reçues ;
  - la vérification de chaque pièce (« Conforme » ou « À renvoyer ») ;
  - les relances.
- **Relances automatiques** à J+3, J+7 et J+14 après l'inscription, puis la direction relance à la main (« Relancer maintenant »).
  - Dans l'appli : simulées dans la démo.
  - Par e-mail : **pas encore actif**.
  - Par SMS : possible plus tard, mais payant à chaque envoi.
- **Messagerie élève ↔ auto-école** :
  - L'élève écrit à son auto-école depuis l'onglet Messages, qui était vide jusqu'ici.
  - La direction lit et répond depuis son accueil (« Messages des élèves ») ou depuis la fiche de l'élève.
  - Une pièce refusée ou une relance arrive dans cette conversation.
- **Les enseignants n'ont pas accès aux messages.** C'est à confirmer avec Tarek : ils voudront peut-être prévenir un élève d'un retard.
- La vérification des documents ne passe plus par une boîte de dialogue, qui ne fonctionnait pas sur le web : le choix s'affiche dans la liste.

## 4. Vérifications intérieures et extérieures

**Source :** la banque officielle de la DSR fournie par Tarek. Il y a 100 fiches, numérotées de 00 à 99 (50 VI, 50 VE). Chaque fiche contient une vérification, une question de sécurité routière et une question de premiers secours.

- Les fiches ont été **extraites automatiquement du PDF**, puis vérifiées :
  - test automatique : 100 fiches, 50 VI, 50 VE, aucun champ vide ;
  - relecture humaine : **encore à faire**.
- La version utilisée est celle du **1er janvier 2018**. **Il faut vérifier qu'il n'en existe pas de plus récente** avant la mise en production.
- Le PDF officiel est téléchargeable. Sur téléphone, il est ouvert depuis l'adresse web de la démo.

**Accès :**

- **Élève** : à la fin de la compétence C1, comme le fait Tarek, ou plus tôt si son enseignant l'ouvre (interrupteur sur la fiche de l'élève).
  - L'élève coche les fiches qu'il maîtrise.
  - Remarque : dans le référentiel, les vérifications font partie de la C1 (« Connaître les principaux organes et commandes, faire les vérifications »). Les fermer jusqu'à la fin de C1 est donc un choix pédagogique de Tarek, pas une règle.
- **Enseignant** : toujours accessible (onglet Plus).

**Révision :**

- les fiches classées par zone de la voiture (poste de conduite, habitacle, sous le capot, avant, tour du véhicule, pneumatiques, arrière, coffre) ;
- une recherche par numéro ou par mot-clé ;
- un tirage au hasard comme à l'examen ;
- les réponses masquées, à révéler.

## 5. Voiture 3D

- **Une citadine 5 portes générique**, modélisée en code avec des formes simples : **aucune marque, aucun logo, et pas la forme d'un modèle existant**.
  - Une Clio 5 ou 6 reproduite fidèlement, même sans logo, reste protégée par les dessins et modèles de Renault (« impression d'ensemble »).
  - Les plaques sont fictives (AA-000-AA).
- **Ce qu'on peut faire :**
  - faire tourner la voiture et zoomer ;
  - ouvrir les portes, le capot et le coffre ;
  - allumer les feux ;
  - prendre la vue du poste de conduite ;
  - toucher un point jaune (le nombre de fiches de la zone) : la liste des vérifications s'affiche, avec un bouton vers les fiches.
- **Ce qui est modélisé :**
  - compartiment moteur : jauge et bouchon d'huile, liquide de refroidissement, liquide de frein, lave-glace, batterie ;
  - combiné d'instruments avec ses voyants ;
  - commodos, warning, molette de hauteur des feux ;
  - sièges et attaches Isofix ;
  - triangle, gilet, plaque de pression ;
  - témoin d'usure des pneus ;
  - sécurité enfant, trappe à carburant.
- **Technique :**
  - une page web autonome (`apps/mobile/public/voiture-3d`, three.js, licence MIT) ;
  - affichée dans un cadre sur le web et dans une WebView sur téléphone (`react-native-webview`, inclus dans Expo Go).
  - Sur téléphone, la page est chargée depuis l'adresse web de la démo : **il faut republier le site web** pour qu'elle y soit.
- **Limites honnêtes :**
  - Le rendu est stylisé, pas photoréaliste.
  - Les emplacements sont « typiques » : sur une vraie voiture, ils varient.
  - Je ne l'ai pas encore vue sur un vrai téléphone. Les performances sur un Android d'entrée de gamme ne sont pas vérifiées.

## 6. Vidéos (démo)

Deux vidéos ont été tournées image par image sur la voiture 3D, avec une voix de synthèse française (Windows) :

1. **Sous le capot : repérer les niveaux** (12 fiches) ;
2. **Les pneumatiques : flanc, usure, pression** (8 fiches).

Elles sont accessibles depuis « Vérifications » et depuis chaque fiche concernée.

- La voix de synthèse convient pour la démo. En production, il faudra une vraie voix, ou mieux, **des vidéos tournées par Tarek sur sa voiture**.
- Pour tourner d'autres vidéos : ajouter un scénario dans `SCENARIOS` (`public/voiture-3d/voiture.js`), puis `node scripts/tourner-video.mjs <scénario> http://localhost:8081/voiture-3d/index.html assets/demo/verif-<scénario>.mp4` (Windows, Edge et ffmpeg requis).
