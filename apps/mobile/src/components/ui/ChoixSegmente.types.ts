export type PropsChoixSegmente<T extends string> = {
  valeur: T;
  /** 2 à 5 options courtes (« Jour », « Semaine »…). */
  options: { valeur: T; libelle: string }[];
  onChange: (valeur: T) => void;
  accessibilityLabel: string;
};
