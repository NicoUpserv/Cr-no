/**
 * Fiche de leçon remplie par l'enseignant après la leçon (docs/fiche-de-lecon.md).
 * Une fois validée, elle n'est plus modifiable par l'enseignant : l'écran passe en lecture.
 */
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';

import { DetailFiche } from '@/components/detail-fiche';
import { Bouton, Cartouche, ChoixMenu, EtatVide, Ligne, Section, Texte } from '@/components/ui';
import { listerSousCompetences, trouverCours, trouverEleve, trouverLecon, trouverSousCompetence } from '@/data/depot';
import { LONGUEUR_MAX_OBSERVATION, validerFiche, verifierBrouillon } from '@/features/fiches/fiche';
import {
  libellesAppreciation,
  type Appreciation,
  type BrouillonFiche,
  type ErreurFiche,
  type EvaluationSousCompetence,
} from '@/features/fiches/types';
import { formatDateCourte, formatHeure } from '@/lib/format';
import { useFichesEquipe } from '@/lib/fiches-lecon';
import { useTheme } from '@/theme/use-theme';

const RETIRER = 'retirer';
const AJOUTER = '';

function ChampObservation({
  valeur,
  onChange,
  placeholder,
  accessibilityLabel,
  enErreur,
}: {
  valeur: string;
  onChange: (v: string) => void;
  placeholder: string;
  accessibilityLabel: string;
  enErreur: boolean;
}) {
  const { couleurs, espace, rayon, typo, cibleTactile } = useTheme();
  return (
    <TextInput
      value={valeur}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={couleurs.texteTertiaire}
      selectionColor={couleurs.teinte}
      accessibilityLabel={accessibilityLabel}
      multiline
      maxLength={LONGUEUR_MAX_OBSERVATION}
      textAlignVertical="top"
      style={[
        typo.corps,
        styles.champ,
        {
          minHeight: cibleTactile * 2,
          padding: espace.l,
          borderRadius: rayon.groupe,
          borderColor: enErreur ? couleurs.danger : couleurs.surface,
          backgroundColor: couleurs.surface,
          color: couleurs.texte,
        },
      ]}
    />
  );
}

function MessageErreur({ erreurs, champ }: { erreurs: ErreurFiche[]; champ: ErreurFiche['champ'] }) {
  const { espace } = useTheme();
  const message = erreurs.find((e) => e.champ === champ)?.message;
  if (!message) return null;
  return (
    <Texte variante="note" ton="danger" accessibilityRole="alert" style={{ paddingHorizontal: espace.xl, paddingTop: espace.s }}>
      {message}
    </Texte>
  );
}

