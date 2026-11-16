/**
 * Voiture 3D générique (citadine 5 portes, sans marque ni logo) pour réviser les vérifications
 * intérieures et extérieures de l'examen. Modélisée en code avec des formes simples.
 *
 * Paramètres d'adresse :
 *   ?zone=moteur        ouvre directement une zone (poste, habitacle, moteur, avant, carrosserie, roues, arriere, coffre)
 *   ?theme=sombre|clair force le thème
 *   ?appli=1            affichée dans l'appli Créno : le bouton « Voir les fiches » prévient l'appli
 *   ?video=capot|pneus  mode tournage : pas d'interface, image calculée par window.rendreA(t)
 *
 * Repère : x vers l'avant, y vers le haut, z vers la droite du conducteur (le conducteur est côté z négatif).
 */
import * as THREE from 'three';
import { OrbitControls } from './lib/OrbitControls.js';
import { RoomEnvironment } from './lib/RoomEnvironment.js';
import { RoundedBoxGeometry } from './lib/RoundedBoxGeometry.js';

const params = new URLSearchParams(location.search);
const MODE_VIDEO = params.get('video');
const DANS_APPLI = params.get('appli') === '1' || Boolean(window.ReactNativeWebView);
const themeForce = params.get('theme');
if (themeForce) document.documentElement.dataset.theme = themeForce;
const sombre = MODE_VIDEO ? false : themeForce ? themeForce === 'sombre' : matchMedia('(prefers-color-scheme: dark)').matches;
if (DANS_APPLI) document.body.classList.add('dans-appli');
if (MODE_VIDEO) document.body.classList.add('mode-video');

/* ------------------------------------------------------------------ */
/* Rendu, scène, lumière                                               */
/* ------------------------------------------------------------------ */

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: Boolean(MODE_VIDEO) });
renderer.setPixelRatio(MODE_VIDEO ? 1 : Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const couleurFond = sombre ? 0x151920 : 0xeef1f5;
scene.background = new THREE.Color(couleurFond);
scene.fog = new THREE.Fog(couleurFond, 14, 30);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(36, 1, 0.03, 80);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 0.6;
controls.maxDistance = 11;
controls.maxPolarAngle = Math.PI * 0.495;
controls.enablePan = false;

scene.add(new THREE.HemisphereLight(0xffffff, sombre ? 0x30343a : 0xb9c0c9, 0.9));
const soleil = new THREE.DirectionalLight(0xffffff, 1.6);
soleil.position.set(4, 8, -3);
soleil.castShadow = true;
soleil.shadow.mapSize.set(2048, 2048);
soleil.shadow.camera.left = -4;
soleil.shadow.camera.right = 4;
soleil.shadow.camera.top = 4;
soleil.shadow.camera.bottom = -4;
soleil.shadow.radius = 6;
soleil.shadow.bias = -0.0005;
scene.add(soleil);

// Sol : disque légèrement plus foncé + ombre douce.
const sol = new THREE.Mesh(
  new THREE.CircleGeometry(9, 64),
  new THREE.MeshStandardMaterial({ color: sombre ? 0x1c2129 : 0xdfe3e9, roughness: 1 }),
);
sol.rotation.x = -Math.PI / 2;
sol.receiveShadow = true;
scene.add(sol);

/* ------------------------------------------------------------------ */
/* Matériaux                                                           */
/* ------------------------------------------------------------------ */

const M = {
  carrosserie: new THREE.MeshPhysicalMaterial({ color: 0xf3f4f6, metalness: 0.15, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08 }),
  plastique: new THREE.MeshStandardMaterial({ color: 0x24282e, roughness: 0.75 }),
  verre: new THREE.MeshPhysicalMaterial({ color: 0x1c2a36, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.42, side: THREE.DoubleSide }),
  chrome: new THREE.MeshStandardMaterial({ color: 0xd2d6db, metalness: 1, roughness: 0.18 }),
  pneu: new THREE.MeshStandardMaterial({ color: 0x1b1c1e, roughness: 0.92 }),
  jante: new THREE.MeshStandardMaterial({ color: 0xbfc4ca, metalness: 0.85, roughness: 0.28 }),
  disque: new THREE.MeshStandardMaterial({ color: 0x6b6f75, metalness: 0.9, roughness: 0.45 }),
  interieur: new THREE.MeshStandardMaterial({ color: 0x2d3238, roughness: 0.85 }),
  tissu: new THREE.MeshStandardMaterial({ color: 0x3b414a, roughness: 0.95 }),
  moteur: new THREE.MeshStandardMaterial({ color: 0x7d838b, metalness: 0.6, roughness: 0.45 }),
  feuAvant: new THREE.MeshStandardMaterial({ color: 0xe9eef4, metalness: 0.2, roughness: 0.1, emissive: 0xffffff, emissiveIntensity: 0 }),
  feuDiurne: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.25 }),
  feuArriere: new THREE.MeshStandardMaterial({ color: 0x8c1016, roughness: 0.2, emissive: 0xff1a1a, emissiveIntensity: 0.12 }),
  clignotant: new THREE.MeshStandardMaterial({ color: 0xc9772a, roughness: 0.2, emissive: 0xff9a1f, emissiveIntensity: 0 }),
  recul: new THREE.MeshStandardMaterial({ color: 0xe9eef4, roughness: 0.2, emissive: 0xffffff, emissiveIntensity: 0 }),
  jaune: new THREE.MeshStandardMaterial({ color: 0xf2c230, roughness: 0.5 }),
  bleu: new THREE.MeshStandardMaterial({ color: 0x1e5bd8, roughness: 0.4 }),
  rouge: new THREE.MeshStandardMaterial({ color: 0xc62828, roughness: 0.45 }),
  noirBrillant: new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.3 }),
  gilet: new THREE.MeshStandardMaterial({ color: 0xd8ff1f, roughness: 0.7, emissive: 0x9fd400, emissiveIntensity: 0.1 }),
};
const translucide = (couleur, opacite = 0.55) =>
  new THREE.MeshPhysicalMaterial({ color: couleur, roughness: 0.25, transparent: true, opacity: opacite, transmission: 0 });

/* ------------------------------------------------------------------ */
/* Aides de modélisation                                               */
/* ------------------------------------------------------------------ */

const voiture = new THREE.Group();
scene.add(voiture);
/** Objets nommés : mise en surbrillance dans les vidéos et ciblage des zones. */
const nommes = {};

function ajouter(parent, geometrie, materiau, x = 0, y = 0, z = 0, nom) {
  const m = new THREE.Mesh(geometrie, materiau);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  if (nom) nommes[nom] = m;
  return m;
}
const boite = (lx, ly, lz, r = 0.02) => new RoundedBoxGeometry(lx, ly, lz, 3, Math.min(r, lx / 2, ly / 2, lz / 2));

/** Profil vu de côté (points x, y), extrudé en épaisseur selon z, avec bords arrondis. */
function profil(points, epaisseur, arrondi = 0.015, trous = []) {
  const forme = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  for (const t of trous) forme.holes.push(new THREE.Path(t.map(([x, y]) => new THREE.Vector2(x, y))));
  const g = new THREE.ExtrudeGeometry(forme, {
    depth: epaisseur,
    bevelEnabled: arrondi > 0,
    bevelSize: arrondi,
    bevelThickness: arrondi,
    bevelSegments: 3,
    curveSegments: 24,
  });
  return g;
}
/** Panneau latéral placé contre le flanc gauche (z négatif) ou droit. */
function flanc(parent, geometrie, materiau, cote, epaisseur, decalage = 0) {
  const z = cote < 0 ? -0.89 + decalage : 0.89 - epaisseur - decalage;
  return ajouter(parent, geometrie, materiau, 0, 0, z);
}

/* Cotes générales (en mètres) : longueur 4,05, largeur 1,78, hauteur 1,44. */
const ROUE_AV = 1.34;
const ROUE_AR = -1.36;
const R_ROUE = 0.31;
const R_PASSAGE = 0.37;

