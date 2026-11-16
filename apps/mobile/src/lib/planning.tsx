/**
 * Planning partagé entre les profils (démonstration : en mémoire).
 * Une réservation de l'élève apparaît chez l'enseignant et la direction ; une disponibilité
 * modifiée par la direction change les créneaux proposés aux élèves.
 * Sera remplacé par la base de données (avec contrôle des doubles réservations côté serveur).
 */
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import { demandesAbsenceEnAttente, disponibilitesInitiales, leconsAnnuleesInitiales, leconsEnregistrees } from '@/data/depot';
import type { DemandeAbsence, DisponibilitesMoniteur, Lecon, Lieu } from '@/data/types';
import { creneauxLibres, dateLocale, numeroterLecons, type Creneau } from '@/features/planning/creneaux';

type Contexte = {
  reservations: Lecon[];
  annulees: string[];
  dispos: DisponibilitesMoniteur[];
  demandesTraitees: string[];
  depots: Record<string, Lieu>;
  modifierDepot: (leconId: string, lieu: Lieu) => void;
  setReservations: (maj: (r: Lecon[]) => Lecon[]) => void;
  annuler: (leconId: string) => void;
  enregistrerDisponibilites: (d: DisponibilitesMoniteur) => void;
  traiterDemande: (demande: DemandeAbsence, acceptee: boolean) => void;
};

const ContextePlanning = createContext<Contexte | null>(null);

export function FournisseurPlanning({ children }: { children: ReactNode }) {
  const [reservations, setReservations] = useState<Lecon[]>([]);
  const [annulees, setAnnulees] = useState<string[]>(leconsAnnuleesInitiales);
  const [depots, setDepots] = useState<Record<string, Lieu>>({});
  const modifierDepot = useCallback((leconId: string, lieu: Lieu) => setDepots((d) => ({ ...d, [leconId]: lieu })), []);
  const [dispos, setDispos] = useState<DisponibilitesMoniteur[]>(disponibilitesInitiales);
  const [demandesTraitees, setDemandesTraitees] = useState<string[]>([]);

  const annuler = useCallback((leconId: string) => setAnnulees((a) => (a.includes(leconId) ? a : [...a, leconId])), []);
  const enregistrerDisponibilites = useCallback((d: DisponibilitesMoniteur) => {
    setDispos((actuelles) => [...actuelles.filter((x) => x.moniteurId !== d.moniteurId), d]);
  }, []);
  // Une absence acceptée est ajoutée aux disponibilités : plus aucun créneau proposé sur la période.
  const traiterDemande = useCallback((demande: DemandeAbsence, acceptee: boolean) => {
    setDemandesTraitees((t) => [...t, demande.id]);
    if (!acceptee) return;
    const absence = { id: demande.id, du: demande.du, au: demande.au, motif: demande.motif };
    setDispos((actuelles) => {
      const actuelle = actuelles.find((d) => d.moniteurId === demande.moniteurId) ?? dispoVide(demande.moniteurId);
      return [
        ...actuelles.filter((d) => d.moniteurId !== demande.moniteurId),
        { ...actuelle, absences: [...actuelle.absences, absence] },
      ];
    });
  }, []);

  return (
    <ContextePlanning.Provider
      value={{
        reservations,
        annulees,
        dispos,
        demandesTraitees,
        depots,
        modifierDepot,
        setReservations,
        annuler,
        enregistrerDisponibilites,
        traiterDemande,
      }}>
      {children}
    </ContextePlanning.Provider>
  );
}

const dispoVide = (moniteurId: string): DisponibilitesMoniteur => ({
  moniteurId,
  routine: [],
  ouvertures: [],
  absences: [],
});

export function usePlanning() {
  const contexte = useContext(ContextePlanning);
  if (!contexte) throw new Error('usePlanning doit être utilisé dans FournisseurPlanning');
  const {
    reservations,
    annulees,
    dispos,
    demandesTraitees,
    depots,
    modifierDepot,
    setReservations,
    annuler,
    enregistrerDisponibilites,
    traiterDemande,
  } = contexte;
  const maintenant = new Date();
  const toutes = [...leconsEnregistrees(maintenant), ...reservations].map((l) => (depots[l.id] ? { ...l, lieuFin: depots[l.id] } : l));
  const lecons = numeroterLecons(toutes.filter((l) => !annulees.includes(l.id)));
  const disponibilites = (moniteurId: string) => dispos.find((d) => d.moniteurId === moniteurId) ?? dispoVide(moniteurId);

  return {
    maintenant,
    /** Toutes les leçons (enregistrées + réservées − annulées), numérotées par élève. */
    lecons,
    trouverLecon: (id: string) => lecons.find((l) => l.id === id),
    /** Leçons annulées (affichées en jaune dans le planning ; leur créneau redevient libre). */
    leconsAnnulees: toutes.filter((l) => annulees.includes(l.id)),
    /** Change le lieu de dépôt (l'élève demande à être déposé ailleurs). */
    modifierDepot,
    disponibilites,
    enregistrerDisponibilites,
    creneauxLibres: (moniteurId: string, date: string) =>
      creneauxLibres(disponibilites(moniteurId), lecons, date, maintenant),
    /** Réserve un créneau ; renvoie l'identifiant de la leçon, ou null si le créneau vient d'être pris. */
    reserver: (creneau: Creneau, eleveId: string, lieu: Lieu): string | null => {
      const encoreLibre = creneauxLibres(disponibilites(creneau.moniteurId), lecons, dateLocale(creneau.debut), maintenant).some(
        (c) => c.debut === creneau.debut,
      );
      const dejaPris = lecons.some((l) => l.eleveId === eleveId && l.debut === creneau.debut);
      if (!encoreLibre || dejaPris) return null;
      const id = `r-${eleveId}-${creneau.debut}`;
      setReservations((r) => [
        ...r,
        { id, numero: 0, eleveId, moniteurId: creneau.moniteurId, debut: creneau.debut, fin: creneau.fin, lieuDepart: lieu, lieuFin: lieu },
      ]);
      return id;
    },
    annuler,
    /** Demandes d'absence pas encore acceptées ni refusées. */
    demandesEnAttente: demandesAbsenceEnAttente().filter((d) => !demandesTraitees.includes(d.id)),
    traiterDemande,
  };
}
