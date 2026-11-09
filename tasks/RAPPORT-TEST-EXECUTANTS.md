# Test des exécutants : DeepSeek V4.1 Flash contre GLM-5.3-Flash

Date : 9 novembre 2026. Orchestrateur et vérificateur : Claude. Modèles gratuits via OpenCode Zen.
Branches de test : `test/deepseek` et `test/glm` (non poussées).

## Méthode

- Même socle, mêmes fiches de tâche (`tasks/0x-*.md`), mêmes règles (`apps/mobile/AGENTS.md`), un worktree par modèle.
- Vérification de chaque livraison : fichiers touchés, `pnpm check` (types, lint avec garde-fous du design system, tests), **tests cachés** que le modèle ne voyait pas, puis relecture du code et rendu à l'écran.
- Les tests cachés ont été validés au préalable contre une implémentation de référence (35/35).

## Résultats

| | DeepSeek V4.1 Flash | GLM-5.3-Flash |
|---|---|---|
| **Tâche 1 — liste des élèves** | ✅ 8/8 cachés, réutilise le design system | ✅ 8/8 cachés, ligne de filtre refaite à la main |
| **Tâche 2 — disponibilités (logique)** | ✅ 9/9 cachés | ✅ 9/9 cachés |
| **Tâche 2 — écran** | Clair : libellés « Début / Fin », champs visibles, erreurs sous chaque champ. Mais encombrant, et le jour se choisit en appuyant plusieurs fois sur « Changer » | Compact mais confus : champs sans bordure ni libellé, colonnes mal alignées. Sélecteurs natifs sur iOS, mais **bug Android** : la liste des 7 jours passe par une alerte qui n'affiche que 3 boutons |
| **Tâche 3 — moteur d'alerte** | ✅ 13/13 cachés, très robuste (fusion des créneaux qui se chevauchent, leçons mal formées ignorées) | ✅ 13/13 cachés, solide (contrôle du format de date) |
| Respect des règles (fichiers, tests imposés, lint) | ✅ irréprochable | ✅ irréprochable |
| Étapes / tokens (3 tâches) | 74 étapes, environ 3,1 M tokens | 98 étapes, environ 3,8 M tokens |
| Corrections nécessaires avant intégration | Petites (UX du choix du jour, densité) | Moyennes (bug Android, lisibilité des champs) |

## Verdict

**DeepSeek V4.1 Flash est retenu comme exécutant**, GLM-5.3-Flash reste en secours.
Les deux sont nettement au-dessus de ce que laissaient craindre les critiques indépendantes : 100 % des tests cachés réussis, y compris sur la logique métier difficile.
Leur point faible commun est l'**expérience utilisateur** : ce qui « fonctionne » n'est pas toujours agréable ou natif. La relecture de l'interface reste indispensable.

## Économie de tokens (estimation honnête)

- Code produit par modèle sur les 3 tâches : environ 1 400 lignes, soit environ 15 000 tokens de sortie si Claude l'avait écrit.
- Supervision dans un fonctionnement normal (un seul exécutant, sans implémentation de référence) : fiche de tâche (environ 1 500 tokens de sortie par tâche) et relecture du diff (environ 15 000 tokens d'entrée, 5 fois moins chers que la sortie).
- **Gain estimé : de 60 à 70 % sur les tâches bien spécifiées.** Sur ce test précis, le gain est nul : deux modèles, implémentations de référence et tests cachés, soit un surcoût ponctuel de mise en place.
- Pas rentable pour : la sécurité (droits d'accès entre auto-écoles), les paiements, l'architecture, les écrans signature du design. Ces parties restent à Claude.

## Organisation retenue

1. Claude écrit la fiche (contrat exact, fichiers autorisés, critères) et, pour la logique, des tests cachés.
2. DeepSeek exécute dans un worktree.
3. Claude vérifie : `pnpm check`, tests cachés, relecture, rendu. Au besoin, une seule correction demandée, sinon Claude corrige lui-même.
4. Fusion dans la branche principale.

## Corrections à faire avant de fusionner la version DeepSeek

- Choix du jour et du motif : sélecteur natif (feuille d'actions sur iOS, menu Material sur Android) au lieu de « Changer » en boucle.
- Créneaux plus compacts (jour, début, fin sur une ligne), suppression par balayage.
- Côté socle (Claude) : sur le web, la barre d'onglets du haut cache le titre et élargit la page ; à corriger.