/** Arc de passage de roue (suite de points), parcouru de l'avant vers l'arrière, au-dessus de la roue. */
function arcPassage(cx) {
  const pts = [];
  const a0 = -Math.asin((0.31 - 0.2) / R_PASSAGE);
  for (let i = 0; i <= 24; i += 1) {
    const a = a0 + ((Math.PI - 2 * a0) * i) / 24;
    pts.push([cx + R_PASSAGE * Math.cos(a), 0.31 + R_PASSAGE * Math.sin(a)]);
  }
  return pts;
}
/** Ligne de caisse (haut des flancs) selon x. */
const ligneCaisse = (x) => (x >= 1.0 ? 0.92 - (x - 1.0) * 0.12 : 0.94 + (1.0 - x) * 0.022);

/* ------------------------------------------------------------------ */
/* Carrosserie fixe                                                    */
/* ------------------------------------------------------------------ */

// Aile avant (de la porte au bouclier), avec passage de roue.
const pointsAile = [
  [0.99, 0.27],
  [0.99, ligneCaisse(0.99)],
  [1.5, ligneCaisse(1.5)],
  [1.98, ligneCaisse(1.98)],
  [2.03, 0.72],
  [2.04, 0.5],
  [2.02, 0.27],
  [1.96, 0.2],
  ...arcPassage(ROUE_AV),
  [0.99, 0.2],
];
// Aile arrière (de la porte arrière au bouclier), parcourue dans le même sens que l'aile avant.
const pointsCustode = [
  [-0.95, ligneCaisse(-0.95)],
  [-1.86, ligneCaisse(-1.86)],
  [-2.0, 0.98],
  [-2.04, 0.62],
  [-2.03, 0.27],
  [-1.97, 0.2],
  ...arcPassage(ROUE_AR).reverse(),
  [-0.95, 0.2],
];
// Bas de caisse sous les portes.
const pointsSeuil = [
  [-0.95, 0.2],
  [0.99, 0.2],
  [0.99, 0.27],
  [-0.95, 0.27],
];
for (const cote of [-1, 1]) {
  flanc(voiture, profil(pointsAile, 0.04), M.carrosserie, cote, 0.04);
  flanc(voiture, profil(pointsCustode, 0.04), M.carrosserie, cote, 0.04);
  flanc(voiture, profil(pointsSeuil, 0.06, 0.01), M.plastique, cote, 0.06);
  // Pied milieu (montant B) et montant arrière (C) : noir laqué pour la ligne vitrée.
  flanc(voiture, profil([[-0.06, 0.95], [0.04, 0.95], [0.02, 1.36], [-0.05, 1.36]], 0.03, 0.005), M.noirBrillant, cote, 0.03, 0.1);
  flanc(
    voiture,
    profil([[-0.95, ligneCaisse(-0.95)], [-1.86, ligneCaisse(-1.86)], [-1.42, 1.37], [-1.12, 1.37]], 0.04, 0.01),
    M.carrosserie,
    cote,
    0.04,
    0.08,
  );
}

// Passages de roue : intérieurs sombres (évite de voir à travers la voiture).
const materiauPassage = new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 1, side: THREE.DoubleSide });
for (const x of [ROUE_AV, ROUE_AR]) {
  for (const cote of [-1, 1]) {
    // Demi-cylindre ouvert au-dessus de la roue (axe selon z), seulement sur la largeur de la roue.
    const g = new THREE.CylinderGeometry(R_PASSAGE - 0.01, R_PASSAGE - 0.01, 0.26, 32, 1, true, -Math.PI / 2, Math.PI);
    const m = ajouter(voiture, g, materiauPassage, x, 0.31, cote * 0.74);
    m.rotation.x = -Math.PI / 2;
    // Fond du passage de roue.
    ajouter(voiture, boite(2 * R_PASSAGE, R_PASSAGE, 0.01, 0.005), materiauPassage, x, 0.31 + R_PASSAGE / 2, cote * 0.6);
  }
}

// Bouclier avant, calandre (générique), grille basse, plaque.
ajouter(voiture, boite(0.32, 0.56, 1.8, 0.1), M.carrosserie, 1.9, 0.48, 0);
ajouter(voiture, boite(0.06, 0.16, 1.1, 0.03), M.plastique, 2.05, 0.3, 0);
ajouter(voiture, boite(0.04, 0.07, 0.95, 0.02), M.noirBrillant, 2.05, 0.66, 0);
const plaqueAvant = ajouter(voiture, boite(0.02, 0.11, 0.52, 0.01), new THREE.MeshStandardMaterial({ map: texturePlaque(), roughness: 0.4 }), 2.065, 0.45, 0);
plaqueAvant.rotation.y = Math.PI / 2;
plaqueAvant.geometry = new THREE.PlaneGeometry(0.52, 0.11);
plaqueAvant.position.x = 2.07;

// Projecteurs, feux diurnes, clignotants avant.
for (const cote of [-1, 1]) {
  const proj = ajouter(voiture, boite(0.12, 0.1, 0.36, 0.03), M.feuAvant, 1.99, 0.71, cote * 0.6, cote < 0 ? 'projecteur-gauche' : 'projecteur-droit');
  proj.rotation.y = cote * -0.25;
  ajouter(voiture, boite(0.03, 0.02, 0.3, 0.01), M.feuDiurne, 2.06, 0.6, cote * 0.62, cote < 0 ? 'diurne-gauche' : 'diurne-droit');
  ajouter(voiture, boite(0.06, 0.05, 0.08, 0.015), M.clignotant, 2.0, 0.72, cote * 0.81, cote < 0 ? 'clignotant-av-gauche' : 'clignotant-av-droit');
  // Gicleurs de lave-glace sur le capot sont portés par le capot (voir plus bas).
}

// Bouclier arrière, feux arrière, antibrouillard, recul.
ajouter(voiture, boite(0.3, 0.44, 1.8, 0.1), M.carrosserie, -1.9, 0.42, 0);
ajouter(voiture, boite(0.05, 0.1, 1.2, 0.03), M.plastique, -2.05, 0.28, 0);
for (const cote of [-1, 1]) {
  ajouter(voiture, boite(0.1, 0.16, 0.3, 0.03), M.feuArriere, -1.99, 0.82, cote * 0.69, cote < 0 ? 'feu-ar-gauche' : 'feu-ar-droit');
  ajouter(voiture, boite(0.1, 0.05, 0.16, 0.015), M.clignotant, -1.99, 0.71, cote * 0.74, cote < 0 ? 'clignotant-ar-gauche' : 'clignotant-ar-droit');
  ajouter(voiture, boite(0.02, 0.05, 0.12, 0.01), new THREE.MeshStandardMaterial({ color: 0xa0141a, roughness: 0.3 }), -2.06, 0.36, cote * 0.72, cote < 0 ? 'catadioptre-gauche' : 'catadioptre-droit');
}
// Antibrouillard arrière côté conducteur (gauche), feu de recul côté droit.
ajouter(voiture, boite(0.03, 0.05, 0.12, 0.01), M.feuArriere.clone(), -2.07, 0.47, -0.42, 'antibrouillard');
ajouter(voiture, boite(0.03, 0.05, 0.12, 0.01), M.recul, -2.07, 0.47, 0.42, 'recul');

