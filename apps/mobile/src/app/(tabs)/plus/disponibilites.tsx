import { idMoniteurConnecte } from '@/data/depot';
import { EcranDisponibilites } from '@/ecrans/disponibilites';

export default function MesDisponibilites() {
  return <EcranDisponibilites moniteurId={idMoniteurConnecte()} titre="Mes disponibilités" />;
}
