import type { DisponibilitesMoniteur } from '@/data/types';

import { validerDisponibilites } from './valider';

const AUJOURDHUI = '2026-11-09';

function creer(partiel: Partial<DisponibilitesMoniteur> = {}): DisponibilitesMoniteur {
  return {
    moniteurId: 'm-1',
    routine: [],
    ouvertures: [],
    absences: [],
    ...partiel,
  };
}

describe('validerDisponibilites', () => {
  it('ne signale rien quand tout est valide', () => {
    const disponibilites = creer({
      routine: [
        { jour: 1, debut: '08:00', fin: '12:00' },
        { jour: 1, debut: '13:00', fin: '17:00' },
      ],
      ouvertures: [{ id: 'o-1', date: '2026-11-21', debut: '09:00', fin: '12:00' }],
      absences: [{ id: 'a-1', du: '2026-12-22', au: '2026-12-31', motif: 'conges' }],
    });

    expect(validerDisponibilites(disponibilites, AUJOURDHUI)).toEqual([]);
  });

  it('refuse une heure au mauvais format ou hors des bornes (R1)', () => {
    const disponibilites = creer({
      routine: [{ jour: 1, debut: '8:00', fin: '24:00' }],
      ouvertures: [{ id: 'o-1', date: '2026-11-21', debut: '09:00', fin: '12h00' }],
    });

    expect(validerDisponibilites(disponibilites, AUJOURDHUI)).toEqual([
      {
        champ: 'routine.0.debut',
        message: 'Heure invalide : utilisez le format HH:MM (ex. 08:30).',
      },
      {
        champ: 'routine.0.fin',
        message: 'Heure invalide : utilisez le format HH:MM (ex. 08:30).',
      },
      {
        champ: 'ouvertures.0.fin',
        message: 'Heure invalide : utilisez le format HH:MM (ex. 08:30).',
      },
    ]);
  });

  it('refuse 23:60 et 08:60 (R1)', () => {
    const disponibilites = creer({
      routine: [{ jour: 2, debut: '08:60', fin: '23:60' }],
    });

    expect(validerDisponibilites(disponibilites, AUJOURDHUI).map((e) => e.champ)).toEqual([
      'routine.0.debut',
      'routine.0.fin',
    ]);
  });

  it("exige une fin strictement après le début (R2)", () => {
    const disponibilites = creer({
      routine: [
        { jour: 1, debut: '12:00', fin: '12:00' },
        { jour: 2, debut: '14:00', fin: '09:00' },
      ],
      ouvertures: [{ id: 'o-1', date: '2026-11-21', debut: '10:00', fin: '10:00' }],
    });

    expect(validerDisponibilites(disponibilites, AUJOURDHUI)).toEqual([
      { champ: 'routine.0.fin', message: "L'heure de fin doit être après l'heure de début." },
      { champ: 'routine.1.fin', message: "L'heure de fin doit être après l'heure de début." },
      { champ: 'ouvertures.0.fin', message: "L'heure de fin doit être après l'heure de début." },
    ]);
  });

  it("signale le chevauchement sur le créneau d'indice le plus grand (R3)", () => {
    const disponibilites = creer({
      routine: [
        { jour: 1, debut: '08:00', fin: '12:00' },
        { jour: 1, debut: '11:00', fin: '13:00' },
      ],
    });

    expect(validerDisponibilites(disponibilites, AUJOURDHUI)).toEqual([
      {
        champ: 'routine.1.debut',
        message: 'Ce créneau chevauche un autre créneau du même jour.',
      },
    ]);
  });

  it('signale le plus grand indice même si son créneau est plus tôt dans la journée (R3)', () => {
    const disponibilites = creer({
      routine: [
        { jour: 3, debut: '11:00', fin: '13:00' },
        { jour: 3, debut: '08:00', fin: '12:00' },
      ],
    });

    expect(validerDisponibilites(disponibilites, AUJOURDHUI).map((e) => e.champ)).toEqual([
      'routine.1.debut',
    ]);
  });

  it('autorise deux créneaux qui se touchent (R3)', () => {
    const disponibilites = creer({
      routine: [
        { jour: 1, debut: '08:00', fin: '12:00' },
        { jour: 1, debut: '12:00', fin: '14:00' },
      ],
    });

    expect(validerDisponibilites(disponibilites, AUJOURDHUI)).toEqual([]);
  });

  it('ne compare pas deux créneaux de jours différents (R3)', () => {
    const disponibilites = creer({
      routine: [
        { jour: 1, debut: '08:00', fin: '12:00' },
        { jour: 2, debut: '08:00', fin: '12:00' },
      ],
    });

    expect(validerDisponibilites(disponibilites, AUJOURDHUI)).toEqual([]);
  });

  it('ignore les créneaux invalides dans la détection de chevauchement (R3)', () => {
    const disponibilites = creer({
      routine: [
        { jour: 1, debut: '08:00', fin: '12:00' },
        { jour: 1, debut: '11:00', fin: '10:00' },
      ],
    });

    expect(validerDisponibilites(disponibilites, AUJOURDHUI)).toEqual([
      { champ: 'routine.1.fin', message: "L'heure de fin doit être après l'heure de début." },
    ]);
  });

  it("refuse une ouverture passée, mal formée ou inexistante (R4)", () => {
    const disponibilites = creer({
      ouvertures: [
        { id: 'o-1', date: '2026-11-08', debut: '09:00', fin: '12:00' },
        { id: 'o-2', date: '2026-02-30', debut: '09:00', fin: '12:00' },
        { id: 'o-3', date: '21/11/2026', debut: '09:00', fin: '12:00' },
      ],
    });

    expect(validerDisponibilites(disponibilites, AUJOURDHUI)).toEqual([
      { champ: 'ouvertures.0.date', message: "La date doit être aujourd'hui ou plus tard." },
      { champ: 'ouvertures.1.date', message: "La date doit être aujourd'hui ou plus tard." },
      { champ: 'ouvertures.2.date', message: "La date doit être aujourd'hui ou plus tard." },
    ]);
  });

  it("accepte une ouverture aujourd'hui ou plus tard (R4)", () => {
    const disponibilites = creer({
      ouvertures: [
        { id: 'o-1', date: AUJOURDHUI, debut: '09:00', fin: '12:00' },
        { id: 'o-2', date: '2026-11-10', debut: '09:00', fin: '12:00' },
      ],
    });

    expect(validerDisponibilites(disponibilites, AUJOURDHUI)).toEqual([]);
  });

  it('refuse une absence dont la fin précède le début (R5)', () => {
    const disponibilites = creer({
      absences: [{ id: 'a-1', du: '2026-12-31', au: '2026-12-22', motif: 'repos' }],
    });

    expect(validerDisponibilites(disponibilites, AUJOURDHUI)).toEqual([
      { champ: 'absences.0.au', message: 'La date de fin doit être après la date de début.' },
    ]);
  });

  it('accepte une absence sur une seule journée (R5)', () => {
    const disponibilites = creer({
      absences: [{ id: 'a-1', du: '2026-12-22', au: '2026-12-22', motif: 'maladie' }],
    });

    expect(validerDisponibilites(disponibilites, AUJOURDHUI)).toEqual([]);
  });

  it("refuse une absence dont une date n'existe pas (R5)", () => {
    const disponibilites = creer({
      absences: [
        { id: 'a-1', du: '2026-02-30', au: '2026-03-02', motif: 'autre' },
        { id: 'a-2', du: '2026-03-01', au: '2026-13-01', motif: 'autre' },
      ],
    });

    expect(validerDisponibilites(disponibilites, AUJOURDHUI).map((e) => e.champ)).toEqual([
      'absences.0.au',
      'absences.1.au',
    ]);
  });

  it('rend les erreurs dans l’ordre routine, ouvertures, absences', () => {
    const disponibilites = creer({
      routine: [{ jour: 1, debut: '25:00', fin: '12:00' }],
      ouvertures: [{ id: 'o-1', date: '2026-11-08', debut: '09:00', fin: '12:00' }],
      absences: [{ id: 'a-1', du: '2026-12-31', au: '2026-12-22', motif: 'repos' }],
    });

    expect(validerDisponibilites(disponibilites, AUJOURDHUI).map((e) => e.champ)).toEqual([
      'routine.0.debut',
      'ouvertures.0.date',
      'absences.0.au',
    ]);
  });
});
