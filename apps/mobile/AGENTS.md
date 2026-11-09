# Créno — règles du projet (à lire avant toute modification)

Application Expo / React Native (iOS, Android, web) pour auto-écoles françaises.
Langue du code, des commentaires et de l'interface : **français**.
Produit : voir `PRODUCT.md`. Ne rien inventer qui n'y figure pas.

## Commandes

```bash
pnpm typecheck   # TypeScript strict
pnpm lint        # ESLint (inclut les garde-fous du design system)
pnpm test        # Jest
pnpm check       # les trois : DOIT passer avant de considérer une tâche terminée
```

Ne jamais ajouter de dépendance sans que la fiche de tâche l'autorise.

## Architecture

```
src/
  app/                    Écrans (Expo Router). Un fichier = une route.
    (tabs)/               Onglets natifs : (aujourdhui), eleves, planning, parcours, plus
      eleves/[id].tsx     ÉCRAN DE RÉFÉRENCE : le copier comme modèle
  components/ui/          Design system : Texte, Ligne, Section, Ecran, EtatVide,
                          Cartouche, PanneauDirection, BandeProgression, NoteAttention, Icone
  features/<domaine>/     Logique métier pure (fonctions testables, sans React)
  data/types.ts           Types du modèle (ne pas modifier sans y être invité)
  data/depot.ts           SEUL accès aux données pour les écrans
  data/mock.ts            Données fictives (jamais importées par un écran)
  lib/format.ts           Formats de dates, heures, pluriels en français
  theme/tokens.ts         Couleurs, typographie, espacements (SEUL endroit avec des valeurs en dur)
```

## Design system « La route » — règles obligatoires

L'application doit avoir l'air d'une **vraie application native**, pas d'une appli générée par IA.

1. **Aucune couleur, taille ou police en dur** dans `src/app` et `src/features`. Couleurs via `useTheme().couleurs`, texte via `<Texte variante="…">`. Le lint bloque les écarts.
2. **Composants natifs uniquement** : listes groupées (`Section` + `Ligne`), barre de navigation native (`<Stack.Screen options={{ title }} />`), recherche native (`headerSearchBarOptions`), `Switch`, `TextInput`, `Pressable`. Pas de bouton ou de carte « maison ».
3. **Chaque signe routier a un seul rôle** :
   - `PanneauDirection` → uniquement la prochaine leçon ;
   - `BandeProgression` → uniquement la progression C1 à C4 ;
   - `Cartouche` → uniquement un numéro de leçon (L14) ;
   - `NoteAttention` (jaune) → uniquement ce qui demande une action, avec sa preuve.
4. **Interdits** : emojis ou caractères Unicode comme icônes (utiliser `Icone`, et ajouter l'icône au catalogue `icones` si besoin), dégradés, ombres colorées, bordure colorée épaisse sur un côté, cartes empilées, petit libellé au-dessus d'un titre, texte en dégradé.
5. **Textes** : tutoiement côté élève, vouvoiement côté professionnels. Courts, concrets, vocabulaire d'auto-école. Les messages d'erreur disent le problème ET comment le corriger.
6. **États** : chaque liste a un état vide (`EtatVide`), chaque formulaire affiche ses erreurs près du champ concerné.
7. **Accessibilité** : `accessibilityLabel` sur les éléments sans texte, cibles tactiles ≥ `cibleTactile`, pas de taille de police figée (respecter la taille système).

## Règles de code

- TypeScript strict, pas de `any`, pas de `@ts-ignore`.
- Logique métier dans `src/features/<domaine>/*.ts` (fonctions pures) + tests `*.test.ts` à côté.
- Dates : chaînes ISO ou « YYYY-MM-DD » / « HH:MM », formatées via `@/lib/format`.
- Navigation : `useRouter()` d'`expo-router`, routes typées.
- Ne modifier QUE les fichiers listés dans la fiche de tâche.

## Expo a changé — ne pas se fier à sa mémoire

Expo SDK 58. Avant d'utiliser une API Expo / React Native, vérifier la doc versionnée :
`https://docs.expo.dev/versions/v58.0.0/` et l'index `https://docs.expo.dev/llms.txt`.
Les dossiers `ios/` et `android/` sont générés : ne jamais les créer ni les modifier.
