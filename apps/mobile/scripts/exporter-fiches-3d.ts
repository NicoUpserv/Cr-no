/**
 * Exporte les fiches de vérification (numéro, type, texte, zone) pour la voiture 3D (public/voiture-3d/fiches.json).
 * À relancer si src/data/verifications.ts ou le classement par zone change : npx tsx scripts/exporter-fiches-3d.ts
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { fichesVerification } from '../src/data/verifications';
import { libellesZones, zoneDeFiche } from '../src/features/verifications/zones';

const sortie = join(__dirname, '..', 'public', 'voiture-3d', 'fiches.json');
const fiches = fichesVerification.map((f) => ({ numero: f.numero, type: f.type, verification: f.verification, zone: zoneDeFiche(f) }));
writeFileSync(sortie, JSON.stringify({ zones: libellesZones, fiches }));
console.log(`${fiches.length} fiches écrites dans ${sortie}`);
