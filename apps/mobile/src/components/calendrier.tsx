/**
 * Vues du calendrier de planning : barre de période, semaine, mois, année.
 * La vue « jour » reste une liste (chaque écran garde la sienne).
 */
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Icone, Texte } from '@/components/ui';
import { dateLocale, midiLocal } from '@/features/planning/creneaux';
import {
  grilleMois,
  HEURE_DEBUT,
  HEURE_FIN,
  INITIALES_JOURS,
  nomMois,
  positionDansJournee,
  repartirEnColonnes,
} from '@/features/planning/calendrier';
import { formatHeure } from '@/lib/format';
import { useTheme } from '@/theme/use-theme';

export type ElementCalendrier = {
  id: string;
  debut: string;
  fin: string;
  /** Libellé court (« Lina M. »). */
  titre: string;
  /** `lecon` : bloc plein ; `libre` : créneau libre, en pointillés ; `annulee` : leçon annulée, en jaune. */
  type: 'lecon' | 'libre' | 'annulee';
  /** Couleur du bloc d'une leçon (véhicule ou enseignant). Teinte de l'appli par défaut. */
  couleur?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
};

/* ---------- Barre de période ---------- */

export function BarrePeriode({
  titre,
  onPrecedent,
  onSuivant,
  onAujourdhui,
}: {
  titre: string;
  onPrecedent: () => void;
  onSuivant: () => void;
  /** Absent quand la période affichée contient déjà aujourd'hui. */
  onAujourdhui?: () => void;
}) {
  const { couleurs, espace, cibleTactile } = useTheme();
  const bouton = (icone: 'precedent' | 'chevron', libelle: string, onPress: () => void) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={libelle}
      hitSlop={6}
      style={({ pressed }) => [styles.fleche, { width: cibleTactile, height: cibleTactile, opacity: pressed ? 0.5 : 1 }]}>
      <Icone nom={icone} taille={18} couleur={couleurs.teinte} />
    </Pressable>
  );
  return (
    <View style={[styles.barre, { paddingHorizontal: espace.s, paddingTop: espace.s }]}>
      {bouton('precedent', 'Période précédente', onPrecedent)}
      <Texte variante="entete" style={styles.titreBarre} numberOfLines={1} accessibilityRole="header">
        {titre}
      </Texte>
      {onAujourdhui ? (
        <Pressable onPress={onAujourdhui} accessibilityRole="button" hitSlop={6} style={{ paddingHorizontal: espace.s, minHeight: cibleTactile, justifyContent: 'center' }}>
          <Texte variante="sousTitre" ton="teinte" gras>
            Aujourd’hui
          </Texte>
        </Pressable>
      ) : null}
      {bouton('chevron', 'Période suivante', onSuivant)}
    </View>
  );
}

/* ---------- Semaine ---------- */

const HAUTEUR_HEURE = 40;
const LARGEUR_HEURES = 34;

