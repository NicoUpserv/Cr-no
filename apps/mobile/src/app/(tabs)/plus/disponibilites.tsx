/**
 * Mes disponibilités — horaires habituels, ouvertures ponctuelles, absences.
 * Première version écrite par DeepSeek V4.1 Flash (tâche 02), retravaillée :
 * choix natifs (ChoixMenu), lignes compactes, suppression par icône.
 */
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { ChoixMenu, Ecran, Icone, Ligne, Section, Texte } from '@/components/ui';
import { disponibilitesDuMoniteur, idMoniteurConnecte } from '@/data/depot';
import type {
  Absence,
  DisponibilitesMoniteur,
  DisponibiliteRoutine,
  JourSemaine,
  MotifAbsence,
  OuverturePonctuelle,
} from '@/data/types';
import { validerDisponibilites, type ErreurDisponibilite } from '@/features/disponibilites/valider';
import { useTheme } from '@/theme/use-theme';

const JOURS: { valeur: JourSemaine; libelle: string }[] = [
  { valeur: 1, libelle: 'Lundi' },
  { valeur: 2, libelle: 'Mardi' },
  { valeur: 3, libelle: 'Mercredi' },
  { valeur: 4, libelle: 'Jeudi' },
  { valeur: 5, libelle: 'Vendredi' },
  { valeur: 6, libelle: 'Samedi' },
  { valeur: 7, libelle: 'Dimanche' },
];

const MOTIFS: { valeur: MotifAbsence; libelle: string }[] = [
  { valeur: 'repos', libelle: 'Repos' },
  { valeur: 'conges', libelle: 'Congés' },
  { valeur: 'maladie', libelle: 'Maladie' },
  { valeur: 'autre', libelle: 'Autre' },
];

const CLAVIER: KeyboardTypeOptions = Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default';

