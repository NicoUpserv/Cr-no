/**
 * Affichage d'une fiche de leçon validée.
 * `vue="equipe"` : tout (enseignants et direction). `vue="eleve"` : jamais l'observation interne.
 */
import { Ligne, Section, Texte } from '@/components/ui';
import { trouverMoniteur, trouverSousCompetence } from '@/data/depot';
import { libellesAppreciation, type Appreciation, type FicheLecon, type FicheVueEleve } from '@/features/fiches/types';
import { formatDateCourte } from '@/lib/format';

type Props =
  | { vue: 'equipe'; fiche: FicheLecon; titre?: string }
  | { vue: 'eleve'; fiche: FicheVueEleve; titre?: string };

const tonAppreciation: Record<Appreciation, 'teinte' | 'secondaire' | 'danger'> = {
  acquis: 'teinte',
  vu: 'secondaire',
  'non-maitrise': 'danger',
};

export function DetailFiche(props: Props) {
  const { fiche, vue } = props;
  const enseignant = trouverMoniteur(fiche.enseignantId);
  const titre =
    props.titre ??
    `L${fiche.numeroLecon} · ${formatDateCourte(fiche.date)}${enseignant ? ` · ${enseignant.prenom} ${enseignant.nom}` : ''}`;
  const corrections = props.vue === 'equipe' ? props.fiche.corrections : [];

  return (
    <>
      <Section
        titre={titre}
        pied={
          vue === 'eleve'
            ? 'Acquis : compte dans ta progression. Non maîtrisé : le cours te sera reproposé avant ta prochaine leçon.'
            : undefined
        }>
        {fiche.sousCompetences.map((s) => {
          const sousCompetence = trouverSousCompetence(s.sousCompetenceId);
          return (
            <Ligne
              key={s.sousCompetenceId}
              titre={sousCompetence?.libelle ?? s.sousCompetenceId}
              sousTitre={s.competence}
              aDroite={
                <Texte variante="sousTitre" ton={tonAppreciation[s.appreciation]} gras>
                  {libellesAppreciation[s.appreciation]}
                </Texte>
              }
            />
          );
        })}
      </Section>

      {fiche.observationPartagee ? (
        <Section
          titre={vue === 'eleve' ? 'Le mot de ton enseignant' : 'Observation partagée'}
          pied={vue === 'equipe' ? 'Visible par l’élève.' : undefined}>
          <Ligne icone="observation" titre={fiche.observationPartagee} />
        </Section>
      ) : null}

      {props.vue === 'equipe' && props.fiche.observationInterne ? (
        <Section
          titre="Observation interne"
          pied={
            corrections.length > 0
              ? `Réservée aux enseignants et à la direction. Corrigée par la direction le ${formatDateCourte(corrections[corrections.length - 1].le)}.`
              : 'Réservée aux enseignants et à la direction.'
          }>
          <Ligne
            icone={props.fiche.aSignaler ? 'attention' : 'observation'}
            titre={props.fiche.observationInterne}
            sousTitre={props.fiche.aSignaler ? 'Signalée à l’équipe' : undefined}
            sousTitreAlerte={props.fiche.aSignaler}
          />
        </Section>
      ) : null}
    </>
  );
}