// Pavillon (toit), pare-brise, montants de pare-brise, signal « AUTO-ÉCOLE ».
const toit = ajouter(voiture, boite(1.55, 0.05, 1.5, 0.06), M.carrosserie, -0.62, 1.4, 0);
toit.castShadow = true;
// Pare-brise : de la base (1.0, 0.93) au haut (0.17, 1.39).
const geoPareBrise = new THREE.PlaneGeometry(0.95, 1.44);
geoPareBrise.rotateX(-Math.PI / 2);
geoPareBrise.rotateZ(-Math.atan2(0.46, 0.83));
ajouter(voiture, geoPareBrise, M.verre, 0.585, 1.16, 0, 'pare-brise');
for (const cote of [-1, 1]) {
  const montant = ajouter(voiture, boite(0.98, 0.05, 0.06, 0.02), M.noirBrillant, 0.58, 1.165, cote * 0.74);
  montant.rotation.z = -Math.atan2(0.45, 0.85);
}
ajouter(voiture, boite(0.12, 0.14, 0.9, 0.03), new THREE.MeshStandardMaterial({ map: textureSignal(), roughness: 0.5 }), -0.35, 1.5, 0);

// Vitre de custode (fixe) entre la porte arrière et le montant C.
for (const cote of [-1, 1]) {
  const g = new THREE.ShapeGeometry(new THREE.Shape([[-0.97, 0.99], [-1.13, 1.35], [-1.36, 1.0]].map(([x, y]) => new THREE.Vector2(x, y))));
  ajouter(voiture, g, M.verre, 0, 0, cote * 0.83);
}

/* ------------------------------------------------------------------ */
/* Ouvrants : portes, capot, hayon                                     */
/* ------------------------------------------------------------------ */

const ouvrants = { portes: [], capot: null, hayon: null };

/** Porte : pivot à l'avant de la porte, se rabat vers l'extérieur. */
function porte(xAvant, xArriere, cote, avant) {
  const pivot = new THREE.Group();
  pivot.position.set(xAvant, 0, cote * 0.89);
  voiture.add(pivot);
  const rel = (x) => x - xAvant;
  // Panneau de porte (jusqu'à la ligne de caisse).
  const panneau = profil(
    [
      [rel(xArriere), 0.28],
      [rel(xAvant) - 0.01, 0.28],
      [rel(xAvant) - 0.01, ligneCaisse(xAvant)],
      [rel(xArriere), ligneCaisse(xArriere)],
    ],
    0.045,
    0.012,
  );
  ajouter(pivot, panneau, M.carrosserie, 0, 0, cote < 0 ? 0 : -0.045);
  // Garniture intérieure.
  ajouter(pivot, boite(Math.abs(xAvant - xArriere) - 0.06, 0.6, 0.03, 0.01), M.interieur, rel((xAvant + xArriere) / 2), 0.62, -cote * 0.05);
  // Vitre, inclinée vers l'intérieur (galbe), avec encadrement noir.
  const vitre = new THREE.Group();
  vitre.position.set(0, ligneCaisse(xAvant), cote < 0 ? 0.02 : -0.02);
  vitre.rotation.x = cote < 0 ? 0.2 : -0.2;
  pivot.add(vitre);
  const haut = 1.36 - ligneCaisse(xAvant);
  const contour = avant
    ? [[rel(xArriere) + 0.02, 0.01], [rel(xAvant) - 0.06, 0.01], [rel(0.2), haut], [rel(xArriere) + 0.02, haut]]
    : [[rel(xArriere) + 0.05, 0.03], [rel(xAvant) - 0.02, 0.01], [rel(xAvant) - 0.02, haut], [rel(-0.88), haut]];
  const formeVitre = new THREE.Shape(contour.map(([x, y]) => new THREE.Vector2(x, y)));
  ajouter(vitre, new THREE.ShapeGeometry(formeVitre), M.verre, 0, 0, 0);
  const cadre = new THREE.Shape(contour.map(([x, y]) => new THREE.Vector2(x, y)).map((v) => v.clone()));
  const pts = contour.map(([x, y]) => new THREE.Vector3(x, y, 0));
  pts.push(pts[0].clone());
  const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0), 64, 0.012, 6, false);
  ajouter(vitre, tube, M.noirBrillant, 0, 0, 0);
  void cadre;
  // Poignée.
  ajouter(pivot, boite(0.14, 0.03, 0.03, 0.012), M.chrome, rel(xArriere) + 0.16, 0.86, cote * 0.03);
  if (avant) {
    // Rétroviseur extérieur.
    const coque = ajouter(pivot, boite(0.16, 0.11, 0.2, 0.04), M.carrosserie, -0.14, 1.0, cote * 0.12, cote < 0 ? 'retro-gauche' : 'retro-droit');
    coque.rotation.y = cote * 0.15;
    ajouter(pivot, boite(0.02, 0.09, 0.17, 0.02), M.chrome, -0.2, 1.0, cote * 0.12);
    // Clignotant de rétroviseur.
    ajouter(pivot, boite(0.05, 0.015, 0.12, 0.007), M.clignotant, -0.08, 0.95, cote * 0.15, cote < 0 ? 'clignotant-retro-gauche' : 'clignotant-retro-droit');
  }
  if (avant && cote < 0) {
    // Gilet de haute visibilité rangé dans le vide-poche de la porte conducteur.
    ajouter(pivot, boite(0.22, 0.08, 0.05, 0.02), M.gilet, -0.45, 0.42, 0.07, 'gilet');
  }
  if (!avant) {
    // Sécurité enfant : petite commande sur la tranche arrière de la porte arrière.
    ajouter(pivot, boite(0.02, 0.04, 0.025, 0.006), M.rouge, rel(xArriere) + 0.01, 0.62, -cote * 0.03, cote < 0 ? 'securite-enfant-gauche' : 'securite-enfant-droit');
  }
  ouvrants.portes.push({ pivot, cote, ouverture: 0 });
  return pivot;
}
porte(0.99, 0.02, -1, true);
porte(0.99, 0.02, 1, true);
porte(0.0, -0.95, -1, false);
porte(0.0, -0.95, 1, false);

// Plaque de pression des pneus : sur le montant B côté conducteur, visible porte ouverte.
const plaquePression = ajouter(
  voiture,
  new THREE.PlaneGeometry(0.07, 0.1),
  new THREE.MeshStandardMaterial({ map: texturePlaquePression(), roughness: 0.6 }),
  0.0,
  0.72,
  -0.882,
  'plaque-pression',
);
plaquePression.rotation.y = Math.PI;
ajouter(voiture, boite(0.08, 0.68, 0.05, 0.01), M.carrosserie, -0.01, 0.62, -0.855);
ajouter(voiture, boite(0.08, 0.68, 0.05, 0.01), M.carrosserie, -0.01, 0.62, 0.855);

// Capot : pivot côté pare-brise, l'avant se soulève.
const capot = new THREE.Group();
capot.position.set(1.0, 0.925, 0);
voiture.add(capot);
const panneauCapot = ajouter(capot, boite(1.01, 0.04, 1.66, 0.04), M.carrosserie, 0.5, 0, 0, 'capot');
panneauCapot.rotation.z = -0.118;
panneauCapot.position.y = -0.06;
for (const cote of [-1, 1]) ajouter(capot, boite(0.03, 0.02, 0.04, 0.01), M.noirBrillant, 0.06, -0.0, cote * 0.3, cote < 0 ? 'gicleur-gauche' : 'gicleur-droit');
ouvrants.capot = { pivot: capot, ouverture: 0 };

