/**
 * Design tokens de Créno — univers « La route ».
 *
 * SEUL fichier du projet autorisé à contenir des couleurs, tailles de police
 * et familles de police en dur (règle ESLint). Les écrans et composants
 * passent toujours par `useTheme()` et les composants de `@/components/ui`.
 *
 * Chaque signe routier a un seul rôle :
 * - panneau directionnel (bleu)  → la prochaine leçon et la teinte interactive
 * - bitume + lignes de chaussée  → la progression C1 à C4
 * - jaune de signalisation        → ce qui demande attention
 * - cartouche jaune               → le numéro de leçon (L14)
 * - rouge                         → erreurs et tampons de validation
 */
import { Platform } from 'react-native';

/** Rampe neutre de 9 pas, légèrement teintée vers le bleu routier. */
const rampeClaire = {
  n0: '#FFFFFF',
  n1: '#F4F5F7',
  n2: '#E3E6EB',
  n3: '#C9CED6',
  n4: '#9AA2AE',
  n5: '#6E7783',
  n6: '#5B6472',
  n7: '#3A414C',
  n8: '#14181F',
} as const;

const rampeSombre = {
  n0: '#0E1116',
  n1: '#151920',
  n2: '#1F242C',
  n3: '#2C323C',
  n4: '#4A525E',
  n5: '#7C8592',
  n6: '#A9B1BC',
  n7: '#D3D8DF',
  n8: '#F1F3F6',
} as const;

export type Couleurs = {
  /** Fond des écrans (listes groupées). */
  fond: string;
  /** Fond des cellules et blocs posés sur le fond. */
  surface: string;
  /** Surface en état pressé (iOS). */
  surfacePressee: string;
  separateur: string;
  texte: string;
  texteSecondaire: string;
  texteTertiaire: string;
  /** Teinte interactive (liens, boutons, onglet actif). Remplaçable par la teinte de l'auto-école. */
  teinte: string;
  surTeinte: string;
  /** Panneau directionnel (prochaine leçon). */
  panneau: string;
  panneauTexte: string;
  panneauTexteSecondaire: string;
  panneauBouton: string;
  panneauBoutonTexte: string;
  /** Bande de progression (bitume). */
  bitume: string;
  ligneChaussee: string;
  ligneChausseeAVenir: string;
  bitumeTexte: string;
  bitumeTexteSecondaire: string;
  tampon: string;
  /** Attention (jaune de signalisation temporaire). */
  attentionFond: string;
  attentionTexte: string;
  attentionPictogramme: string;
  /** Cartouche de numéro de leçon. */
  cartoucheFond: string;
  cartoucheTexte: string;
  cartoucheBord: string;
  danger: string;
  ondulation: string;
};

const clair: Couleurs = {
  fond: rampeClaire.n1,
  surface: rampeClaire.n0,
  surfacePressee: rampeClaire.n2,
  separateur: rampeClaire.n2,
  texte: rampeClaire.n8,
  texteSecondaire: rampeClaire.n6,
  texteTertiaire: rampeClaire.n4,
  teinte: '#1D4E9E',
  surTeinte: '#FFFFFF',
  panneau: '#1D4E9E',
  panneauTexte: '#FFFFFF',
  panneauTexteSecondaire: '#D6E2F5',
  panneauBouton: '#FFFFFF',
  panneauBoutonTexte: '#1D4E9E',
  bitume: '#2B2F33',
  ligneChaussee: '#FFFFFF',
  ligneChausseeAVenir: 'rgba(255,255,255,0.32)',
  bitumeTexte: '#FFFFFF',
  bitumeTexteSecondaire: '#C9CDD1',
  tampon: '#F08A80',
  attentionFond: '#FFF4CC',
  attentionTexte: '#4A3B00',
  attentionPictogramme: '#B58A00',
  cartoucheFond: '#F2C230',
  cartoucheTexte: rampeClaire.n8,
  cartoucheBord: rampeClaire.n8,
  danger: '#C62828',
  ondulation: 'rgba(20,24,31,0.10)',
};

const sombre: Couleurs = {
  fond: rampeSombre.n0,
  surface: rampeSombre.n1,
  surfacePressee: rampeSombre.n3,
  separateur: rampeSombre.n3,
  texte: rampeSombre.n8,
  texteSecondaire: rampeSombre.n6,
  texteTertiaire: rampeSombre.n5,
  teinte: '#7FA7EC',
  surTeinte: rampeSombre.n0,
  panneau: '#1F4F9F',
  panneauTexte: '#FFFFFF',
  panneauTexteSecondaire: '#D6E2F5',
  panneauBouton: '#FFFFFF',
  panneauBoutonTexte: '#1D4E9E',
  bitume: '#23272C',
  ligneChaussee: '#F1F3F6',
  ligneChausseeAVenir: 'rgba(241,243,246,0.28)',
  bitumeTexte: '#F1F3F6',
  bitumeTexteSecondaire: '#A9B1BC',
  tampon: '#F08A80',
  attentionFond: '#3A3216',
  attentionTexte: '#F6E3A1',
  attentionPictogramme: '#F2C230',
  cartoucheFond: '#F2C230',
  cartoucheTexte: rampeClaire.n8,
  cartoucheBord: rampeClaire.n8,
  danger: '#FF7A70',
  ondulation: 'rgba(241,243,246,0.12)',
};

export const palettes = { clair, sombre } as const;

/** Espacements (multiples de 4). */
export const espace = {
  xxs: 2,
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const rayon = {
  cartouche: 4,
  panneau: 10,
  groupe: 12,
  bouton: 18,
} as const;

/** Police condensée auto-hébergée (chiffres, cartouches). Chargée dans app/_layout.tsx. */
export const policeCondensee = 'BarlowCondensed_700Bold';

/**
 * Échelle typographique calée sur les styles système iOS (Dynamic Type)
 * et les rôles Material 3. Police système pour tout le texte courant.
 */
export const typo = {
  grandTitre: { fontSize: 34, lineHeight: 41, fontWeight: '700' },
  titre: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  titre2: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  titre3: { fontSize: 20, lineHeight: 25, fontWeight: '600' },
  entete: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  corps: { fontSize: 17, lineHeight: 22, fontWeight: '400' },
  legende: { fontSize: 16, lineHeight: 21, fontWeight: '400' },
  sousTitre: { fontSize: 15, lineHeight: 20, fontWeight: '400' },
  note: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  /** En-têtes de sections de listes groupées. */
  section: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    textTransform: Platform.OS === 'ios' ? 'uppercase' : 'none',
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.1,
  },
  /** Chiffres et cartouches (police condensée). */
  chiffreGrand: { fontSize: 32, lineHeight: 36, fontFamily: policeCondensee },
  chiffre: { fontSize: 18, lineHeight: 22, fontFamily: policeCondensee },
  /** Mention à l'intérieur du tampon de validation. */
  tampon: { fontSize: 10, lineHeight: 12, fontWeight: '800' },
} as const;

export type VarianteTexte = keyof typeof typo;

/** Hauteur minimale d'une cible tactile (iOS 44 pt, Android 48 dp). */
export const cibleTactile = Platform.OS === 'android' ? 48 : 44;