export function VueSemaine({
  jours,
  elements,
  maintenant,
  absents = [],
  onChoisirJour,
}: {
  jours: string[];
  elements: ElementCalendrier[];
  maintenant: Date;
  /** Jours où l'enseignant est absent (colonne grisée). */
  absents?: string[];
  onChoisirJour: (jour: string) => void;
}) {
  const { couleurs, espace, rayon , calendrier } = useTheme();
  const { width } = useWindowDimensions();
  const largeurUtile = Math.min(width, 760) - 2 * espace.l - LARGEUR_HEURES;
  const largeurJour = largeurUtile / 7;
  const heures = Array.from({ length: HEURE_FIN - HEURE_DEBUT + 1 }, (_, i) => HEURE_DEBUT + i);
  const hauteur = (HEURE_FIN - HEURE_DEBUT) * HAUTEUR_HEURE;
  const aujourdhui = dateLocale(maintenant);

  return (
    <View style={{ paddingHorizontal: espace.l, paddingTop: espace.m }}>
      {/* En-tête des jours */}
      <View style={[styles.rangee, { paddingLeft: LARGEUR_HEURES }]}>
        {jours.map((jour, i) => {
          const estAujourdhui = jour === aujourdhui;
          return (
            <Pressable
              key={jour}
              onPress={() => onChoisirJour(jour)}
              accessibilityRole="button"
              accessibilityLabel={`Voir le ${midiLocal(jour).getDate()}`}
              style={[styles.enteteJour, { width: largeurJour, paddingBottom: espace.xs }]}>
              <Texte variante="calendrier" ton="secondaire">
                {INITIALES_JOURS[i]}
              </Texte>
              <View style={[styles.pastille, { backgroundColor: estAujourdhui ? couleurs.teinte : 'transparent' }]}>
                <Texte variante="sousTitre" couleur={estAujourdhui ? couleurs.surTeinte : couleurs.texte} gras={estAujourdhui} tabulaire>
                  {midiLocal(jour).getDate()}
                </Texte>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Grille horaire */}
      <View style={[styles.rangee, { height: hauteur + 18, backgroundColor: couleurs.surface, borderRadius: rayon.groupe, overflow: 'hidden' }]}>
        <View style={{ width: LARGEUR_HEURES }}>
          {heures.map((h) => (
            <Texte
              key={h}
              variante="calendrier"
              ton="tertiaire"
              tabulaire
              style={[styles.heure, { top: (h - HEURE_DEBUT) * HAUTEUR_HEURE - 2 }]}>
              {String(h).padStart(2, '0')}
            </Texte>
          ))}
        </View>
        {jours.map((jour) => {
          const brut = elements.filter((e) => dateLocale(e.debut) === jour);
          // Une leçon annulée prend toute la largeur : le créneau libre qu'elle a libéré n'est pas redessiné à côté.
          const annulees = brut.filter((e) => e.type === 'annulee');
          const duJour = brut.filter(
            (e) => e.type !== 'libre' || !annulees.some((a) => new Date(a.debut) < new Date(e.fin) && new Date(e.debut) < new Date(a.fin)),
          );
          const places = repartirEnColonnes(duJour);
          const absent = absents.includes(jour);
          return (
            <View
              key={jour}
              style={[
                styles.colonne,
                { width: largeurJour, borderLeftColor: couleurs.separateur, backgroundColor: absent ? couleurs.surfacePressee : 'transparent' },
              ]}>
              {heures.map((h) => (
                <View key={h} style={[styles.ligneHeure, { top: (h - HEURE_DEBUT) * HAUTEUR_HEURE + 4, backgroundColor: couleurs.separateur }]} />
              ))}
              {absent ? (
                <Texte variante="calendrier" ton="secondaire" style={[styles.absent, { top: espace.s }]}>
                  Absent
                </Texte>
              ) : null}
              {places.map(({ element: e, colonne, colonnes }) => {
                const { haut, hauteur: h } = positionDansJournee(e.debut, e.fin);
                if (h === 0) return null;
                const lecon = e.type === 'lecon';
                const annulee = e.type === 'annulee';
                const fond = lecon ? (e.couleur ?? couleurs.teinte) : annulee ? couleurs.attentionFond : couleurs.fond;
                return (
                  <Pressable
                    key={e.id}
                    onPress={e.onPress}
                    disabled={!e.onPress}
                    accessibilityRole={e.onPress ? 'button' : undefined}
                    accessibilityLabel={e.accessibilityLabel ?? `${formatHeure(e.debut)} ${e.titre}`}
                    style={[
                      styles.bloc,
                      {
                        top: haut * hauteur + 5,
                        height: h * hauteur - 2,
                        left: (colonne / colonnes) * largeurJour + 1,
                        width: largeurJour / colonnes - 2,
                        borderRadius: 4,
                        backgroundColor: fond,
                        borderColor: lecon ? fond : annulee ? couleurs.attentionPictogramme : couleurs.texteTertiaire,
                        borderStyle: lecon || annulee ? 'solid' : 'dashed',
                      },
                    ]}>
                    <Texte
                      variante="calendrier"
                      couleur={lecon ? calendrier.texte : annulee ? couleurs.attentionTexte : couleurs.texteSecondaire}
                      numberOfLines={lecon ? 3 : 2}>
                      {e.type === 'libre' ? 'libre' : e.titre}
                    </Texte>
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </View>
    </View>
  );
}

/* ---------- Légende des couleurs ---------- */

export type EntreeLegende = { libelle: string; couleur: string; style?: 'plein' | 'pointille' };

/** Légende sous la vue semaine : la couleur n'est jamais le seul repère, le texte reste dans les blocs. */
export function LegendeCalendrier({ entrees }: { entrees: EntreeLegende[] }) {
  const { couleurs, espace } = useTheme();
  return (
    <View style={[styles.legende, { paddingHorizontal: espace.l, paddingTop: espace.s, columnGap: espace.m, rowGap: espace.xs }]}>
      {entrees.map((e) => (
        <View key={e.libelle} style={[styles.rangee, styles.entreeLegende, { gap: espace.xs }]}>
          <View
            style={[
              styles.carreLegende,
              {
                backgroundColor: e.style === 'pointille' ? 'transparent' : e.couleur,
                borderColor: e.style === 'pointille' ? couleurs.texteTertiaire : e.couleur,
                borderStyle: e.style === 'pointille' ? 'dashed' : 'solid',
              },
            ]}
          />
          <Texte variante="note" ton="secondaire">
            {e.libelle}
          </Texte>
        </View>
      ))}
    </View>
  );
}

/* ---------- Mois ---------- */

export function VueMois({
  date,
  compte,
  maintenant,
  onChoisirJour,
  libelle = 'leçon',
}: {
  date: string;
  /** Nombre de leçons par jour. */
  compte: Map<string, number>;
  maintenant: Date;
  onChoisirJour: (jour: string) => void;
  libelle?: string;
}) {
  const { couleurs, espace, rayon } = useTheme();
  const d = midiLocal(date);
  const semaines = grilleMois(d.getFullYear(), d.getMonth());
  const aujourdhui = dateLocale(maintenant);

  return (
    <View style={{ paddingHorizontal: espace.l, paddingTop: espace.m }}>
      <View style={styles.rangee}>
        {INITIALES_JOURS.map((j, i) => (
          <Texte key={i} variante="calendrier" ton="secondaire" style={[styles.cellule, styles.centre]}>
            {j}
          </Texte>
        ))}
      </View>
      <View style={{ backgroundColor: couleurs.surface, borderRadius: rayon.groupe, overflow: 'hidden', marginTop: espace.xs }}>
        {semaines.map((semaine) => (
          <View key={semaine[0].date} style={[styles.rangee, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: couleurs.separateur }]}>
            {semaine.map(({ date: jour, dansLeMois }) => {
              const n = compte.get(jour) ?? 0;
              const estAujourdhui = jour === aujourdhui;
              return (
                <Pressable
                  key={jour}
                  onPress={() => onChoisirJour(jour)}
                  accessibilityRole="button"
                  accessibilityLabel={`${midiLocal(jour).getDate()} ${nomMois(midiLocal(jour).getMonth())}${n > 0 ? `, ${n} ${libelle}${n > 1 ? 's' : ''}` : ''}`}
                  style={({ pressed }) => [
                    styles.cellule,
                    styles.caseMois,
                    { backgroundColor: pressed ? couleurs.surfacePressee : 'transparent', opacity: dansLeMois ? 1 : 0.35 },
                  ]}>
                  <View style={[styles.pastille, { backgroundColor: estAujourdhui ? couleurs.teinte : 'transparent' }]}>
                    <Texte variante="sousTitre" couleur={estAujourdhui ? couleurs.surTeinte : couleurs.texte} gras={estAujourdhui} tabulaire>
                      {midiLocal(jour).getDate()}
                    </Texte>
                  </View>
                  <View style={[styles.points, { gap: 3 }]}>
                    {Array.from({ length: Math.min(n, 3) }, (_, i) => (
                      <View key={i} style={[styles.point, { backgroundColor: couleurs.teinte }]} />
                    ))}
                  </View>
                  {n > 3 ? (
                    <Texte variante="calendrier" ton="teinte">
                      +{n - 3}
                    </Texte>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

/* ---------- Année ---------- */

export function VueAnnee({
  annee,
  compte,
  maintenant,
  onChoisirMois,
}: {
  annee: number;
  compte: Map<string, number>;
  maintenant: Date;
  onChoisirMois: (premierDuMois: string) => void;
}) {
  const { couleurs, espace, rayon } = useTheme();
  const { width } = useWindowDimensions();
  const parLigne = width >= 700 ? 4 : width >= 480 ? 3 : 2;
  const aujourdhui = dateLocale(maintenant);

  return (
    <View style={[styles.grilleAnnee, { paddingHorizontal: espace.l, paddingTop: espace.m, gap: espace.m }]}>
      {Array.from({ length: 12 }, (_, mois) => {
        const premier = dateLocale(new Date(annee, mois, 1, 12));
        const total = [...compte.entries()].filter(([j]) => midiLocal(j).getFullYear() === annee && midiLocal(j).getMonth() === mois).reduce((s, [, n]) => s + n, 0);
        return (
          <Pressable
            key={mois}
            onPress={() => onChoisirMois(premier)}
            accessibilityRole="button"
            accessibilityLabel={`${nomMois(mois)}${total > 0 ? `, ${total} leçon${total > 1 ? 's' : ''}` : ''}`}
            style={({ pressed }) => [
              styles.miniMois,
              {
                width: `${100 / parLigne - 3}%`,
                backgroundColor: pressed ? couleurs.surfacePressee : couleurs.surface,
                borderRadius: rayon.groupe,
                padding: espace.s,
              },
            ]}>
            <Texte variante="sousTitre" ton={maintenant.getFullYear() === annee && maintenant.getMonth() === mois ? 'teinte' : 'principal'} gras>
              {nomMois(mois)}
            </Texte>
            {grilleMois(annee, mois).map((semaine) => (
              <View key={semaine[0].date} style={styles.rangee}>
                {semaine.map(({ date: jour, dansLeMois }) => {
                  const n = dansLeMois ? (compte.get(jour) ?? 0) : 0;
                  const estAujourdhui = jour === aujourdhui && dansLeMois;
                  return (
                    <View key={jour} style={styles.cellule}>
                      <View
                        style={[
                          styles.miniJour,
                          {
                            backgroundColor: n > 0 ? couleurs.teinte : 'transparent',
                            borderColor: estAujourdhui ? couleurs.teinte : 'transparent',
                          },
                        ]}>
                        <Texte variante="calendrierMini" couleur={n > 0 ? couleurs.surTeinte : couleurs.texteSecondaire} tabulaire>
                          {dansLeMois ? midiLocal(jour).getDate() : ''}
                        </Texte>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  barre: { flexDirection: 'row', alignItems: 'center' },
  titreBarre: { flex: 1, textAlign: 'center' },
  fleche: { alignItems: 'center', justifyContent: 'center' },
  rangee: { flexDirection: 'row' },
  enteteJour: { alignItems: 'center', gap: 2 },
  pastille: { minWidth: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  heure: { position: 'absolute', left: 4 },
  colonne: { borderLeftWidth: StyleSheet.hairlineWidth, position: 'relative' },
  ligneHeure: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth },
  absent: { position: 'absolute', left: 0, right: 0, textAlign: 'center' },
  bloc: { position: 'absolute', borderWidth: 1, paddingHorizontal: 2, paddingVertical: 1, overflow: 'hidden' },
  cellule: { flex: 1, alignItems: 'center' },
  legende: { flexDirection: 'row', flexWrap: 'wrap' },
  entreeLegende: { alignItems: 'center' },
  carreLegende: { width: 12, height: 12, borderRadius: 3, borderWidth: 1 },
  centre: { textAlign: 'center' },
  caseMois: { minHeight: 52, paddingVertical: 4, gap: 2 },
  points: { flexDirection: 'row', height: 5 },
  point: { width: 5, height: 5, borderRadius: 2.5 },
  grilleAnnee: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  miniMois: { gap: 2 },
  miniJour: { width: 15, height: 15, borderRadius: 7.5, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