// Hayon : pivot à l'arrière du toit, l'arrière se soulève. Lunette, essuie-glace, 3e feu stop, plaque.
const hayon = new THREE.Group();
hayon.position.set(-1.38, 1.39, 0);
voiture.add(hayon);
{
  const ax = -0.48;
  const ay = -0.4;
  const lg = Math.hypot(ax, ay);
  const geoLunette = new THREE.PlaneGeometry(lg, 1.34);
  geoLunette.rotateX(-Math.PI / 2);
  geoLunette.rotateZ(Math.atan2(ay, ax));
  ajouter(hayon, geoLunette, M.verre, ax / 2, ay / 2 + 0.005, 0, 'lunette');
  const cadreHaut = ajouter(hayon, boite(lg + 0.04, 0.03, 1.5, 0.015), M.carrosserie, ax / 2, ay / 2 - 0.02, 0);
  cadreHaut.rotation.z = Math.atan2(ay, ax);
  cadreHaut.scale.set(1, 1, 1);
  cadreHaut.position.y -= 0.0;
  cadreHaut.material = M.noirBrillant;
  const bx = -0.66;
  const by = -0.86;
  const lg2 = Math.hypot(bx - ax, by - ay);
  const bas = ajouter(hayon, boite(lg2, 0.05, 1.56, 0.03), M.carrosserie, (ax + bx) / 2 - 0.01, (ay + by) / 2, 0, 'hayon');
  bas.rotation.z = Math.atan2(by - ay, bx - ax);
  ajouter(hayon, boite(0.05, 0.03, 0.4, 0.015), M.feuArriere, -0.02, 0.02, 0, 'troisieme-stop');
  const essuie = ajouter(hayon, boite(0.02, 0.015, 0.42, 0.006), M.plastique, ax + 0.06, ay + 0.05, -0.1, 'essuie-glace-arriere');
  essuie.rotation.x = 0.4;
  // Plaque arrière posée à plat sur le bas du hayon (incliné).
  const geoPlaque = new THREE.PlaneGeometry(0.52, 0.11);
  geoPlaque.rotateY(-Math.PI / 2);
  const inclinaison = Math.atan2(bx - ax, -(by - ay));
  const plaqueAr = ajouter(hayon, geoPlaque, new THREE.MeshStandardMaterial({ map: texturePlaque(), roughness: 0.4 }), -0.638, -0.707, 0, 'plaque-arriere');
  plaqueAr.rotation.z = inclinaison;
  const eclairage = ajouter(hayon, boite(0.02, 0.012, 0.08, 0.005), M.feuDiurne, -0.615, -0.635, 0, 'eclairage-plaque');
  eclairage.rotation.z = inclinaison;
}
ouvrants.hayon = { pivot: hayon, ouverture: 0 };

// Trappe à carburant (côté droit, aile arrière).
ajouter(voiture, boite(0.16, 0.16, 0.01, 0.04), M.carrosserie, -1.55, 0.78, 0.9, 'trappe-carburant');

/* ------------------------------------------------------------------ */
/* Roues                                                               */
/* ------------------------------------------------------------------ */

function roue(x, cote) {
  const groupe = new THREE.Group();
  groupe.position.set(x, R_ROUE, cote * 0.76);
  voiture.add(groupe);
  const pneu = ajouter(groupe, new THREE.TorusGeometry(R_ROUE - 0.075, 0.075, 18, 48), M.pneu, 0, 0, 0);
  pneu.scale.z = 1.35;
  const bande = ajouter(groupe, new THREE.CylinderGeometry(R_ROUE, R_ROUE, 0.2, 48, 1, true), M.pneu, 0, 0, 0);
  bande.rotation.x = Math.PI / 2;
  const jante = ajouter(groupe, new THREE.CylinderGeometry(0.19, 0.19, 0.16, 40), M.jante, 0, 0, 0);
  jante.rotation.x = Math.PI / 2;
  for (let i = 0; i < 5; i += 1) {
    const branche = ajouter(groupe, boite(0.04, 0.17, 0.03, 0.01), M.chrome, 0, 0, cote * 0.085);
    branche.rotation.z = (i * 2 * Math.PI) / 5;
    branche.translateY(0.085);
  }
  ajouter(groupe, new THREE.CylinderGeometry(0.035, 0.035, 0.02, 20), M.noirBrillant, 0, 0, cote * 0.09).rotation.x = Math.PI / 2;
  const disque = ajouter(groupe, new THREE.CylinderGeometry(0.15, 0.15, 0.02, 32), M.disque, 0, 0, -cote * 0.05);
  disque.rotation.x = Math.PI / 2;
  if (x > 0 && cote < 0) {
    nommes.flanc = pneu;
    // Repère du témoin d'usure (petit triangle) sur le flanc de la roue avant gauche.
    const tri = new THREE.Shape([new THREE.Vector2(0, 0.025), new THREE.Vector2(-0.022, -0.015), new THREE.Vector2(0.022, -0.015)]);
    const t = ajouter(groupe, new THREE.ShapeGeometry(tri), new THREE.MeshStandardMaterial({ color: 0xf1f1f1, roughness: 0.6, side: THREE.DoubleSide }), 0.0, 0.262, cote * 0.104, 'temoin-usure');
    t.rotation.y = Math.PI;
  }
  return groupe;
}
for (const x of [ROUE_AV, ROUE_AR]) for (const c of [-1, 1]) roue(x, c);

/* ------------------------------------------------------------------ */
/* Habitacle                                                           */
/* ------------------------------------------------------------------ */

ajouter(voiture, boite(2.0, 0.06, 1.66, 0.02), M.interieur, 0.0, 0.29, 0);
// Planche de bord, tablier, console.
ajouter(voiture, boite(0.34, 0.22, 1.62, 0.06), M.interieur, 0.86, 0.82, 0, 'planche');
ajouter(voiture, boite(0.05, 0.55, 1.62, 0.02), M.interieur, 1.03, 0.62, 0);
ajouter(voiture, boite(0.6, 0.18, 0.22, 0.04), M.interieur, 0.45, 0.42, 0);
// Combiné d'instruments avec voyants (texture dessinée), écran central, warning.
const combine = ajouter(voiture, new THREE.PlaneGeometry(0.34, 0.13), new THREE.MeshStandardMaterial({ map: textureCombine(), emissive: 0xffffff, emissiveMap: textureCombine(), emissiveIntensity: 0.55 }), 0.72, 0.965, -0.38, 'combine');
combine.rotation.set(0, -Math.PI / 2, 0);
combine.rotateX(-0.25);
const ecran = ajouter(voiture, new THREE.PlaneGeometry(0.22, 0.14), new THREE.MeshStandardMaterial({ color: 0x0d1117, emissive: 0x1d4e9e, emissiveIntensity: 0.25, roughness: 0.2 }), 0.74, 0.99, 0.0);
ecran.rotation.set(0, -Math.PI / 2, 0);
ecran.rotateX(-0.3);
ajouter(voiture, boite(0.03, 0.03, 0.05, 0.008), M.rouge, 0.69, 0.88, 0.0, 'warning');
// Voyant de pression des pneus mis en évidence (surcouche du combiné).
const voyantPneu = ajouter(voiture, new THREE.CircleGeometry(0.014, 20), new THREE.MeshBasicMaterial({ color: 0xffb300, transparent: true, opacity: 0 }), 0.711, 0.994, -0.39, 'voyant-pneu');
voyantPneu.rotation.set(0, -Math.PI / 2, 0);
// Volant et colonne.
const volant = ajouter(voiture, new THREE.TorusGeometry(0.18, 0.022, 12, 40), M.interieur, 0.56, 0.92, -0.38, 'volant');
volant.rotation.set(0, Math.PI / 2, 0);
volant.rotateX(0.35);
const moyeu = ajouter(voiture, new THREE.CylinderGeometry(0.06, 0.06, 0.05, 20), M.plastique, 0.57, 0.92, -0.38);
moyeu.rotation.z = Math.PI / 2 - 0.35;
const colonne = ajouter(voiture, new THREE.CylinderGeometry(0.035, 0.035, 0.28, 12), M.plastique, 0.68, 0.87, -0.38);
colonne.rotation.z = Math.PI / 2 - 0.35;
// Commodos (éclairage à gauche, essuie-glaces à droite).
for (const [dz, nom] of [[-0.09, 'commodo-feux'], [0.09, 'commodo-essuie']]) {
  const c = ajouter(voiture, new THREE.CylinderGeometry(0.008, 0.008, 0.14, 8), M.plastique, 0.63, 0.9, -0.38 + dz, nom);
  c.rotation.x = Math.PI / 2;
}
// Molette de réglage de hauteur des feux (à gauche du volant).
ajouter(voiture, new THREE.CylinderGeometry(0.015, 0.015, 0.012, 16), M.chrome, 0.72, 0.84, -0.66, 'reglage-feux').rotation.z = Math.PI / 2;
// Levier de vitesses, frein de stationnement.
ajouter(voiture, new THREE.CylinderGeometry(0.012, 0.012, 0.16, 10), M.chrome, 0.32, 0.58, 0);
ajouter(voiture, new THREE.SphereGeometry(0.035, 16, 12), M.plastique, 0.32, 0.67, 0);
// Rétroviseur intérieur.
ajouter(voiture, boite(0.03, 0.06, 0.22, 0.015), M.plastique, 0.22, 1.3, 0, 'retro-interieur');
// Boîte à gants (documents du véhicule).
ajouter(voiture, boite(0.02, 0.1, 0.36, 0.01), M.plastique, 0.69, 0.78, 0.38, 'boite-a-gants');
// Sièges avant (avec appuie-têtes) et banquette arrière ; attaches Isofix sur la banquette.
for (const cote of [-1, 1]) {
  ajouter(voiture, boite(0.5, 0.12, 0.5, 0.05), M.tissu, 0.12, 0.45, cote * 0.38);
  const dossier = ajouter(voiture, boite(0.12, 0.62, 0.5, 0.05), M.tissu, -0.16, 0.78, cote * 0.38);
  dossier.rotation.z = 0.15;
  ajouter(voiture, boite(0.1, 0.16, 0.28, 0.04), M.tissu, -0.22, 1.17, cote * 0.38, cote < 0 ? 'appui-tete' : undefined);
  ajouter(voiture, boite(0.03, 0.02, 0.03, 0.005), M.chrome, -0.86, 0.5, cote * 0.38, cote < 0 ? 'isofix' : undefined);
}
ajouter(voiture, boite(0.5, 0.12, 1.36, 0.05), M.tissu, -0.62, 0.47, 0);
const dossierAr = ajouter(voiture, boite(0.12, 0.6, 1.36, 0.05), M.tissu, -0.93, 0.78, 0);
dossierAr.rotation.z = 0.18;

