/** Planning de l'élève : ses prochaines leçons. Tutoiement. */
import { Stack } from 'expo-router';

import { Cartouche, Ecran, EtatVide, Ligne, Section } from '@/components/ui';
import { idEleveConnecte, leconsDeLEleve, trouverMoniteur } from '@/data/depot';
import { formatHeure, formatJour } from '@/lib/format';

export default function PlanningEleve() {
  const maintenant = new Date();
  const lecons = leconsDeLEleve(idEleveConnecte(), maintenant).filter((l) => new Date(l.fin) > maintenant);

  return (
    <>
      <Stack.Screen options={{ title: 'Planning' }} />
      {lecons.length === 0 ? (
        <EtatVide icone="calendrier" titre="Aucune leçon prévue" message="Réserve ta prochaine leçon parmi les créneaux libres de tes enseignants." />
      ) : (
        <Ecran>
          <Section titre="Mes prochaines leçons">
            {lecons.map((lecon) => {
              const moniteur = trouverMoniteur(lecon.moniteurId);
              return (
                <Ligne
                  key={lecon.id}
                  titre={`${formatJour(lecon.debut, maintenant)} · ${formatHeure(lecon.debut)} → ${formatHeure(lecon.fin)}`}
                  sousTitre={`${lecon.lieuDepart.nom}${moniteur ? ` · avec ${moniteur.prenom} ${moniteur.nom}` : ''}`}
                  aDroite={<Cartouche numero={lecon.numero} />}
                />
              );
            })}
          </Section>
          <Section pied="Tu choisis l’enseignant, le jour, l’heure et le lieu parmi les créneaux libres. Tes enseignants favoris te préviennent quand ils ouvrent un créneau qui te correspond.">
            <Ligne icone="ajouter" titre="Réserver une leçon" sousTitre="Bientôt disponible" />
          </Section>
        </Ecran>
      )}
    </>
  );
}
