/** Voiture 3D sur le web : la page `public/voiture-3d` dans un cadre, messages via `postMessage`. */
import { useEffect } from 'react';

import type { PropsVueVoiture3d } from './vue-voiture-3d.types';

export function VueVoiture3d({ zone, sombre, onZone }: PropsVueVoiture3d) {
  useEffect(() => {
    const ecouter = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const message = e.data as { source?: string; type?: string; zone?: string };
      if (message?.source === 'creno-voiture-3d' && message.type === 'zone' && message.zone) onZone(message.zone);
    };
    window.addEventListener('message', ecouter);
    return () => window.removeEventListener('message', ecouter);
  }, [onZone]);

  return (
    <iframe
      title="Voiture en 3D"
      src={`/voiture-3d/index.html?appli=1&theme=${sombre ? 'sombre' : 'clair'}${zone ? `&zone=${zone}` : ''}`}
      style={{ flex: 1, width: '100%', height: '100%', border: 0 }}
    />
  );
}