/* ------------------------------------------------------------------ */
/* Compartiment moteur (sous le capot)                                 */
/* ------------------------------------------------------------------ */

ajouter(voiture, boite(0.98, 0.04, 1.64, 0.02), M.plastique, 1.5, 0.4, 0);
ajouter(voiture, boite(0.5, 0.3, 0.72, 0.06), M.moteur, 1.47, 0.57, 0.02);
ajouter(voiture, boite(0.42, 0.06, 0.6, 0.05), M.plastique, 1.47, 0.74, 0.02);
// Bouchon de remplissage d'huile et jauge.
ajouter(voiture, new THREE.CylinderGeometry(0.035, 0.035, 0.03, 20), M.jaune, 1.42, 0.785, 0.16, 'bouchon-huile');
const jauge = ajouter(voiture, new THREE.TorusGeometry(0.025, 0.007, 8, 20), M.jaune, 1.66, 0.8, -0.16, 'jauge');
jauge.rotation.y = Math.PI / 2;
ajouter(voiture, new THREE.CylinderGeometry(0.004, 0.004, 0.2, 6), M.jaune, 1.66, 0.69, -0.16);
// Batterie (borne + rouge).
ajouter(voiture, boite(0.22, 0.19, 0.17, 0.02), M.noirBrillant, 1.33, 0.55, -0.6, 'batterie');
ajouter(voiture, new THREE.CylinderGeometry(0.018, 0.018, 0.03, 12), M.rouge, 1.29, 0.66, -0.56);
// Bocal de lave-glace (bouchon bleu), vase d'expansion du liquide de refroidissement, réservoir de liquide de frein.
ajouter(voiture, boite(0.2, 0.22, 0.2, 0.03), translucide(0x7fb2ff, 0.55), 1.66, 0.55, 0.5, 'lave-glace');
ajouter(voiture, new THREE.CylinderGeometry(0.035, 0.035, 0.04, 20), M.bleu, 1.66, 0.68, 0.5, 'bouchon-lave-glace');
ajouter(voiture, boite(0.16, 0.13, 0.14, 0.03), translucide(0xf2f2f2, 0.6), 1.2, 0.62, 0.55, 'refroidissement');
ajouter(voiture, boite(0.14, 0.06, 0.12, 0.02), new THREE.MeshStandardMaterial({ color: 0xe86fa6, roughness: 0.3 }), 1.2, 0.585, 0.55);
ajouter(voiture, new THREE.CylinderGeometry(0.035, 0.035, 0.035, 20), M.noirBrillant, 1.2, 0.7, 0.55, 'bouchon-refroidissement');
ajouter(voiture, boite(0.1, 0.09, 0.1, 0.02), translucide(0xf5e9b0, 0.7), 1.12, 0.72, -0.42, 'liquide-frein');
ajouter(voiture, new THREE.CylinderGeometry(0.03, 0.03, 0.03, 16), M.jaune, 1.12, 0.78, -0.42);

/* ------------------------------------------------------------------ */
/* Coffre                                                              */
/* ------------------------------------------------------------------ */

ajouter(voiture, boite(0.85, 0.04, 1.5, 0.02), M.interieur, -1.5, 0.5, 0);
{
  // Triangle de présignalisation (rouge, rangé à plat).
  const forme = new THREE.Shape([new THREE.Vector2(0, 0.17), new THREE.Vector2(-0.15, -0.09), new THREE.Vector2(0.15, -0.09)]);
  forme.holes.push(new THREE.Path([new THREE.Vector2(0, 0.1), new THREE.Vector2(0.09, -0.05), new THREE.Vector2(-0.09, -0.05)]));
  const tri = ajouter(voiture, new THREE.ExtrudeGeometry(forme, { depth: 0.015, bevelEnabled: false }), M.rouge, -1.55, 0.53, -0.3, 'triangle');
  tri.rotation.x = -Math.PI / 2;
}

/* ------------------------------------------------------------------ */
/* Textures dessinées (plaque, signal, combiné)                        */
/* ------------------------------------------------------------------ */

