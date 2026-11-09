import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/use-theme';

import { Texte } from './Texte';

export type EtapeProgression = {
  code: string;
  libelle: string;
  acquises: number;
  total: number;
};

type Props = {
  etapes: EtapeProgression[];
};

const TIRET = 18;
const ESPACE_TIRET = 12;
const EPAISSEUR = 5;
const NB_TIRETS = 12;

/** Ligne discontinue tracée en segments réels (pas de dégradé). */
function LigneDiscontinue({ part, couleurPleine, couleurAVenir }: { part: number; couleurPleine: string; couleurAVenir: string }) {
  return (
    <View style={styles.piste}>
      {Array.from({ length: NB_TIRETS }, (_, i) => {
        const plein = i < Math.round(part * NB_TIRETS);
        return (
          <View
            key={i}
            style={[
              styles.tiret,
              { backgroundColor: plein ? couleurPleine : couleurAVenir, marginRight: plein ? 0 : ESPACE_TIRET },
            ]}
          />
        );
      })}
    </View>
  );
}

/**
 * Progression C1 à C4 en lignes de chaussée :
 * continue = compétence acquise (avec tampon), discontinue = en cours ou à venir.
 * Toujours dessinée à la même échelle pour être comparable d'un élève à l'autre.
 */
export function BandeProgression({ etapes }: Props) {
  const { couleurs, espace, rayon } = useTheme();

  return (
    <View
      style={[
        styles.bande,
        {
          backgroundColor: couleurs.bitume,
          borderRadius: rayon.groupe,
          paddingHorizontal: espace.l,
          paddingVertical: espace.s,
        },
      ]}>
      {etapes.map((etape) => {
        const acquise = etape.acquises >= etape.total;
        const part = etape.total > 0 ? etape.acquises / etape.total : 0;
        const etat = acquise ? 'acquise' : part > 0 ? `${etape.acquises} sur ${etape.total}` : 'à venir';
        return (
          <View
            key={etape.code}
            accessible
            accessibilityLabel={`${etape.code}, ${etape.libelle} : ${etat}`}
            style={[styles.ligne, { gap: espace.m, paddingVertical: espace.s }]}>
            <Texte variante="chiffre" couleur={couleurs.bitumeTexte} style={styles.code}>
              {etape.code}
            </Texte>
            {acquise ? (
              <View style={[styles.piste, styles.continue, { backgroundColor: couleurs.ligneChaussee }]} />
            ) : (
              <LigneDiscontinue part={part} couleurPleine={couleurs.ligneChaussee} couleurAVenir={couleurs.ligneChausseeAVenir} />
            )}
            {acquise ? (
              <View style={[styles.tampon, { borderColor: couleurs.tampon }]}>
                <Texte variante="tampon" couleur={couleurs.tampon}>
                  OK
                </Texte>
              </View>
            ) : (
              <Texte variante="sousTitre" couleur={couleurs.bitumeTexteSecondaire} tabulaire style={styles.compteur}>
                {part > 0 ? `${etape.acquises} / ${etape.total}` : '—'}
              </Texte>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bande: {},
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  code: {
    width: 28,
  },
  piste: {
    flex: 1,
    height: EPAISSEUR,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  continue: {
    borderRadius: 1,
  },
  tiret: {
    width: TIRET,
    height: EPAISSEUR,
  },
  tampon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-12deg' }],
  },
  compteur: {
    width: 44,
    textAlign: 'right',
  },
});
