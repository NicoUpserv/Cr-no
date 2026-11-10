import { Onglets } from '@/components/onglets';

/** Onglets de l'enseignant. */
export default function OngletsEnseignant() {
  return (
    <Onglets
      onglets={[
        { nom: '(aujourdhui)', titre: 'Aujourd’hui', sf: 'calendar', md: 'today', icone: 'calendrier' },
        { nom: 'eleves', titre: 'Élèves', sf: 'person.2', md: 'group', icone: 'equipe' },
        { nom: 'planning', titre: 'Planning', sf: 'calendar.day.timeline.left', md: 'view_timeline', icone: 'horloge' },
        { nom: 'parcours', titre: 'Parcours', sf: 'map', md: 'map', icone: 'route' },
        { nom: 'plus', titre: 'Plus', sf: 'ellipsis.circle', md: 'more_horiz', icone: 'menu' },
      ]}
    />
  );
}