function canvasTexture(l, h, dessiner) {
  const c = document.createElement('canvas');
  c.width = l;
  c.height = h;
  dessiner(c.getContext('2d'), l, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
function texturePlaque() {
  return canvasTexture(520, 110, (g, l, h) => {
    g.fillStyle = '#f7f7f7';
    g.fillRect(0, 0, l, h);
    g.fillStyle = '#1d4fb3';
    g.fillRect(0, 0, 44, h);
    g.fillRect(l - 44, 0, 44, h);
    g.fillStyle = '#14181f';
    g.font = 'bold 66px Arial, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('AA-000-AA', l / 2, h / 2 + 4);
    g.strokeStyle = '#14181f';
    g.lineWidth = 4;
    g.strokeRect(2, 2, l - 4, h - 4);
  });
}
function textureSignal() {
  return canvasTexture(512, 128, (g, l, h) => {
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, l, h);
    g.fillStyle = '#c62828';
    g.font = 'bold 74px Arial, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('AUTO-ÉCOLE', l / 2, h / 2 + 4);
  });
}
function texturePlaquePression() {
  return canvasTexture(140, 200, (g, l, h) => {
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, l, h);
    g.fillStyle = '#14181f';
    g.font = 'bold 18px Arial';
    g.fillText('bar', 10, 28);
    g.font = '15px Arial';
    ['AV 2,3  AR 2,1', 'AV 2,5  AR 2,8'].forEach((t, i) => g.fillText(t, 8, 70 + i * 40));
    g.strokeStyle = '#14181f';
    g.strokeRect(3, 3, l - 6, h - 6);
  });
}
function textureCombine() {
  return canvasTexture(680, 260, (g, l, h) => {
    g.fillStyle = '#0b0e12';
    g.fillRect(0, 0, l, h);
    // Deux cadrans.
    for (const cx of [170, 510]) {
      g.strokeStyle = '#4c5666';
      g.lineWidth = 8;
      g.beginPath();
      g.arc(cx, 140, 95, Math.PI * 0.8, Math.PI * 2.2);
      g.stroke();
      g.strokeStyle = '#e8edf3';
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(cx, 140);
      g.lineTo(cx - 55, 90);
      g.stroke();
    }
    g.fillStyle = '#e8edf3';
    g.font = 'bold 46px Arial';
    g.textAlign = 'center';
    g.fillText('0', 170, 160);
    g.font = '20px Arial';
    g.fillText('km/h', 170, 195);
    g.fillText('carburant', 510, 195);
    // Voyants (pictogrammes simplifiés).
    const voyant = (x, y, couleur, dessin) => {
      g.save();
      g.translate(x, y);
      g.strokeStyle = couleur;
      g.fillStyle = couleur;
      g.lineWidth = 3;
      dessin();
      g.restore();
    };
    // Pression des pneus (orange) : fer à cheval avec « ! ».
    voyant(320, 70, '#ffb300', () => {
      g.beginPath();
      g.arc(0, 0, 18, Math.PI * 0.15, Math.PI * 0.85, true);
      g.stroke();
      g.font = 'bold 22px Arial';
      g.textAlign = 'center';
      g.fillText('!', 0, 8);
    });
    // Batterie (rouge).
    voyant(320, 130, '#e53935', () => {
      g.strokeRect(-16, -10, 32, 20);
      g.fillRect(-12, -14, 6, 4);
      g.fillRect(6, -14, 6, 4);
    });
    // Huile (rouge) : burette.
    voyant(320, 190, '#e53935', () => {
      g.beginPath();
      g.moveTo(-18, 6);
      g.lineTo(8, 6);
      g.lineTo(18, -6);
      g.lineTo(-6, -6);
      g.closePath();
      g.stroke();
    });
    // Feux de route (bleu).
    voyant(380, 70, '#4f8cff', () => {
      g.beginPath();
      g.arc(4, 0, 10, -Math.PI / 2, Math.PI / 2);
      g.stroke();
      for (let i = -1; i <= 1; i += 1) {
        g.beginPath();
        g.moveTo(-6, i * 7);
        g.lineTo(-18, i * 7);
        g.stroke();
      }
    });
    // Ceinture (rouge), température (rouge), freinage (rouge), antibrouillard arrière (orange).
    voyant(380, 130, '#e53935', () => {
      g.beginPath();
      g.arc(0, -10, 5, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.moveTo(-8, 14);
      g.lineTo(8, -2);
      g.stroke();
    });
    voyant(380, 190, '#e53935', () => {
      g.fillRect(-2, -14, 4, 20);
      g.beginPath();
      g.arc(0, 8, 6, 0, Math.PI * 2);
      g.fill();
    });
    voyant(440, 70, '#e53935', () => {
      g.beginPath();
      g.arc(0, 0, 14, 0, Math.PI * 2);
      g.stroke();
      g.font = 'bold 20px Arial';
      g.textAlign = 'center';
      g.fillText('!', 0, 7);
    });
    voyant(440, 130, '#ffb300', () => {
      g.beginPath();
      g.arc(-4, 0, 10, Math.PI / 2, -Math.PI / 2);
      g.stroke();
      g.beginPath();
      g.moveTo(8, 0);
      g.lineTo(18, 0);
      g.stroke();
    });
  });
}

/* ------------------------------------------------------------------ */
/* Points interactifs (zones)                                          */
/* ------------------------------------------------------------------ */

const ZONES = {
  poste: { position: [0.78, 1.08, -0.38], vue: { camera: [0.02, 1.17, -0.38], cible: [0.75, 0.93, -0.32] }, ouvrir: {} },
  habitacle: { position: [0.05, 1.05, 0.0], vue: { camera: [0.9, 1.75, -2.5], cible: [0.1, 0.8, 0] }, ouvrir: { portes: 1 } },
  moteur: { position: [1.5, 1.05, 0.0], vue: { camera: [3.3, 2.1, -1.5], cible: [1.45, 0.62, 0] }, ouvrir: { capot: 1 } },
  avant: { position: [2.12, 0.72, -0.6], vue: { camera: [4.4, 1.1, -2.2], cible: [1.9, 0.6, 0] }, ouvrir: {}, feux: true },
  carrosserie: { position: [0.6, 0.7, -1.0], vue: { camera: [0.7, 1.3, -4.6], cible: [0, 0.65, 0] }, ouvrir: {} },
  roues: { position: [ROUE_AV, 0.72, -0.98], vue: { camera: [2.6, 0.62, -2.1], cible: [ROUE_AV, 0.33, -0.8] }, ouvrir: {} },
  arriere: { position: [-2.14, 0.82, 0.69], vue: { camera: [-4.4, 1.2, -2.0], cible: [-1.9, 0.7, 0] }, ouvrir: {}, feux: true },
  coffre: { position: [-1.6, 1.0, 0.0], vue: { camera: [-4.0, 2.2, -1.1], cible: [-1.5, 0.6, 0] }, ouvrir: { hayon: 1 } },
};
const VUE_GENERALE = { camera: [4.4, 2.1, -4.9], cible: [0.05, 0.62, 0] };

let donnees = { zones: {}, fiches: [] };
const sprites = [];
function texturePoint(n) {
  return canvasTexture(128, 128, (g) => {
    g.fillStyle = 'rgba(20,24,31,0.35)';
    g.beginPath();
    g.arc(64, 66, 52, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#f2c230';
    g.beginPath();
    g.arc(64, 62, 50, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#14181f';
    g.lineWidth = 6;
    g.stroke();
    g.fillStyle = '#14181f';
    g.font = 'bold 52px Arial, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(String(n), 64, 65);
  });
}
async function chargerFiches() {
  try {
    donnees = await (await fetch('./fiches.json')).json();
  } catch {
    donnees = { zones: {}, fiches: [] };
  }
  for (const [zone, def] of Object.entries(ZONES)) {
    const n = donnees.fiches.filter((f) => f.zone === zone).length;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturePoint(n), depthTest: false, transparent: true }));
    s.position.set(...def.position);
    s.scale.setScalar(0.17);
    s.renderOrder = 10;
    s.userData.zone = zone;
    s.visible = !MODE_VIDEO;
    voiture.add(s);
    sprites.push(s);
  }
}

/* ------------------------------------------------------------------ */
/* État : ouvertures, feux, caméra animée                              */
/* ------------------------------------------------------------------ */

const etat = { portes: 0, capot: 0, hayon: 0, feux: 0 };
const cibleEtat = { ...etat };
const anim = { de: null, vers: null, t: 1 };

function appliquerEtat(e) {
  for (const p of ouvrants.portes) p.pivot.rotation.y = (p.cote < 0 ? -1 : 1) * 1.15 * e.portes;
  ouvrants.capot.pivot.rotation.z = 0.95 * e.capot;
  ouvrants.hayon.pivot.rotation.z = -1.2 * e.hayon;
  M.feuAvant.emissiveIntensity = 1.6 * e.feux;
  M.feuArriere.emissiveIntensity = 0.12 + 1.4 * e.feux;
}
const lisse = (t) => t * t * (3 - 2 * t);
/** Écran étroit (téléphone en portrait) : on recule la caméra pour garder la zone entière à l'écran. */
function positionCamera(vue) {
  const cam = new THREE.Vector3(...vue.camera);
  const cible = new THREE.Vector3(...vue.cible);
  const portrait = window.innerWidth / window.innerHeight < 0.8;
  const interieur = cam.distanceTo(cible) < 1;
  return portrait && !interieur ? cible.clone().add(cam.sub(cible).multiplyScalar(1.45)) : new THREE.Vector3(...vue.camera);
}
function allerVers(vue, duree = 1.1) {
  anim.de = { camera: camera.position.clone(), cible: controls.target.clone() };
  anim.vers = { camera: positionCamera(vue), cible: new THREE.Vector3(...vue.cible) };
  anim.t = 0;
  anim.duree = duree;
}