function dateDuJour(): string {
  const date = new Date();
  const deux = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${deux(date.getMonth() + 1)}-${deux(date.getDate())}`;
}

const libelleJour = (jour: JourSemaine) => JOURS.find((j) => j.valeur === jour)?.libelle.toLowerCase() ?? '';

/** Champ court (heure ou date) avec bordure visible ; bordure rouge en cas d'erreur. */
function Champ({
  valeur,
  onChangeText,
  placeholder,
  accessibilityLabel,
  enErreur,
  large,
}: {
  valeur: string;
  onChangeText: (valeur: string) => void;
  placeholder: string;
  accessibilityLabel: string;
  enErreur: boolean;
  large?: boolean;
}) {
  const { couleurs, espace, rayon, cibleTactile } = useTheme();
  return (
    <TextInput
      value={valeur}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={couleurs.texteTertiaire}
      selectionColor={couleurs.teinte}
      keyboardType={CLAVIER}
      maxLength={large ? 10 : 5}
      autoCapitalize="none"
      autoCorrect={false}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.champ,
        large ? styles.champLarge : styles.champHeure,
        {
          minHeight: cibleTactile - 6,
          paddingHorizontal: espace.s,
          borderRadius: rayon.cartouche + 2,
          borderColor: enErreur ? couleurs.danger : couleurs.separateur,
          backgroundColor: couleurs.fond,
          color: couleurs.texte,
        },
      ]}
    />
  );
}

/** Bouton icône de suppression (cible tactile complète). */
function Supprimer({ libelle, onPress }: { libelle: string; onPress: () => void }) {
  const { couleurs, cibleTactile } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={libelle}
      style={({ pressed }) => [styles.supprimer, { width: cibleTactile, height: cibleTactile, opacity: pressed ? 0.5 : 1 }]}>
      <Icone nom="supprimer" taille={20} couleur={couleurs.danger} />
    </Pressable>
  );
}

/** Une ligne d'élément du formulaire, avec ses erreurs dessous. */
function LigneElement({ children, erreurs }: { children: React.ReactNode; erreurs: string[] }) {
  const { espace } = useTheme();
  return (
    <View style={{ paddingLeft: espace.l, paddingRight: espace.xs, paddingVertical: espace.s, gap: espace.xs }}>
      <View style={[styles.rangee, { gap: espace.s }]}>{children}</View>
      {erreurs.map((message) => (
        <Texte key={message} variante="note" ton="danger">
          {message}
        </Texte>
      ))}
    </View>
  );
}

function Tiret() {
  return (
    <Texte variante="corps" ton="secondaire">
      –
    </Texte>
  );
}

export default function MesDisponibilites() {
  const { espace, cibleTactile } = useTheme();
  const [disponibilites, setDisponibilites] = useState<DisponibilitesMoniteur>(() =>
    disponibilitesDuMoniteur(idMoniteurConnecte()),
  );
  const [erreurs, setErreurs] = useState<ErreurDisponibilite[]>([]);

  function modifier(modification: (actuelles: DisponibilitesMoniteur) => DisponibilitesMoniteur) {
    setDisponibilites(modification);
    setErreurs([]);
  }

  const erreursDe = (...champs: string[]) =>
    erreurs.filter((e) => champs.includes(e.champ)).map((e) => e.message);
  const enErreur = (champ: string) => erreurs.some((e) => e.champ === champ);

  const changerRoutine = (index: number, m: Partial<DisponibiliteRoutine>) =>
    modifier((a) => ({ ...a, routine: a.routine.map((c, i) => (i === index ? { ...c, ...m } : c)) }));
  const changerOuverture = (index: number, m: Partial<OuverturePonctuelle>) =>
    modifier((a) => ({ ...a, ouvertures: a.ouvertures.map((o, i) => (i === index ? { ...o, ...m } : o)) }));
  const changerAbsence = (index: number, m: Partial<Absence>) =>
    modifier((a) => ({ ...a, absences: a.absences.map((x, i) => (i === index ? { ...x, ...m } : x)) }));

  function enregistrer() {
    const resultat = validerDisponibilites(disponibilites, dateDuJour());
    setErreurs(resultat);
    if (resultat.length === 0) Alert.alert('Disponibilités enregistrées');
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Mes disponibilités',
          headerLargeTitle: false,
          headerRight: () => (
            <Pressable
              onPress={enregistrer}
              accessibilityRole="button"
              accessibilityLabel="Enregistrer les disponibilités"
              style={({ pressed }) => [styles.entete, { minHeight: cibleTactile, paddingHorizontal: espace.s, opacity: pressed ? 0.5 : 1 }]}>
              <Texte variante="corps" ton="teinte" gras>
                Enregistrer
              </Texte>
            </Pressable>
          ),
        }}
      />

      <Ecran>
        <Section titre="Horaires habituels" pied="Vos horaires de chaque semaine. Plusieurs créneaux possibles par jour.">
          {disponibilites.routine.map((creneau, index) => {
            const jour = libelleJour(creneau.jour);
            return (
              <LigneElement
                key={`routine-${index}`}
                erreurs={erreursDe(`routine.${index}.debut`, `routine.${index}.fin`)}>
                <View style={styles.extensible}>
                  <ChoixMenu
                    valeur={creneau.jour}
                    options={JOURS}
                    onChange={(j) => changerRoutine(index, { jour: j })}
                    accessibilityLabel={`Jour du créneau ${index + 1}`}
                  />
                </View>
                <Champ
                  valeur={creneau.debut}
                  onChangeText={(debut) => changerRoutine(index, { debut })}
                  placeholder="08:00"
                  accessibilityLabel={`Début du créneau du ${jour}`}
                  enErreur={enErreur(`routine.${index}.debut`)}
                />
                <Tiret />
                <Champ
                  valeur={creneau.fin}
                  onChangeText={(fin) => changerRoutine(index, { fin })}
                  placeholder="12:00"
                  accessibilityLabel={`Fin du créneau du ${jour}`}
                  enErreur={enErreur(`routine.${index}.fin`)}
                />
                <Supprimer
                  libelle={`Supprimer le créneau du ${jour}`}
                  onPress={() => modifier((a) => ({ ...a, routine: a.routine.filter((_, i) => i !== index) }))}
                />
              </LigneElement>
            );
          })}
          <Ligne
            icone="ajouter"
            titre="Ajouter un créneau"
            onPress={() => modifier((a) => ({ ...a, routine: [...a.routine, { jour: 1, debut: '', fin: '' }] }))}
          />
        </Section>

        <Section
          titre="Ouvertures ponctuelles"
          pied="Les élèves qui vous ont en favori et dont les horaires correspondent seront prévenus.">
          {disponibilites.ouvertures.map((ouverture, index) => (
            <LigneElement
              key={ouverture.id}
              erreurs={erreursDe(`ouvertures.${index}.date`, `ouvertures.${index}.debut`, `ouvertures.${index}.fin`)}>
              <Champ
                large
                valeur={ouverture.date}
                onChangeText={(date) => changerOuverture(index, { date })}
                placeholder="AAAA-MM-JJ"
                accessibilityLabel={`Date de l’ouverture ${index + 1}`}
                enErreur={enErreur(`ouvertures.${index}.date`)}
              />
              <Champ
                valeur={ouverture.debut}
                onChangeText={(debut) => changerOuverture(index, { debut })}
                placeholder="09:00"
                accessibilityLabel={`Début de l’ouverture ${index + 1}`}
                enErreur={enErreur(`ouvertures.${index}.debut`)}
              />
              <Tiret />
              <Champ
                valeur={ouverture.fin}
                onChangeText={(fin) => changerOuverture(index, { fin })}
                placeholder="12:00"
                accessibilityLabel={`Fin de l’ouverture ${index + 1}`}
                enErreur={enErreur(`ouvertures.${index}.fin`)}
              />
              <Supprimer
                libelle={`Supprimer l’ouverture ${index + 1}`}
                onPress={() => modifier((a) => ({ ...a, ouvertures: a.ouvertures.filter((_, i) => i !== index) }))}
              />
            </LigneElement>
          ))}
          <Ligne
            icone="ajouter"
            titre="Ajouter une ouverture"
            onPress={() =>
              modifier((a) => ({
                ...a,
                ouvertures: [...a.ouvertures, { id: `ouv-${Date.now()}`, date: dateDuJour(), debut: '', fin: '' }],
              }))
            }
          />
        </Section>

        <Section titre="Absences">
          {disponibilites.absences.map((absence, index) => (
            <LigneElement key={absence.id} erreurs={erreursDe(`absences.${index}.du`, `absences.${index}.au`)}>
              <View style={styles.extensible}>
                <ChoixMenu
                  valeur={absence.motif}
                  options={MOTIFS}
                  onChange={(motif) => changerAbsence(index, { motif })}
                  accessibilityLabel={`Motif de l’absence ${index + 1}`}
                />
              </View>
              <Champ
                large
                valeur={absence.du}
                onChangeText={(du) => changerAbsence(index, { du })}
                placeholder="AAAA-MM-JJ"
                accessibilityLabel={`Début de l’absence ${index + 1}`}
                enErreur={enErreur(`absences.${index}.du`)}
              />
              <Tiret />
              <Champ
                large
                valeur={absence.au}
                onChangeText={(au) => changerAbsence(index, { au })}
                placeholder="AAAA-MM-JJ"
                accessibilityLabel={`Fin de l’absence ${index + 1}`}
                enErreur={enErreur(`absences.${index}.au`)}
              />
              <Supprimer
                libelle={`Supprimer l’absence ${index + 1}`}
                onPress={() => modifier((a) => ({ ...a, absences: a.absences.filter((_, i) => i !== index) }))}
              />
            </LigneElement>
          ))}
          <Ligne
            icone="ajouter"
            titre="Ajouter une absence"
            onPress={() =>
              modifier((a) => ({
                ...a,
                absences: [...a.absences, { id: `abs-${Date.now()}`, du: dateDuJour(), au: dateDuJour(), motif: 'repos' }],
              }))
            }
          />
        </Section>
      </Ecran>
    </>
  );
}

const styles = StyleSheet.create({
  entete: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangee: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  extensible: {
    flex: 1,
    alignItems: 'flex-start',
  },
  champ: {
    borderWidth: StyleSheet.hairlineWidth,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  champHeure: {
    width: 64,
  },
  champLarge: {
    flex: 1,
    minWidth: 104,
  },
  supprimer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
