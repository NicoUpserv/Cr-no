import { Stack, useRouter } from 'expo-router';

import { Cartouche, Ecran, EtatVide, Ligne, PanneauDirection, Section } from '@/components/ui';
import { idMoniteurConnecte, trouverEleve } from '@/data/depot';
import { leconsDuMoniteur, leconsTermineesDuJour } from '@/features/planning/lecons';
import { formatDans, formatHeure, formatJour } from '@/lib/format';
import { useFichesEquipe } from '@/lib/fiches-lecon';
import { ouvrirItineraire } from '@/lib/itineraire';
import { usePlanning } from '@/lib/planning';

export default function Aujourdhui() {
  const router = useRouter();
  const { lecons: toutes, maintenant } = usePlanning();
  const { fiches } = useFichesEquipe();
  const lecons = leconsDuMoniteur(toutes, idMoniteurConnecte()).filter((l) => new Date(l.fin) > maintenant);
  const terminees = leconsTermineesDuJour(toutes, idMoniteurConnecte(), maintenant);
  const aRemplir = terminees.filter((l) => !fiches.some((f) => f.leconId === l.id));
  const [prochaine, ...suivantes] = lecons;
  const eleveProchaine = prochaine ? trouverEleve(prochaine.eleveId) : undefined;

  return (
    <>
      <Stack.Screen options={{ title: 'Aujourd’hui' }} />
      <Ecran>
        {terminees.length > 0 ? (
          <Section
            titre="Fiches de leçon"
            pied={aRemplir.length > 0 ? 'À remplir après chaque leçon : appréciations et observations.' : undefined}>
            {terminees.map((lecon) => {
              const eleve = trouverEleve(lecon.eleveId);
              const remplie = !aRemplir.includes(lecon);
              return (
                <Ligne
                  key={lecon.id}
                  icone={remplie ? 'valider' : 'document'}
                  titre={eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève'}
                  sousTitre={`Terminée à ${formatHeure(lecon.fin)} · ${remplie ? 'fiche validée' : 'fiche à remplir'}`}
                  sousTitreAlerte={!remplie}
                  aDroite={<Cartouche numero={lecon.numero} />}
                  onPress={() => router.push({ pathname: '/fiche/[leconId]', params: { leconId: lecon.id } })}
                />
              );
            })}
          </Section>
        ) : null}

        {prochaine && eleveProchaine ? (
          <Section titre="Prochaine leçon" forme="libre">
            <PanneauDirection
              lieuDepart={prochaine.lieuDepart.nom}
              heureDebut={formatHeure(prochaine.debut)}
              lieuFin={prochaine.lieuFin.nom}
              heureFin={formatHeure(prochaine.fin)}
              quand={formatDans(prochaine.debut, prochaine.fin, maintenant)}
              avecQui={`avec ${eleveProchaine.prenom} ${eleveProchaine.nom}`}
              onItineraire={() => ouvrirItineraire(prochaine.lieuDepart.adresse)}
            />
          </Section>
        ) : (
          <EtatVide icone="calendrier" titre="Aucune leçon à venir" message="Vos prochaines leçons apparaîtront ici." />
        )}

        {suivantes.length > 0 ? (
          <Section titre="Ensuite">
            {suivantes.map((lecon) => {
              const eleve = trouverEleve(lecon.eleveId);
              return (
                <Ligne
                  key={lecon.id}
                  titre={eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève'}
                  sousTitre={`${formatJour(lecon.debut, maintenant)} · ${formatHeure(lecon.debut)} · ${lecon.lieuDepart.nom}`}
                  aDroite={<Cartouche numero={lecon.numero} />}
                  onPress={() => router.push({ pathname: '/eleves/[id]', params: { id: lecon.eleveId } })}
                />
              );
            })}
          </Section>
        ) : null}

        {eleveProchaine ? (
          <Section titre="Élève de la prochaine leçon">
            <Ligne
              titre={`Fiche de ${eleveProchaine.prenom} ${eleveProchaine.nom}`}
              onPress={() => router.push({ pathname: '/eleves/[id]', params: { id: eleveProchaine.id } })}
            />
          </Section>
        ) : null}
      </Ecran>
    </>
  );
}
