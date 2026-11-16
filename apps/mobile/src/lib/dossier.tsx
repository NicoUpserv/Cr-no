/**
 * Dossier de l'élève et messagerie élève ↔ auto-école (démonstration : en mémoire).
 * Réservés à la direction et à l'élève : les enseignants ne voient ni les pièces ni les messages.
 * Une pièce refusée ou une relance de la direction arrive dans la conversation de l'élève.
 * Sera remplacé par la base de données (et l'envoi réel des e-mails).
 */
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import { documentsAValider, listerEleves, messagesInitiaux, trouverEleve } from '@/data/depot';
import type { DocumentRecu, Message } from '@/data/types';
import { texteRelance } from '@/features/dossier/relances';

type Vue = 'eleve' | 'direction';
export type StatutPiece = 'manquante' | 'en-verification';

type Contexte = {
  messages: Message[];
  pieces: Record<string, string[]>;
  documents: DocumentRecu[];
  lu: Record<Vue, Record<string, string>>;
  envoyer: (eleveId: string, de: Message['de'], texte: string, relance?: Message['relance']) => void;
  traiterDocument: (doc: DocumentRecu, conforme: boolean) => void;
  envoyerPiece: (eleveId: string, titre: string) => void;
  marquerLu: (eleveId: string, vue: Vue) => void;
};

const ContexteDossier = createContext<Contexte | null>(null);

export function FournisseurDossier({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>(messagesInitiaux);
  const [pieces, setPieces] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(listerEleves().map((e) => [e.id, e.piecesManquantes])),
  );
  const [documents, setDocuments] = useState<DocumentRecu[]>(documentsAValider);
  const [lu, setLu] = useState<Record<Vue, Record<string, string>>>({ eleve: {}, direction: {} });

  const envoyer = useCallback((eleveId: string, de: Message['de'], texte: string, relance?: Message['relance']) => {
    const envoyeLe = new Date().toISOString();
    setMessages((m) => [...m, { id: `msg-${eleveId}-${envoyeLe}`, eleveId, de, texte, envoyeLe, relance }]);
    // Écrire une réponse vaut lecture de la conversation.
    setLu((l) => ({ ...l, [de === 'eleve' ? 'eleve' : 'direction']: { ...l[de === 'eleve' ? 'eleve' : 'direction'], [eleveId]: envoyeLe } }));
  }, []);

  const traiterDocument = useCallback(
    (doc: DocumentRecu, conforme: boolean) => {
      setDocuments((d) => d.filter((x) => x.id !== doc.id));
      if (conforme) {
        setPieces((p) => ({ ...p, [doc.eleveId]: (p[doc.eleveId] ?? []).filter((t) => t !== doc.titre) }));
      } else {
        const prenom = trouverEleve(doc.eleveId)?.prenom ?? '';
        envoyer(doc.eleveId, 'auto-ecole', `Bonjour ${prenom}, ta pièce « ${doc.titre} » n’est pas lisible ou pas conforme. Renvoie-la depuis Mes infos, avec une photo nette et entière.`);
      }
    },
    [envoyer],
  );

  const envoyerPiece = useCallback((eleveId: string, titre: string) => {
    setDocuments((d) => [...d.filter((x) => !(x.eleveId === eleveId && x.titre === titre)), { id: `doc-${eleveId}-${titre}`, eleveId, titre, recuLe: new Date().toISOString() }]);
    setPieces((p) => ({ ...p, [eleveId]: (p[eleveId] ?? []).includes(titre) ? p[eleveId] : [...(p[eleveId] ?? []), titre] }));
  }, []);

  const marquerLu = useCallback((eleveId: string, vue: Vue) => {
    setLu((l) => ({ ...l, [vue]: { ...l[vue], [eleveId]: new Date().toISOString() } }));
  }, []);

  return (
    <ContexteDossier.Provider value={{ messages, pieces, documents, lu, envoyer, traiterDocument, envoyerPiece, marquerLu }}>
      {children}
    </ContexteDossier.Provider>
  );
}

export function useDossier() {
  const c = useContext(ContexteDossier);
  if (!c) throw new Error('useDossier doit être utilisé dans FournisseurDossier');
  const conversation = (eleveId: string) => c.messages.filter((m) => m.eleveId === eleveId);
  const nonLus = (eleveId: string, vue: Vue) => {
    const depuis = c.lu[vue][eleveId];
    const deLAutre = vue === 'eleve' ? 'auto-ecole' : 'eleve';
    return conversation(eleveId).filter((m) => m.de === deLAutre && (!depuis || m.envoyeLe > depuis)).length;
  };
  const piecesManquantes = (eleveId: string) => c.pieces[eleveId] ?? [];

  return {
    conversation,
    nonLus,
    /** Conversations pour la direction : la plus récente en premier. */
    conversations: () =>
      [...new Set(c.messages.map((m) => m.eleveId))]
        .map((eleveId) => ({ eleveId, dernier: conversation(eleveId).at(-1) as Message }))
        .sort((a, b) => b.dernier.envoyeLe.localeCompare(a.dernier.envoyeLe)),
    envoyer: c.envoyer,
    marquerLu: c.marquerLu,
    piecesManquantes,
    statutPiece: (eleveId: string, titre: string): StatutPiece =>
      c.documents.some((d) => d.eleveId === eleveId && d.titre === titre) ? 'en-verification' : 'manquante',
    /** Documents envoyés par les élèves, à vérifier par la direction. */
    documentsAVerifier: (eleveId?: string) => c.documents.filter((d) => !eleveId || d.eleveId === eleveId),
    traiterDocument: c.traiterDocument,
    /** Simulation de l'envoi d'une photo par l'élève (pas d'appareil photo dans la démo). */
    envoyerPiece: c.envoyerPiece,
    /** Relance envoyée par la direction : message dans l'appli (l'e-mail n'est pas encore actif dans la démo). */
    relancer: (eleveId: string) => {
      const eleve = trouverEleve(eleveId);
      const manquantes = piecesManquantes(eleveId);
      if (!eleve || manquantes.length === 0) return;
      c.envoyer(eleveId, 'auto-ecole', texteRelance(eleve.prenom, manquantes), 'manuelle');
    },
  };
}
