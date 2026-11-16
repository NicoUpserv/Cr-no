/** Messages de l'élève avec son auto-école (relances du dossier comprises). Tutoiement. */
import { idEleveConnecte } from '@/data/depot';
import { EcranConversation } from '@/ecrans/conversation';

export default function MessagesEleve() {
  return <EcranConversation eleveId={idEleveConnecte()} vue="eleve" />;
}
