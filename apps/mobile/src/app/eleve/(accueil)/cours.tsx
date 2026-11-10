/**
 * Aperçu du cours avant la leçon (démonstration de la structure).
 * Le lecteur complet (vidéos, fiche, quiz aléatoire) suit docs/cours-avant-lecon.md.
 */
import { Stack } from 'expo-router';

import { Ecran, Ligne, Section } from '@/components/ui';
import { idEleveConnecte, prochaineLecon } from '@/data/depot';
import { formatHeure, formatJour } from '@/lib/format';

const etapes = [
  { titre: 'Vidéos', detail: 'Environ 5 min · plusieurs vidéos courtes', icone: 'cours' as const },
  { titre: 'Fiches techniques', detail: 'Environ 5 min · les étapes à retenir', icone: 'document' as const },
  { titre: 'Quiz', detail: 'Environ 3 min · 6 questions, 5 bonnes réponses pour valider', icone: 'valider' as const },
  { titre: 'Bilan', detail: 'Environ 1 min · ton résultat et les corrections', icone: 'livret' as const },
  { titre: 'Ce que dit la loi', detail: 'Environ 1 min · amende, points, risques', icone: 'attention' as const },
];

export default function CoursAvantLecon() {
  const lecon = prochaineLecon(idEleveConnecte());
  const titre = lecon?.cours?.titre ?? 'Ton cours';

  return (
    <>
      <Stack.Screen options={{ title: titre, headerLargeTitle: false }} />
      <Ecran>
        <Section
          titre="Ton cours · environ 15 min"
          pied={
            lecon
              ? `À valider avant ta leçon de ${formatJour(lecon.debut).toLowerCase()} à ${formatHeure(lecon.debut)}. Si tu rates le quiz, relis la fiche, revois la vidéo et recommence : les questions changent à chaque fois.`
              : undefined
          }>
          {etapes.map((etape, index) => (
            <Ligne key={etape.titre} icone={etape.icone} titre={`${index + 1}. ${etape.titre}`} sousTitre={etape.detail} />
          ))}
        </Section>
        <Section pied="Aperçu de démonstration : les contenus du cours (vidéos, fiche, questions) seront ceux de ton auto-école.">
          <Ligne icone="cours" titre="Le lecteur de cours arrive dans la prochaine version" />
        </Section>
      </Ecran>
    </>
  );
}
