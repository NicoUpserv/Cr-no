import { Onglets } from '@/components/onglets';

/** Onglets de l'élève (document du client : Accueil, Mes infos, Messages, Planning, Menu). */
export default function OngletsEleve() {
  return (
    <Onglets
      onglets={[
        { nom: '(accueil)', titre: 'Accueil', sf: 'house', md: 'home', icone: 'accueil' },
        { nom: 'planning', titre: 'Planning', sf: 'calendar', md: 'calendar_month', icone: 'calendrier' },
        { nom: 'infos', titre: 'Mes infos', sf: 'person.crop.circle', md: 'account_circle', icone: 'eleve' },
        { nom: 'messages', titre: 'Messages', sf: 'bubble.left.and.bubble.right', md: 'forum', icone: 'message' },
        { nom: 'menu', titre: 'Menu', sf: 'line.3.horizontal', md: 'menu', icone: 'menu' },
      ]}
    />
  );
}
