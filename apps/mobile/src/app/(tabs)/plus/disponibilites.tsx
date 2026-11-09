import { Stack } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Ecran, Ligne, Section, Texte } from '@/components/ui';
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
  { valeur: 1, libelle: 'lundi' },
  { valeur: 2, libelle: 'mardi' },
  { valeur: 3, libelle: 'mercredi' },
  { valeur: 4, libelle: 'jeudi' },
  { valeur: 5, libelle: 'vendredi' },
  { valeur: 6, libelle: 'samedi' },
  { valeur: 7, libelle: 'dimanche' },
];

const MOTIFS: { valeur: MotifAbsence; libelle: string }[] = [
  { valeur: 'repos', libelle: 'Repos' },
  { valeur: 'conges', libelle: 'Congés' },
  { valeur: 'maladie', libelle: 'Maladie' },
  { valeur: 'autre', libelle: 'Autre' },
];

const CLAVIER: KeyboardTypeOptions = Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default';

function libelleJour(jour: JourSemaine): string {
  return JOURS.find((j) => j.valeur === jour)?.libelle ?? 'lundi';
}

function libelleMotif(motif: MotifAbsence): string {
  return MOTIFS.find((m) => m.valeur === motif)?.libelle ?? 'Repos';
}

function jourSuivant(jour: JourSemaine): JourSemaine {
  const index = JOURS.findIndex((j) => j.valeur === jour);
  return JOURS[(index + 1) % JOURS.length].valeur;
}

function motifSuivant(motif: MotifAbsence): MotifAbsence {
  const index = MOTIFS.findIndex((m) => m.valeur === motif);
  return MOTIFS[(index + 1) % MOTIFS.length].valeur;
}

