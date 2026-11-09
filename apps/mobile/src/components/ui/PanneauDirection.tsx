import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/use-theme';

import { Icone } from './Icone';
import { Texte } from './Texte';

type Props = {
  /** Lieu de rendez-vous (début de leçon). */
  lieuDepart: string;
  /** Heure de début, déjà formatée (« 14:00 »). */
  heureDebut: string;
  /** Lieu de fin de leçon. */
  lieuFin: string;
  /** Heure de fin, déjà formatée. */
  heureFin: string;
  /** Contexte temporel (« Aujourd'hui · dans 35 min »). */
  quand: string;
  /** Avec qui (« avec Lina Morel »), facultatif. */
  avecQui?: string;
  onItineraire: () => void;
};

/**
 * Panneau directionnel : réservé à LA prochaine leçon.
 * Un seul panneau par écran, jamais pour autre chose.
 */
export function PanneauDirection({ lieuDepart, heureDebut, lieuFin, heureFin, quand, avecQui, onItineraire }: Props) {
  const { couleurs, espace, rayon, cibleTactile } = useTheme();
  const contexte = avecQui ? `${quand} · ${avecQui}` : quand;

  return (
    <View
      style={[styles.panneau, { backgroundColor: couleurs.panneau, borderRadius: rayon.panneau, padding: espace.xs }]}>
      <View
        style={[
          styles.liseré,
          {
            borderColor: couleurs.panneauTexte,
            borderRadius: rayon.panneau - 3,
            padding: espace.m + 2,
            gap: espace.s,
          },
        ]}>
        <View
          style={[styles.ligne, { gap: espace.m }]}
          accessible
          accessibilityLabel={`Rendez-vous ${lieuDepart} à ${heureDebut}, fin ${lieuFin} à ${heureFin}. ${contexte}.`}>
          <View style={styles.lieux}>
            <Texte variante="titre3" couleur={couleurs.panneauTexte} numberOfLines={2}>
              {lieuDepart}
            </Texte>
            <Texte variante="sousTitre" couleur={couleurs.panneauTexteSecondaire} tabulaire numberOfLines={1}>
              Fin : {lieuFin} · {heureFin}
            </Texte>
          </View>
          <Texte variante="chiffreGrand" couleur={couleurs.panneauTexte}>
            {heureDebut}
          </Texte>
        </View>

        <View style={[styles.ligne, { gap: espace.m }]}>
          <Texte variante="sousTitre" couleur={couleurs.panneauTexteSecondaire} style={styles.contexte}>
            {contexte}
          </Texte>
          <Pressable
            onPress={onItineraire}
            accessibilityRole="button"
            accessibilityLabel={`Itinéraire vers ${lieuDepart}`}
            hitSlop={(cibleTactile - 34) / 2}
            style={({ pressed }) => [
              styles.bouton,
              {
                backgroundColor: couleurs.panneauBouton,
                borderRadius: rayon.bouton,
                paddingHorizontal: espace.m + 2,
                gap: espace.xs + 2,
                opacity: pressed ? 0.8 : 1,
              },
            ]}>
            <Icone nom="itineraire" taille={16} couleur={couleurs.panneauBoutonTexte} />
            <Texte variante="entete" couleur={couleurs.panneauBoutonTexte}>
              Itinéraire
            </Texte>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panneau: {},
  liseré: {
    borderWidth: 2,
  },
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lieux: {
    flex: 1,
    gap: 2,
  },
  contexte: {
    flex: 1,
  },
  bouton: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
