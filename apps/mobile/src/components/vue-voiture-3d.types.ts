export type PropsVueVoiture3d = {
  /** Zone ouverte au chargement (moteur, coffre…). */
  zone?: string;
  sombre: boolean;
  /** L'utilisateur veut voir les fiches de cette zone. */
  onZone: (zone: string) => void;
};
