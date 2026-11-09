import { Stack, useRouter } from 'expo-router';

import { Cartouche, Ecran, EtatVide, Ligne, PanneauDirection, Section } from '@/components/ui';
import { idMoniteurConnecte, leconsDuMoniteur, trouverEleve } from '@/data/depot';
import { formatDans, formatHeure, formatJour } from '@/lib/format';
import { ouvrirItineraire } from '@/lib/itineraire';

export default function Aujourdhui() {
  const router = useRouter();
  const maintenant = new Date();
  const lecons = leconsDuMoniteur(idMoniteurConnecte(), maintenant).filter((l) => new Date(l.fin) > maintenant);
  const [prochaine, ...suivantes] = lecons;
  const eleveProchaine = prochaine ? trouverEleve(prochaine.eleveId) : undefined;

  return (
    <>
      <Stack.Screen options={{ title: 'Aujourd’hui' }} />
      <Ecran>
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