export function EcranFicheLecon() {
  const { leconId } = useLocalSearchParams<{ leconId: string }>();
  const { espace } = useTheme();
  const { fiches, ajouter } = useFichesEquipe();
  const lecon = trouverLecon(leconId);
  const eleve = lecon ? trouverEleve(lecon.eleveId) : undefined;
  const cours = trouverCours(lecon?.cours?.coursId);
  const ficheExistante = fiches.find((f) => f.leconId === leconId);

  const [brouillon, setBrouillon] = useState<BrouillonFiche>(() => ({
    // Préremplies avec les sous-compétences du cours de la leçon, appréciées « vu » par défaut.
    sousCompetences: (cours?.sousCompetencesIds ?? []).flatMap((id) => {
      const s = trouverSousCompetence(id);
      return s ? [{ sousCompetenceId: s.id, competence: s.competence, appreciation: 'vu' as const }] : [];
    }),
    observationPartagee: '',
    observationInterne: '',
    aSignaler: false,
  }));
  const [erreurs, setErreurs] = useState<ErreurFiche[]>([]);

  if (!lecon || !eleve) {
    return (
      <>
        <Stack.Screen options={{ title: 'Fiche de leçon', headerLargeTitle: false }} />
        <EtatVide icone="document" titre="Leçon introuvable" message="Cette leçon n’existe plus. Revenez à votre journée." />
      </>
    );
  }

  const enTete = (
    <View style={[styles.enTete, { paddingHorizontal: espace.xl, paddingTop: espace.l, gap: espace.s }]}>
      <Cartouche numero={lecon.numero} />
      <Texte variante="titre3">
        {eleve.prenom} {eleve.nom}
      </Texte>
      <Texte variante="sousTitre" ton="secondaire" tabulaire>
        {formatDateCourte(lecon.debut)} · {formatHeure(lecon.debut)}–{formatHeure(lecon.fin)}
      </Texte>
    </View>
  );

  if (ficheExistante) {
    return (
      <>
        <Stack.Screen options={{ title: 'Fiche de leçon', headerLargeTitle: false }} />
        <EcranDefilant>
          {enTete}
          <DetailFiche vue="equipe" fiche={ficheExistante} titre="Sous-compétences travaillées" />
          <Section
            pied={`Fiche validée le ${formatDateCourte(ficheExistante.valideeLe)} à ${formatHeure(ficheExistante.valideeLe)}. Elle n’est plus modifiable : seule la direction peut la corriger.`}
            forme="libre">
            {null}
          </Section>
        </EcranDefilant>
      </>
    );
  }

  const choisies = new Set(brouillon.sousCompetences.map((s) => s.sousCompetenceId));
  const disponibles = listerSousCompetences().filter((s) => !choisies.has(s.id));

  const changer = (maj: Partial<BrouillonFiche>) => {
    const suivant = { ...brouillon, ...maj };
    setBrouillon(suivant);
    // Les erreurs déjà affichées se mettent à jour pendant la saisie.
    if (erreurs.length > 0) setErreurs(verifierBrouillon(suivant));
  };
  const apprecier = (id: string, valeur: Appreciation | typeof RETIRER) =>
    changer({
      sousCompetences:
        valeur === RETIRER
          ? brouillon.sousCompetences.filter((s) => s.sousCompetenceId !== id)
          : brouillon.sousCompetences.map((s) => (s.sousCompetenceId === id ? { ...s, appreciation: valeur } : s)),
    });
  const ajouterSousCompetence = (id: string) => {
    const s = trouverSousCompetence(id);
    if (!s) return;
    const nouvelle: EvaluationSousCompetence = { sousCompetenceId: s.id, competence: s.competence, appreciation: 'vu' };
    changer({ sousCompetences: [...brouillon.sousCompetences, nouvelle] });
  };
  const valider = () => {
    const trouvees = verifierBrouillon(brouillon);
    setErreurs(trouvees);
    if (trouvees.length > 0) return;
    ajouter(
      validerFiche(
        brouillon,
        { leconId: lecon.id, numeroLecon: lecon.numero, eleveId: eleve.id, enseignantId: lecon.moniteurId, date: lecon.debut },
        new Date(),
      ),
    );
  };

  const optionsAppreciation: { valeur: Appreciation | typeof RETIRER; libelle: string }[] = [
    ...(Object.keys(libellesAppreciation) as Appreciation[]).map((a) => ({ valeur: a, libelle: libellesAppreciation[a] })),
    { valeur: RETIRER, libelle: 'Retirer de la fiche' },
  ];

  return (
    <>
      <Stack.Screen options={{ title: 'Fiche de leçon', headerLargeTitle: false }} />
      <EcranDefilant>
        {enTete}

        <Section
          titre="Sous-compétences travaillées"
          pied="Vu : abordé. Acquis : maîtrisé, compte dans la progression. Non maîtrisé : le cours est reproposé à l’élève.">
          {brouillon.sousCompetences.map((s) => (
            <Ligne
              key={s.sousCompetenceId}
              titre={trouverSousCompetence(s.sousCompetenceId)?.libelle ?? s.sousCompetenceId}
              sousTitre={s.competence}
              aDroite={
                <ChoixMenu<Appreciation | typeof RETIRER>
                  valeur={s.appreciation}
                  options={optionsAppreciation}
                  onChange={(v) => apprecier(s.sousCompetenceId, v)}
                  accessibilityLabel="Appréciation"
                />
              }
            />
          ))}
          <Ligne
            icone="ajouter"
            titre="Ajouter une sous-compétence"
            aDroite={
              <ChoixMenu<string>
                valeur={AJOUTER}
                options={[
                  { valeur: AJOUTER, libelle: 'Choisir' },
                  ...disponibles.map((s) => ({ valeur: s.id, libelle: `${s.competence} · ${s.libelle}` })),
                ]}
                onChange={ajouterSousCompetence}
                accessibilityLabel="Ajouter une sous-compétence du livret"
              />
            }
          />
        </Section>
        <MessageErreur erreurs={erreurs} champ="sousCompetences" />

        <Section titre="Observation partagée" pied="Visible par l’élève, les enseignants et la direction." forme="libre">
          <ChampObservation
            valeur={brouillon.observationPartagee}
            onChange={(v) => changer({ observationPartagee: v })}
            placeholder="Ce qui s’est bien passé, ce qu’il faut travailler"
            accessibilityLabel="Observation partagée avec l’élève"
            enErreur={erreurs.some((e) => e.champ === 'observationPartagee')}
          />
        </Section>
        <MessageErreur erreurs={erreurs} champ="observationPartagee" />

        <Section
          titre="Observation interne"
          pied="Visible seulement par les enseignants et la direction. L’élève peut en demander une copie (droit d’accès RGPD) : restez factuel."
          forme="libre">
          <ChampObservation
            valeur={brouillon.observationInterne}
            onChange={(v) => changer({ observationInterne: v })}
            placeholder="Ex. : a freiné tardivement deux fois avant un passage piéton"
            accessibilityLabel="Observation interne, réservée à l’équipe"
            enErreur={erreurs.some((e) => e.champ === 'observationInterne')}
          />
        </Section>
        <MessageErreur erreurs={erreurs} champ="observationInterne" />

        <Section>
          <Ligne
            icone="attention"
            titre="Signaler à l’équipe"
            sousTitre="Alerte sur la fiche de l’élève pour tout enseignant qui le prend, et pour la direction"
            aDroite={
              <Switch
                value={brouillon.aSignaler}
                onValueChange={(v) => changer({ aSignaler: v })}
                accessibilityLabel="Signaler à l’équipe"
              />
            }
          />
        </Section>

        <Section pied="Une fois validée, la fiche ne peut plus être modifiée. Seule la direction peut la corriger." forme="libre">
          {null}
        </Section>
        <View style={{ paddingTop: espace.s }}>
          <Bouton titre="Valider la fiche" onPress={valider} />
        </View>
      </EcranDefilant>
    </>
  );
}

/** Comme `Ecran`, mais adapté à la saisie : le clavier ne masque pas le champ et se ferme au défilement. */
function EcranDefilant({ children }: { children: ReactNode }) {
  const { couleurs, espace } = useTheme();
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets
      style={{ backgroundColor: couleurs.fond }}
      contentContainerStyle={{ paddingBottom: espace.xxxl, gap: espace.xs }}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  enTete: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  champ: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});
