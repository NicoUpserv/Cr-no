import { useRouter } from 'expo-router';

import { profils, useProfil, type Profil } from '@/lib/profil';
import { useTheme } from '@/theme/use-theme';

import { Icone, Ligne, Section, type NomIcone } from './ui';

const icones: Record<Profil, NomIcone> = {
  eleve: 'eleve',
  moniteur: 'calendrier',
  direction: 'equipe',
};

/** Changement de profil pour la démonstration (disparaîtra avec la vraie connexion). */
export function SelecteurProfil() {
  const { profil, definirProfil } = useProfil();
  const router = useRouter();
  const { couleurs } = useTheme();

  return (
    <Section
      titre="Démonstration"
      pied="Pour présenter Créno sans compte : changez de profil à tout moment. Ce choix disparaîtra avec la vraie connexion.">
      {profils.map((p) => {
        const actif = p.valeur === profil;
        return (
          <Ligne
            key={p.valeur}
            icone={icones[p.valeur]}
            titre={`Voir comme ${p.libelle.toLowerCase()}`}
            sousTitre={actif ? `${p.description} · profil affiché` : p.description}
            aDroite={actif ? <Icone nom="valider" taille={20} couleur={couleurs.teinte} libelle="Profil affiché" /> : undefined}
            onPress={
              actif
                ? undefined
                : () => {
                    definirProfil(p.valeur);
                    router.replace(p.accueil);
                  }
            }
          />
        );
      })}
    </Section>
  );
}
