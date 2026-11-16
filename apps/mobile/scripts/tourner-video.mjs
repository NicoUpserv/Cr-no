// Tournage d'une vidéo de la voiture 3D : voix (Hortense) par étape, images calculées une à une, assemblage ffmpeg.
// Prérequis : Windows (voix Hortense), Microsoft Edge, ffmpeg/ffprobe dans le PATH, serveur web de l'appli lancé.
// node scripts/tourner-video.mjs <scenario> http://localhost:8081/voiture-3d/index.html assets/demo/verif-<scenario>.mp4
import { spawn, execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync, mkdtempSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
const [scenario, urlPage, sortie] = process.argv.slice(2);
const FPS = 25, L = 1280, H = 720;
const ici = dirname(fileURLToPath(import.meta.url));
const dossier = join(tmpdir(), `creno-tournage-${scenario}`);
rmSync(dossier, { recursive: true, force: true });
mkdirSync(join(dossier, 'images'), { recursive: true });
const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const port = 9950 + Math.floor(Math.random() * 40);
const proc = spawn(edge, ['--headless=new', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'tournage-'))}`, 'about:blank'], { stdio: 'ignore' });
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;
for (let i = 0; i < 80 && !ws; i += 1) { try { const c = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); const p = c.find((x) => x.type === 'page'); if (p) ws = new WebSocket(p.webSocketDebuggerUrl); } catch { await attendre(250); } }
await new Promise((r) => ws.addEventListener('open', r));
let n = 0; const att = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && att.has(m.id)) { att.get(m.id)(m.result ?? m.error); att.delete(m.id); } });
const cdp = (method, params = {}) => new Promise((r) => { n += 1; att.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
const ev = async (x) => (await cdp('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true }))?.result?.value;
await cdp('Emulation.setDeviceMetricsOverride', { width: L, height: H, deviceScaleFactor: 1, mobile: false });
await cdp('Page.navigate', { url: `${urlPage}?video=${scenario}` });
for (let i = 0; i < 60 && !(await ev('window.PRET === true')); i += 1) await attendre(500);

// 1. Voix de chaque étape et durées.
const etapes = await ev(`window.SCENARIOS[${JSON.stringify(scenario)}].etapes.map((e) => e.voix ?? e.texte)`);
const durees = [];
const wavs = [];
etapes.forEach((texte, i) => {
  const wav = join(dossier, `voix-${i}.wav`);
  execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', join(ici, 'voix.ps1'), '-texte', texte, '-sortie', wav]);
  const d = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav]).toString().trim());
  wavs.push(wav);
  // Voix + respiration ; au moins 3,5 s pour laisser la caméra arriver.
  durees.push(Math.max(3.5, d + 1.4 + (i === 0 ? 0.6 : 0)));
});
console.log('durées', durees.map((d) => d.toFixed(1)).join(' '));
await ev(`window.DUREES_ETAPES = ${JSON.stringify(durees)}; 1`);
const total = await ev('window.dureeVideo()');
const images = Math.ceil(total * FPS);
console.log('total', total.toFixed(1), 's,', images, 'images');

// 2. Images.
const debut = Date.now();
for (let f = 0; f < images; f += 1) {
  await ev(`window.rendreA(${f / FPS})`);
  const { data } = await cdp('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
  writeFileSync(join(dossier, 'images', `${String(f).padStart(5, '0')}.jpg`), Buffer.from(data, 'base64'));
  if (f % 250 === 0) console.log('image', f, '/', images, Math.round((Date.now() - debut) / 1000), 's');
}
ws.close(); proc.kill();

// 3. Piste audio : chaque voix commence 0,5 s après le début de son étape.
let t = 0;
const entrees = [];
const filtres = [];
wavs.forEach((w, i) => {
  entrees.push('-i', w);
  const retard = Math.round((t + 0.5) * 1000);
  filtres.push(`[${i}]adelay=${retard}|${retard}[a${i}]`);
  t += durees[i];
});
const mix = `${filtres.join(';')};${wavs.map((_, i) => `[a${i}]`).join('')}amix=inputs=${wavs.length}:normalize=0,apad,atrim=0:${total.toFixed(2)}[voix]`;
const audio = join(dossier, 'voix.m4a');
execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...entrees, '-filter_complex', mix, '-map', '[voix]', '-c:a', 'aac', '-b:a', '96k', audio]);
execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', String(FPS), '-i', join(dossier, 'images', '%05d.jpg'), '-i', audio,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-shortest', '-movflags', '+faststart', sortie]);
console.log('vidéo', sortie);
process.exit(0);
