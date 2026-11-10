import { EcranListeEleves } from '@/ecrans/liste-eleves';

export default function ListeElevesEnseignant() {
  return <EcranListeEleves cheminFiche="/eleves/[id]" />;
}