/* ------------------------------------------------------------------ */
/* Interface                                                           */
/* ------------------------------------------------------------------ */

const panneau = document.getElementById('panneau');
const boutons = [...document.querySelectorAll('.puce')];
function majBoutons() {
  for (const b of boutons) {
    const a = b.dataset.action;
    const actif = a === 'portes' ? cibleEtat.portes > 0.5 : a === 'capot' ? cibleEtat.capot > 0.5 : a === 'coffre' ? cibleEtat.hayon > 0.5 : a === 'feux' ? cibleEtat.feux > 0.5 : false;
    b.setAttribute('aria-pressed', String(actif));
  }
}
function envoyerAppli(message) {
  if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(message));
  else if (window.parent !== window) window.parent.postMessage({ source: 'creno-voiture-3d', ...message }, '*');
}
function ouvrirZone(zone, animer = true) {
  const def = ZONES[zone];
  if (!def) return;
  cibleEtat.portes = def.ouvrir.portes ?? 0;
  cibleEtat.capot = def.ouvrir.capot ?? 0;
  cibleEtat.hayon = def.ouvrir.hayon ?? 0;
  cibleEtat.feux = def.feux ? 1 : 0;
  majBoutons();
  if (animer) allerVers(def.vue);
  else {
    camera.position.copy(positionCamera(def.vue));
    controls.target.set(...def.vue.cible);
  }
  const fiches = donnees.fiches.filter((f) => f.zone === zone);
  document.getElementById('panneau-titre').textContent = donnees.zones[zone] ?? zone;
  document.getElementById('panneau-compte').textContent = `${fiches.length} fiche${fiches.length > 1 ? 's' : ''} de la banque officielle`;
  const liste = document.getElementById('panneau-liste');
  liste.replaceChildren(
    ...fiches.map((f) => {
      const li = document.createElement('li');
      const b = document.createElement('b');
      b.textContent = f.numero;
      li.append(b, document.createTextNode(f.verification));
      return li;
    }),
  );
  const action = document.getElementById('panneau-action');
  action.textContent = `Voir les ${fiches.length} fiches avec les questions`;
  action.onclick = () => envoyerAppli({ type: 'zone', zone });
  panneau.classList.add('visible');
  document.getElementById('aide').style.display = 'none';
}
document.getElementById('fermer').onclick = () => {
  panneau.classList.remove('visible');
  document.getElementById('aide').style.display = '';
};
for (const b of boutons) {
  b.onclick = () => {
    const a = b.dataset.action;
    if (a === 'portes') cibleEtat.portes = cibleEtat.portes > 0.5 ? 0 : 1;
    if (a === 'capot') cibleEtat.capot = cibleEtat.capot > 0.5 ? 0 : 1;
    if (a === 'coffre') cibleEtat.hayon = cibleEtat.hayon > 0.5 ? 0 : 1;
    if (a === 'feux') cibleEtat.feux = cibleEtat.feux > 0.5 ? 0 : 1;
    if (a === 'interieur') allerVers(ZONES.poste.vue);
    if (a === 'vue') {
      Object.assign(cibleEtat, { portes: 0, capot: 0, hayon: 0, feux: 0 });
      allerVers(VUE_GENERALE);
      panneau.classList.remove('visible');
    }
    majBoutons();
  };
}

// Toucher un point jaune (sans faire glisser).
const raycaster = new THREE.Raycaster();
let appui = null;
canvas.addEventListener('pointerdown', (e) => (appui = { x: e.clientX, y: e.clientY }));
canvas.addEventListener('pointerup', (e) => {
  if (!appui || Math.hypot(e.clientX - appui.x, e.clientY - appui.y) > 6) return;
  const r = canvas.getBoundingClientRect();
  const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const touche = raycaster.intersectObjects(sprites, false)[0];
  if (touche) ouvrirZone(touche.object.userData.zone);
});

/* ------------------------------------------------------------------ */
/* Surbrillance (vidéos)                                               */
/* ------------------------------------------------------------------ */

/** Anneau jaune pulsant autour d'une pièce (lisible quelle que soit sa couleur). */
const halos = new Map();
const textureAnneau = canvasTexture(256, 256, (g) => {
  g.strokeStyle = 'rgba(20,24,31,0.55)';
  g.lineWidth = 22;
  g.beginPath();
  g.arc(128, 128, 104, 0, Math.PI * 2);
  g.stroke();
  g.strokeStyle = '#f2c230';
  g.lineWidth = 14;
  g.stroke();
});
function surligner(nom, intensite) {
  const objet = nommes[nom];
  if (!objet) return;
  if (nom === 'voyant-pneu') objet.material.opacity = Math.max(0, intensite);
  let halo = halos.get(nom);
  if (!halo) {
    halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: textureAnneau, depthTest: false, transparent: true }));
    halo.renderOrder = 20;
    scene.add(halo);
    halos.set(nom, halo);
  }
  halo.visible = intensite > 0;
  if (!halo.visible) return;
  const boiteObjet = new THREE.Box3().setFromObject(objet);
  const sphere = boiteObjet.getBoundingSphere(new THREE.Sphere());
  halo.position.copy(sphere.center);
  halo.scale.setScalar(Math.max(0.07, sphere.radius * 2.6) * (0.92 + 0.12 * intensite));
  halo.material.opacity = Math.min(1, 0.35 + intensite);
}

/* ------------------------------------------------------------------ */
/* Scénarios des vidéos                                                */
/* ------------------------------------------------------------------ */

