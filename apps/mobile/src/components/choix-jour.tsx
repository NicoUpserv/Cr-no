/** Choix du jour affiché dans un planning (menu natif), avec un résumé par jour. */
import { ChoixMenu, Ligne } from '@/components/ui';
import { midiLocal } from '@/features/planning/creneaux';
import { formatJour } from '@/lib/format';

type Props = {
  jours: string[];
  valeur: string;
  onChange: (jour: string) => void;
  maintenant: Date;
  /** Résumé ajouté au libellé de chaque jour (« 3 leçons »). */
  resume?: (jour: string) => string;
};

export function ChoixJour({ jours, valeur, onChange, maintenant, resume }: Props) {
  return (
    <Ligne
      icone="calendrier"
      titre="Jour"
      aDroite={
        <ChoixMenu
          valeur={valeur}
          options={jours.map((jour) => ({
            valeur: jour,
            libelle: `${formatJour(midiLocal(jour), maintenant)}${resume ? ` · ${resume(jour)}` : ''}`,
          }))}
          onChange={onChange}
          accessibilityLabel="Jour du planning"
        />
      }
    />
  );
}
