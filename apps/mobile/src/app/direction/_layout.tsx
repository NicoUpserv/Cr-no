import { Onglets } from '@/components/onglets';

/** Onglets de la direction : tout se pilote depuis le téléphone. */
export default function OngletsDirection() {
  return (
    <Onglets
      onglets={[
        { nom: '(accueil)', titre: 'Accueil', sf: 'house', md: 'home', icone: 'accueil' },
        { nom: 'planning', titre: 'Planning', sf: 'calendar.day.timeline.left', md: 'view_timeline', icone: 'horloge' },
        { nom: 'eleves', titre: 'Élèves', sf: 'person.2', md: 'group', icone: 'eleve' },
        { nom: 'equipe', titre: 'Équipe', sf: 'person.3', md: 'groups', icone: 'equipe' },
        { nom: 'plus', titre: 'Plus', sf: 'ellipsis.circle', md: 'more_horiz', icone: 'menu' },
      ]}
    />
  );
}