const SCENARIOS = {
  capot: {
    titre: 'Vérifications extérieures · sous le capot',
    etapes: [
      { texte: 'Vérifications extérieures : ouvrir le capot et repérer les niveaux.', vue: VUE_GENERALE, etat: {} },
      {
        texte: 'Tirez la manette d’ouverture, côté conducteur, puis soulevez le capot en débloquant la sécurité.',
        vue: { camera: [3.6, 1.6, -1.9], cible: [1.6, 0.7, 0] },
        etat: { capot: 1 },
      },
      { texte: 'La jauge d’huile : le niveau doit se situer entre le minimum et le maximum.', vue: { camera: [2.3, 1.45, -0.75], cible: [1.6, 0.72, -0.12] }, etat: { capot: 1 }, surligner: ['jauge'] },
      { texte: 'Le remplissage de l’huile moteur se fait par ce bouchon, sur le moteur.', vue: { camera: [2.2, 1.5, 0.75], cible: [1.42, 0.75, 0.12] }, etat: { capot: 1 }, surligner: ['bouchon-huile'] },
      {
        texte: 'Le vase d’expansion du liquide de refroidissement. On ne l’ouvre jamais moteur chaud.',
        vue: { camera: [2.0, 1.45, 1.25], cible: [1.2, 0.62, 0.5] },
        etat: { capot: 1 },
        surligner: ['refroidissement', 'bouchon-refroidissement'],
      },
      { texte: 'Le réservoir de liquide de frein, près du pare-brise, côté conducteur.', vue: { camera: [1.95, 1.5, -1.25], cible: [1.12, 0.72, -0.42] }, etat: { capot: 1 }, surligner: ['liquide-frein'] },
      {
        texte: 'Le bocal de lave-glace se reconnaît à son bouchon bleu et au symbole du pare-brise.',
        vue: { camera: [2.2, 1.85, 0.2], cible: [1.66, 0.6, 0.5] },
        etat: { capot: 1 },
        surligner: ['lave-glace', 'bouchon-lave-glace'],
      },
      { texte: 'Et voici la batterie.', vue: { camera: [1.95, 1.85, -0.2], cible: [1.33, 0.56, -0.6] }, etat: { capot: 1 }, surligner: ['batterie'] },
      {
        texte: 'Refermez le capot en le laissant retomber, puis vérifiez qu’il est bien verrouillé.',
        vue: { camera: [3.8, 1.5, -2.2], cible: [1.6, 0.7, 0] },
        etat: { capot: 0 },
      },
      {
        texte: 'L’emplacement exact varie selon les modèles : entraînez-vous sur la voiture de votre auto-école.',
        vue: VUE_GENERALE,
        etat: {},
      },
    ],
  },
  pneus: {
    titre: 'Vérifications extérieures · les pneumatiques',
    etapes: [
      { texte: 'Vérifications extérieures : les pneumatiques.', vue: VUE_GENERALE, etat: {} },
      {
        texte: 'Contrôlez l’état du flanc : pas de coupure, de hernie ni de déformation.',
        vue: { camera: [2.35, 0.55, -1.75], cible: [ROUE_AV, 0.32, -0.8] },
        etat: {},
        surligner: ['flanc'],
      },
      {
        texte: 'Ce petit repère sur le flanc indique l’emplacement des témoins d’usure dans les rainures. Profondeur minimale : 1,6 mm.',
        voix: 'Ce petit repère sur le flanc indique l’emplacement des témoins d’usure dans les rainures. Profondeur minimale : un virgule six millimètre.',
        vue: { camera: [1.75, 0.68, -1.45], cible: [ROUE_AV, 0.5, -0.9] },
        etat: {},
        surligner: ['temoin-usure'],
      },
      {
        texte: 'La pression préconisée figure sur une plaque, souvent sur le montant de la portière conducteur.',
        vue: { camera: [0.55, 0.95, -1.7], cible: [0.0, 0.72, -0.85] },
        etat: { portes: 1 },
        surligner: ['plaque-pression'],
      },
      { texte: 'Contrôlez la pression à froid, au moins une fois par mois.', vue: { camera: [3.1, 0.9, -2.6], cible: [ROUE_AV, 0.35, -0.8] }, etat: {} },
      {
        texte: 'Au tableau de bord, ce voyant orange signale une baisse de pression d’un pneumatique.',
        vue: { camera: [0.3, 1.08, -0.33], cible: [0.72, 0.96, -0.34] },
        etat: {},
        surligner: ['voyant-pneu'],
      },
      {
        texte: 'Ces vérifications se font sur la voiture de votre auto-école : entraînez-vous avec votre enseignant.',
        vue: VUE_GENERALE,
        etat: {},
      },
    ],
  },
};

/** Durées des étapes (secondes) : injectées par l'outil de tournage d'après la voix, sinon 4 s. */
function etapesAvecTemps(nom) {
  const s = SCENARIOS[nom];
  const durees = window.DUREES_ETAPES ?? s.etapes.map(() => 4);
  let t = 0;
  return s.etapes.map((e, i) => {
    const debut = t;
    t += durees[i];
    return { ...e, debut, fin: t };
  });
}
window.SCENARIOS = SCENARIOS;

function etatComplet(partiel) {
  return { portes: partiel.portes ?? 0, capot: partiel.capot ?? 0, hayon: partiel.hayon ?? 0, feux: partiel.feux ?? 0 };
}
/** Image de la vidéo à l'instant t (secondes) : déterministe, pour un tournage image par image. */
window.rendreA = (t) => {
  const etapes = etapesAvecTemps(MODE_VIDEO);
  const i = Math.max(0, etapes.findIndex((e) => t >= e.debut && t < e.fin));
  const idx = t >= etapes.at(-1).fin ? etapes.length - 1 : i;
  const e = etapes[idx];
  const prec = etapes[Math.max(0, idx - 1)];
  const k = idx === 0 ? 1 : lisse(Math.min(1, (t - e.debut) / 1.4));
  const vDe = prec.vue;
  const cam = new THREE.Vector3(...vDe.camera).lerp(new THREE.Vector3(...e.vue.camera), k);
  const cib = new THREE.Vector3(...vDe.cible).lerp(new THREE.Vector3(...e.vue.cible), k);
  camera.position.copy(cam);
  camera.lookAt(cib);
  const a = etatComplet(prec.etat);
  const b = etatComplet(e.etat);
  const ko = idx === 0 ? 1 : lisse(Math.min(1, Math.max(0, (t - e.debut - 0.2) / 1.6)));
  appliquerEtat({ portes: a.portes + (b.portes - a.portes) * ko, capot: a.capot + (b.capot - a.capot) * ko, hayon: a.hayon + (b.hayon - a.hayon) * ko, feux: 0 });
  for (const nom of halos.keys()) surligner(nom, 0);
  if (e.surligner) {
    const pulse = 0.55 + 0.45 * Math.sin((t - e.debut) * Math.PI * 1.6);
    const entree = Math.min(1, Math.max(0, (t - e.debut - 1.0) / 0.5));
    // Un seul anneau par étape : la pièce principale.
    surligner(e.surligner[0], pulse * entree);
  }
  document.getElementById('legende-texte').textContent = e.texte;
  document.getElementById('titre-video').textContent = SCENARIOS[MODE_VIDEO].titre;
  renderer.render(scene, camera);
  return idx;
};
window.dureeVideo = () => etapesAvecTemps(MODE_VIDEO).at(-1).fin;

/* ------------------------------------------------------------------ */
/* Boucle                                                              */
/* ------------------------------------------------------------------ */

function redimensionner() {
  const l = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(l, h, false);
  camera.aspect = l / h;
  // Écran étroit (téléphone en portrait) : on recule pour voir toute la voiture.
  camera.fov = l / h < 0.8 ? 50 : 36;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', redimensionner);
redimensionner();

let precedent = performance.now();
function boucle(maintenant) {
  const dt = Math.min(0.05, (maintenant - precedent) / 1000);
  precedent = maintenant;
  for (const k of Object.keys(etat)) etat[k] += (cibleEtat[k] - etat[k]) * Math.min(1, dt * 4);
  appliquerEtat(etat);
  if (anim.t < 1) {
    anim.t = Math.min(1, anim.t + dt / anim.duree);
    const k = lisse(anim.t);
    camera.position.lerpVectors(anim.de.camera, anim.vers.camera, k);
    controls.target.lerpVectors(anim.de.cible, anim.vers.cible, k);
  }
  // Points jaunes : légère pulsation.
  const p = 0.17 * (1 + 0.06 * Math.sin(maintenant / 300));
  const position = new THREE.Vector3();
  for (const s of sprites) {
    s.scale.setScalar(p);
    // Trop près de la caméra (vue du poste de conduite), le point cacherait tout.
    s.getWorldPosition(position);
    s.visible = position.distanceTo(camera.position) > 1.1;
  }
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(boucle);
}

camera.position.copy(positionCamera(VUE_GENERALE));
controls.target.set(...VUE_GENERALE.cible);
await chargerFiches();
/** Outil de test : place immédiatement la vue d'une zone (sans animation). */
window.__zone = (zone) => {
  if (zone === 'generale') {
    Object.assign(cibleEtat, { portes: 0, capot: 0, hayon: 0, feux: 0 });
    camera.position.set(...VUE_GENERALE.camera);
    controls.target.set(...VUE_GENERALE.cible);
  } else ouvrirZone(zone, false);
  anim.t = 1;
  Object.assign(etat, cibleEtat);
  return zone;
};
window.__etat = (e) => {
  Object.assign(cibleEtat, e);
  Object.assign(etat, cibleEtat);
  return e;
};
if (MODE_VIDEO) {
  controls.enabled = false;
  window.PRET = true;
} else {
  const zone = params.get('zone');
  if (zone && ZONES[zone]) ouvrirZone(zone, false);
  requestAnimationFrame(boucle);
  window.PRET = true;
}
