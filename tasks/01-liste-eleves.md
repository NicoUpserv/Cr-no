# Tâche 01 — Liste des élèves (niveau : facile)

Lis d'abord `apps/mobile/AGENTS.md` et l'écran de référence `apps/mobile/src/app/(tabs)/eleves/[id].tsx`.
Tout le travail se fait dans `apps/mobile/`.

## Objectif

L'enseignant ouvre l'onglet « Élèves » et retrouve un élève en quelques secondes.

## Fichiers à créer ou modifier (et AUCUN autre)

1. `src/features/eleves/filtrer.ts` (créer)
2. `src/features/eleves/filtrer.test.ts` (créer)
3. `src/app/(tabs)/eleves/index.tsx` (remplacer le contenu actuel)

## 1. Logique : `src/features/eleves/filtrer.ts`

Contrat exact (noms et signatures à respecter, des tests cachés les utilisent) :

```ts
import type { Eleve, TypePermis } from '@/data/types';

export type FiltreEleves = {
  recherche: string;
  seulementDossierIncomplet: boolean;
  permis: TypePermis | 'tous';
};

export function filtrerEleves(eleves: Eleve[], filtre: FiltreEleves): Eleve[];
```

Règles :
- La recherche porte sur le prénom, le nom, et « prénom nom » ; elle ignore la casse, les accents et les espaces en début/fin. Recherche vide = pas de filtre.
- `seulementDossierIncomplet: true` → seulement les élèves avec au moins une pièce manquante.
- `permis` ≠ `'tous'` → seulement les élèves de ce type de permis.
- Résultat trié par nom puis prénom, ordre alphabétique français (accents ignorés : « Émile » se range avec les « E »).
- La fonction ne modifie pas le tableau reçu.

Écris au moins 6 tests dans `filtrer.test.ts`.

## 2. Écran : `src/app/(tabs)/eleves/index.tsx`

- Titre natif « Élèves » (`<Stack.Screen options={{ title: 'Élèves', headerSearchBarOptions: … }} />`) avec la **barre de recherche native** (`headerSearchBarOptions`, placeholder « Rechercher un élève »).
- Une `Section` « Filtres » contenant une ligne avec un `Switch` natif « Dossier incomplet uniquement ».
- Une `Section` listant les élèves filtrés (`listerEleves()` de `@/data/depot`), une `Ligne` par élève :
  - titre : « Prénom Nom » ;
  - sous-titre : libellé du permis (`libellesPermis`) puis « · » puis, si des pièces manquent, `formatPiecesManquantes(n)` en alerte (`sousTitreAlerte`), sinon « Leçon X sur Y » (X = `leconsEffectuees(id)`, Y = `forfaitLecons`) ;
  - appui → fiche de l'élève (`router.push({ pathname: '/eleves/[id]', params: { id } })`).
- Aucun résultat → `EtatVide` (icône `document`) avec un message qui dit quoi faire (modifier la recherche ou retirer le filtre).

## Fini quand

- `pnpm check` passe (typecheck + lint + tests) ;
- aucune couleur, taille ou police en dur ;
- seuls les 3 fichiers ci-dessus sont touchés.
