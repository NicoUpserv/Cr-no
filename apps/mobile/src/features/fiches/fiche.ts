/**
 * Règles de la fiche de leçon (docs/fiche-de-lecon.md) :
 * - au moins une sous-compétence évaluée ;
 * - un signalement à l'équipe doit être expliqué ;
 * - une fois validée, seule la direction peut corriger, et chaque correction est historisée ;
 * - l'élève ne reçoit jamais l'observation interne.
 */
import type {
  Appreciation,
  BrouillonFiche,
  ChampCorrigeable,
  ErreurFiche,
  FicheLecon,
  FicheVueEleve,
  RoleEquipe,
} from './types';

export const LONGUEUR_MAX_OBSERVATION = 1000;

export function verifierBrouillon(brouillon: BrouillonFiche): ErreurFiche[] {
  const erreurs: ErreurFiche[] = [];
  if (brouillon.sousCompetences.length === 0) {
    erreurs.push({ champ: 'sousCompetences', message: 'Ajoutez au moins une sous-compétence travaillée pendant la leçon.' });
  }
  if (brouillon.aSignaler && brouillon.observationInterne.trim() === '') {
    erreurs.push({
      champ: 'observationInterne',
      message: 'Expliquez ce que l’équipe doit savoir : un signalement sans explication n’aide pas le prochain enseignant.',
    });
  }
  for (const champ of ['observationPartagee', 'observationInterne'] as const) {
    if (brouillon[champ].length > LONGUEUR_MAX_OBSERVATION) {
      erreurs.push({ champ, message: `Raccourcissez l’observation : ${LONGUEUR_MAX_OBSERVATION} caractères au plus.` });
    }
  }
  return erreurs;
}

/** Fiche validée à partir d'un brouillon sans erreur. */
export function validerFiche(
  brouillon: BrouillonFiche,
  lecon: { leconId: string; numeroLecon: number; eleveId: string; enseignantId: string; date: string },
  maintenant: Date,
): FicheLecon {
  const erreurs = verifierBrouillon(brouillon);
  if (erreurs.length > 0) throw new Error(erreurs[0].message);
  return {
    ...lecon,
    sousCompetences: brouillon.sousCompetences,
    observationPartagee: brouillon.observationPartagee.trim(),
    observationInterne: brouillon.observationInterne.trim(),
    aSignaler: brouillon.aSignaler,
    valideeLe: maintenant.toISOString(),
    corrections: [],
  };
}

/** Une fiche validée ne se modifie que par la direction. */
export function peutCorriger(role: RoleEquipe): boolean {
  return role === 'direction';
}

/**
 * Correction par la direction : chaque champ modifié est historisé (avant / après).
 * Refusée pour un enseignant, même l'auteur de la fiche.
 */
export function corrigerFiche(
  fiche: FicheLecon,
  modifications: Partial<Pick<FicheLecon, ChampCorrigeable>>,
  auteur: { id: string; role: RoleEquipe },
  maintenant: Date,
): FicheLecon {
  if (!peutCorriger(auteur.role)) {
    throw new Error('Une fiche validée ne peut être corrigée que par la direction.');
  }
  const corrections = (Object.keys(modifications) as ChampCorrigeable[])
    .filter((champ) => modifications[champ] !== undefined && modifications[champ] !== fiche[champ])
    .map((champ) => ({
      par: auteur.id,
      le: maintenant.toISOString(),
      champ,
      avant: String(fiche[champ]),
      apres: String(modifications[champ]),
    }));
  if (corrections.length === 0) return fiche;
  return { ...fiche, ...modifications, corrections: [...fiche.corrections, ...corrections] };
}

/** Version envoyée à l'élève : l'observation interne et le signalement sont retirés. */
export function versionEleve(fiche: FicheLecon): FicheVueEleve {
  const { observationInterne: _interne, aSignaler: _signalement, corrections: _corrections, ...visible } = fiche;
  return visible;
}

/** Signalement le plus récent d'un élève, s'il y en a un. */
export function dernierSignalement(fiches: FicheLecon[]): FicheLecon | undefined {
  return [...fiches].filter((f) => f.aSignaler).sort((a, b) => b.date.localeCompare(a.date))[0];
}

/** « 2 acquises · 1 non maîtrisée · 1 vue » (ordre : acquis, non maîtrisé, vu). */
export function resumerAppreciations(fiche: Pick<FicheLecon, 'sousCompetences'>): string {
  const compte = (a: Appreciation) => fiche.sousCompetences.filter((s) => s.appreciation === a).length;
  const morceaux: [number, string, string][] = [
    [compte('acquis'), 'acquise', 'acquises'],
    [compte('non-maitrise'), 'non maîtrisée', 'non maîtrisées'],
    [compte('vu'), 'vue', 'vues'],
  ];
  const texte = morceaux
    .filter(([n]) => n > 0)
    .map(([n, un, plusieurs]) => `${n} ${n > 1 ? plusieurs : un}`)
    .join(' · ');
  return texte || 'Aucune sous-compétence évaluée';
}