function dateDuJour(): string {
  const date = new Date();
  const deux = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${deux(date.getMonth() + 1)}-${deux(date.getDate())}`;
}

type ChampProps = {
  valeur: string;
  onChangeText: (valeur: string) => void;
  label: string;
  placeholder: string;
  accessibilityLabel: string;
  erreur?: string;
  maxLength?: number;
  style?: StyleProp<ViewStyle>;
};

function Champ({
  valeur,
  onChangeText,
  label,
  placeholder,
  accessibilityLabel,
  erreur,
  maxLength,
  style,
}: ChampProps) {
  const { couleurs, espace, rayon, cibleTactile } = useTheme();

  return (
    <View style={[{ gap: espace.xs }, style]}>
      <Texte variante="note" ton="secondaire">
        {label}
      </Texte>
      <TextInput
        value={valeur}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={couleurs.texteTertiaire}
        selectionColor={couleurs.teinte}
        keyboardType={CLAVIER}
        maxLength={maxLength}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={accessibilityLabel}
        style={[
          styles.champ,
          {
            minHeight: cibleTactile,
            paddingHorizontal: espace.m,
            borderRadius: rayon.cartouche,
            borderColor: erreur ? couleurs.danger : couleurs.separateur,
            backgroundColor: couleurs.fond,
            color: couleurs.texte,
          },
        ]}
      />
      {erreur ? (
        <Texte variante="note" ton="danger">
          {erreur}
        </Texte>
      ) : null}
    </View>
  );
}

function BoutonSupprimer({ label, onPress }: { label: string; onPress: () => void }) {
  const { couleurs, espace, rayon, cibleTactile } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={espace.s}
      style={({ pressed }) => [
        styles.boutonSupprimer,
        {
          minHeight: cibleTactile,
          paddingHorizontal: espace.m,
          borderRadius: rayon.cartouche,
          backgroundColor: pressed ? couleurs.surfacePressee : couleurs.surface,
        },
      ]}>
      <Texte variante="sousTitre" ton="danger">
        Supprimer
      </Texte>
    </Pressable>
  );
}

function MessageVide({ texte }: { texte: string }) {
  const { espace } = useTheme();

  return (
    <View style={{ paddingHorizontal: espace.l, paddingVertical: espace.m }}>
      <Texte variante="sousTitre" ton="secondaire">
        {texte}
      </Texte>
    </View>
  );
}

export default function MesDisponibilites() {
  const { couleurs, espace, cibleTactile } = useTheme();
  const [disponibilites, setDisponibilites] = useState<DisponibilitesMoniteur>(() =>
    disponibilitesDuMoniteur(idMoniteurConnecte()),
  );
  const [erreurs, setErreurs] = useState<ErreurDisponibilite[]>([]);

  function modifierDisponibilites(
    modification: (actuelles: DisponibilitesMoniteur) => DisponibilitesMoniteur,
  ) {
    setDisponibilites(modification);
    setErreurs([]);
  }

  function messageErreur(champ: string): string | undefined {
    return erreurs.find((erreur) => erreur.champ === champ)?.message;
  }

  function changerRoutine(index: number, modification: Partial<DisponibiliteRoutine>) {
    modifierDisponibilites((actuelles) => ({
      ...actuelles,
      routine: actuelles.routine.map((creneau, i) =>
        i === index ? { ...creneau, ...modification } : creneau,
      ),
    }));
  }

  function changerOuverture(index: number, modification: Partial<OuverturePonctuelle>) {
    modifierDisponibilites((actuelles) => ({
      ...actuelles,
      ouvertures: actuelles.ouvertures.map((ouverture, i) =>
        i === index ? { ...ouverture, ...modification } : ouverture,
      ),
    }));
  }

  function changerAbsence(index: number, modification: Partial<Absence>) {
    modifierDisponibilites((actuelles) => ({
      ...actuelles,
      absences: actuelles.absences.map((absence, i) =>
        i === index ? { ...absence, ...modification } : absence,
      ),
    }));
  }

  function ajouterCreneau() {
    modifierDisponibilites((actuelles) => ({
      ...actuelles,
      routine: [...actuelles.routine, { jour: 1, debut: '', fin: '' }],
    }));
  }

  function ajouterOuverture() {
    modifierDisponibilites((actuelles) => ({
      ...actuelles,
      ouvertures: [
        ...actuelles.ouvertures,
        {
          id: `ouv-${Date.now()}-${actuelles.ouvertures.length}`,
          date: '',
          debut: '',
          fin: '',
        },
      ],
    }));
  }

  function ajouterAbsence() {
    modifierDisponibilites((actuelles) => ({
      ...actuelles,
      absences: [
        ...actuelles.absences,
        {
          id: `abs-${Date.now()}-${actuelles.absences.length}`,
          du: '',
          au: '',
          motif: 'repos',
        },
      ],
    }));
  }

  function supprimerCreneau(index: number) {
    modifierDisponibilites((actuelles) => ({
      ...actuelles,
      routine: actuelles.routine.filter((_, i) => i !== index),
    }));
  }

  function supprimerOuverture(index: number) {
    modifierDisponibilites((actuelles) => ({
      ...actuelles,
      ouvertures: actuelles.ouvertures.filter((_, i) => i !== index),
    }));
  }

  function supprimerAbsence(index: number) {
    modifierDisponibilites((actuelles) => ({
      ...actuelles,
      absences: actuelles.absences.filter((_, i) => i !== index),
    }));
  }

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
              hitSlop={espace.s}
              style={({ pressed }) => [
                styles.boutonEntete,
                {
                  minHeight: cibleTactile,
                  minWidth: cibleTactile,
                  paddingHorizontal: espace.s,
                  opacity: pressed ? 0.5 : 1,
                },
              ]}>
              <Texte variante="corps" ton="teinte" gras>
                Enregistrer
              </Texte>
            </Pressable>
          ),
        }}
      />

      <Ecran>
        <Section titre="Horaires habituels">
          {disponibilites.routine.length === 0 ? (
            <MessageVide texte="Aucun créneau habituel. Ajoutez vos horaires de la semaine." />
          ) : null}

          {disponibilites.routine.map((creneau, index) => {
            const jour = libelleJour(creneau.jour);
            return (
              <View
                key={`routine-${index}`}
                style={[styles.element, { padding: espace.l, gap: espace.s }]}>
                <View style={[styles.enteteElement, { gap: espace.s }]}>
                  <Pressable
                    onPress={() =>
                      changerRoutine(index, { jour: jourSuivant(creneau.jour) })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Jour du créneau : ${jour}`}
                    accessibilityHint="Appuyez pour passer au jour suivant."
                    style={({ pressed }) => [
                      styles.ligneAction,
                      {
                        flex: 1,
                        minHeight: cibleTactile,
                        paddingHorizontal: espace.m,
                        gap: espace.s,
                        backgroundColor: pressed ? couleurs.surfacePressee : couleurs.surface,
                      },
                    ]}>
                    <Texte variante="corps" gras>
                      {jour}
                    </Texte>
                    <Texte variante="sousTitre" ton="teinte">
                      Changer
                    </Texte>
                  </Pressable>
                  <BoutonSupprimer
                    label={`Supprimer le créneau du ${jour}`}
                    onPress={() => supprimerCreneau(index)}
                  />
                </View>

                <View style={[styles.champsHeures, { gap: espace.s }]}>
                  <Champ
                    valeur={creneau.debut}
                    onChangeText={(debut) => changerRoutine(index, { debut })}
                    label="Début"
                    placeholder="08:00"
                    accessibilityLabel={`Début du créneau du ${jour}`}
                    erreur={messageErreur(`routine.${index}.debut`)}
                    maxLength={5}
                    style={styles.champSouple}
                  />
                  <Champ
                    valeur={creneau.fin}
                    onChangeText={(fin) => changerRoutine(index, { fin })}
                    label="Fin"
                    placeholder="12:00"
                    accessibilityLabel={`Fin du créneau du ${jour}`}
                    erreur={messageErreur(`routine.${index}.fin`)}
                    maxLength={5}
                    style={styles.champSouple}
                  />
                </View>
              </View>
            );
          })}

          <Ligne titre="Ajouter un créneau" onPress={ajouterCreneau} />
        </Section>

        <Section
          titre="Ouvertures ponctuelles"
          pied="Les élèves qui vous ont en favori et dont les horaires correspondent seront prévenus.">
          {disponibilites.ouvertures.length === 0 ? (
            <MessageVide texte="Aucune ouverture ponctuelle. Ajoutez une date exceptionnelle." />
          ) : null}

          {disponibilites.ouvertures.map((ouverture, index) => (
            <View
              key={ouverture.id}
              style={[styles.element, { padding: espace.l, gap: espace.s }]}>
              <View style={[styles.enteteElement, { gap: espace.s }]}>
                <Texte variante="corps" gras style={styles.titreElement}>
                  Ouverture {index + 1}
                </Texte>
                <BoutonSupprimer
                  label={`Supprimer l’ouverture ${index + 1}`}
                  onPress={() => supprimerOuverture(index)}
                />
              </View>

              <Champ
                valeur={ouverture.date}
                onChangeText={(date) => changerOuverture(index, { date })}
                label="Date"
                placeholder="AAAA-MM-JJ"
                accessibilityLabel={`Date de l’ouverture ${index + 1}`}
                erreur={messageErreur(`ouvertures.${index}.date`)}
                maxLength={10}
              />

              <View style={[styles.champsHeures, { gap: espace.s }]}>
                <Champ
                  valeur={ouverture.debut}
                  onChangeText={(debut) => changerOuverture(index, { debut })}
                  label="Début"
                  placeholder="09:00"
                  accessibilityLabel={`Début de l’ouverture ${index + 1}`}
                  erreur={messageErreur(`ouvertures.${index}.debut`)}
                  maxLength={5}
                  style={styles.champSouple}
                />
                <Champ
                  valeur={ouverture.fin}
                  onChangeText={(fin) => changerOuverture(index, { fin })}
                  label="Fin"
                  placeholder="12:00"
                  accessibilityLabel={`Fin de l’ouverture ${index + 1}`}
                  erreur={messageErreur(`ouvertures.${index}.fin`)}
                  maxLength={5}
                  style={styles.champSouple}
                />
              </View>
            </View>
          ))}

          <Ligne titre="Ajouter une ouverture" onPress={ajouterOuverture} />
        </Section>

        <Section titre="Absences">
          {disponibilites.absences.length === 0 ? (
            <MessageVide texte="Aucune absence prévue." />
          ) : null}

          {disponibilites.absences.map((absence, index) => {
            const motif = libelleMotif(absence.motif);
            return (
              <View
                key={absence.id}
                style={[styles.element, { padding: espace.l, gap: espace.s }]}>
                <View style={[styles.enteteElement, { gap: espace.s }]}>
                  <Pressable
                    onPress={() =>
                      changerAbsence(index, { motif: motifSuivant(absence.motif) })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Motif de l’absence ${index + 1} : ${motif}`}
                    accessibilityHint="Appuyez pour passer au motif suivant."
                    style={({ pressed }) => [
                      styles.ligneAction,
                      {
                        flex: 1,
                        minHeight: cibleTactile,
                        paddingHorizontal: espace.m,
                        gap: espace.s,
                        backgroundColor: pressed ? couleurs.surfacePressee : couleurs.surface,
                      },
                    ]}>
                    <Texte variante="corps">
                      Motif :{' '}
                      <Texte variante="corps" gras>
                        {motif}
                      </Texte>
                    </Texte>
                    <Texte variante="sousTitre" ton="teinte">
                      Changer
                    </Texte>
                  </Pressable>
                  <BoutonSupprimer
                    label={`Supprimer l’absence ${index + 1}`}
                    onPress={() => supprimerAbsence(index)}
                  />
                </View>

                <View style={[styles.champsHeures, { gap: espace.s }]}>
                  <Champ
                    valeur={absence.du}
                    onChangeText={(du) => changerAbsence(index, { du })}
                    label="Du"
                    placeholder="AAAA-MM-JJ"
                    accessibilityLabel={`Début de l’absence ${index + 1}`}
                    erreur={messageErreur(`absences.${index}.du`)}
                    maxLength={10}
                    style={styles.champSouple}
                  />
                  <Champ
                    valeur={absence.au}
                    onChangeText={(au) => changerAbsence(index, { au })}
                    label="Au"
                    placeholder="AAAA-MM-JJ"
                    accessibilityLabel={`Fin de l’absence ${index + 1}`}
                    erreur={messageErreur(`absences.${index}.au`)}
                    maxLength={10}
                    style={styles.champSouple}
                  />
                </View>
              </View>
            );
          })}

          <Ligne titre="Ajouter une absence" onPress={ajouterAbsence} />
        </Section>
      </Ecran>
    </>
  );
}

const styles = StyleSheet.create({
  boutonEntete: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  boutonSupprimer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  element: {
    flexDirection: 'column',
  },
  enteteElement: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ligneAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titreElement: {
    flex: 1,
  },
  champsHeures: {
    flexDirection: 'row',
  },
  champSouple: {
    flex: 1,
  },
  champ: {
    borderWidth: StyleSheet.hairlineWidth,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
});
