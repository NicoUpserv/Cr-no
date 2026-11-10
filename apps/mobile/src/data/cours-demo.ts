/**
 * Cours de DÉMONSTRATION : « Insertion sur voie rapide ».
 * Contenu rédigé pour la démo, à remplacer par le contenu validé de l'auto-école.
 * Les vidéos sont des cartons de démonstration aux couleurs de Créno.
 */
import type { Cours } from '@/features/cours/types';

const q = (id: string, enonce: string, bonne: string, fausses: [string, string], explication: string) => ({
  id,
  enonce,
  reponses: [
    { texte: bonne, correcte: true },
    { texte: fausses[0], correcte: false },
    { texte: fausses[1], correcte: false },
  ],
  explication,
});

export const coursInsertionDemo: Cours = {
  id: 'cours-insertion-voie-rapide',
  titre: 'Insertion sur voie rapide',
  competence: 'C3',
  demonstration: true,
  videos: [
    { titre: 'La voie d’accélération', source: require('../../assets/demo/insertion-1.mp4'), dureeSecondes: 8 },
    { titre: 'Regarder, signaler, s’insérer', source: require('../../assets/demo/insertion-2.mp4'), dureeSecondes: 8 },
  ],
  fiches: [
    {
      titre: 'Avant de t’insérer',
      etapes: [
        { titre: 'Prends de l’élan', texte: 'Sur la voie d’accélération, accélère franchement pour arriver à une vitesse proche de celle des voitures sur la voie rapide.' },
        { titre: 'Signale-toi tôt', texte: 'Mets ton clignotant gauche dès le début de la voie d’accélération : les autres comprennent que tu vas t’insérer.' },
        { titre: 'Regarde', texte: 'Rétroviseur intérieur, rétroviseur gauche, puis coup d’œil dans l’angle mort par-dessus l’épaule gauche.' },
      ],
    },
    {
      titre: 'Pendant et après l’insertion',
      etapes: [
        { titre: 'Cède le passage', texte: 'Les véhicules déjà sur la voie rapide sont prioritaires. Tu t’insères dans un espace libre, sans les obliger à freiner.' },
        { titre: 'Glisse-toi en douceur', texte: 'Change de voie progressivement, sans coup de volant, en gardant une distance de sécurité devant et derrière.' },
        { titre: 'Termine proprement', texte: 'Une fois inséré, coupe ton clignotant et adapte ta vitesse à la circulation.' },
      ],
    },
  ],
  nbQuestionsAffichees: 6,
  seuilReussite: 5,
  banqueQuestions: [
    q('ins-1', 'Sur la voie d’accélération, que dois-tu faire ?', 'Accélérer pour atteindre une vitesse proche de celle de la circulation', ['Rouler doucement pour bien regarder', 'T’arrêter au début de la voie'], 'Si tu arrives trop lentement, les autres doivent freiner pour toi : c’est dangereux.'),
    q('ins-2', 'Quel clignotant mets-tu pour t’insérer ?', 'Le clignotant gauche', ['Le clignotant droit', 'Aucun, ce n’est pas obligatoire'], 'Tu vas vers la gauche : le clignotant gauche prévient ceux qui arrivent derrière.'),
    q('ins-3', 'Quand mets-tu ton clignotant ?', 'Dès le début de la voie d’accélération', ['Au dernier moment, juste avant de changer de voie', 'Une fois sur la voie rapide'], 'Plus tu te signales tôt, plus les autres ont le temps de te laisser de la place.'),
    q('ins-4', 'Qui est prioritaire au moment de l’insertion ?', 'Les véhicules déjà sur la voie rapide', ['Toi, puisque tu arrives sur la voie', 'Le plus rapide des deux'], 'Tu t’insères dans la circulation : c’est à toi de trouver ta place sans gêner.'),
    q('ins-5', 'Avant de te déporter, où regardes-tu ?', 'Rétroviseur gauche puis angle mort à gauche', ['Seulement le rétroviseur intérieur', 'Seulement devant toi'], 'Une voiture peut être cachée dans ton angle mort : le coup d’œil par-dessus l’épaule la révèle.'),
    q('ins-6', 'L’angle mort, c’est…', 'La zone qu’on ne voit pas dans les rétroviseurs', ['La zone juste devant le capot', 'Le rétroviseur intérieur'], 'C’est pour ça qu’il faut tourner la tête avant de changer de voie.'),
    q('ins-7', 'Comment changes-tu de voie pour t’insérer ?', 'Progressivement, sans coup de volant', ['D’un coup de volant rapide', 'En freinant pendant le changement de voie'], 'Un mouvement doux et lisible permet aux autres d’anticiper.'),
    q('ins-8', 'Une fois inséré sur la voie rapide, tu…', 'Coupes ton clignotant', ['Laisses ton clignotant quelques kilomètres', 'Mets ton clignotant droit'], 'Un clignotant oublié trompe les autres conducteurs.'),
    q('ins-9', 'Quelle distance gardes-tu avec la voiture de devant après l’insertion ?', 'Une distance de sécurité suffisante', ['Le plus près possible pour ne pas te faire doubler', 'Aucune règle'], 'Sur voie rapide, il faut du temps pour réagir : garde au moins 2 secondes d’écart.'),
    q('ins-10', 'Tu es déjà sur la voie rapide, une voiture s’insère. Que fais-tu ?', 'Je facilite son insertion si je peux le faire sans danger', ['J’accélère pour passer devant elle', 'Je klaxonne pour la prévenir'], 'Se décaler à gauche quand c’est libre, ou adapter sa vitesse, rend l’insertion plus sûre pour tout le monde.'),
    q('ins-11', 'Pendant l’insertion, ta vitesse doit être…', 'Proche de celle des véhicules sur la voie rapide', ['Beaucoup plus faible, par prudence', 'Toujours la vitesse maximale autorisée'], 'C’est l’écart de vitesse qui crée le danger, dans un sens comme dans l’autre.'),
    q('ins-12', 'Où t’insères-tu ?', 'Dans un espace libre assez grand entre deux véhicules', ['Juste devant la première voiture qui arrive', 'N’importe où, les autres s’adapteront'], 'Choisis ton espace tôt, en regardant dans les rétroviseurs pendant l’accélération.'),
    q('ins-13', 'Pendant l’insertion, tes mains sont…', 'Sur le volant, pour une trajectoire stable', ['Une main sur le levier de vitesse', 'Une main pour régler la radio'], 'Les deux mains sur le volant permettent un changement de voie précis.'),
    q('ins-14', 'Ce qui crée le danger lors d’une insertion, c’est surtout…', 'Arriver trop lentement sur la voie rapide', ['Mettre son clignotant trop tôt', 'Regarder dans l’angle mort'], 'Une voiture trop lente oblige les autres à freiner fort ou à changer de voie brusquement.'),
    q('ins-15', 'Pourquoi regarder plusieurs fois dans les rétroviseurs pendant l’accélération ?', 'Pour repérer tôt l’espace où je vais m’insérer', ['Pour vérifier ma coiffure', 'Ce n’est pas utile, un coup d’œil suffit'], 'La situation change vite : regarder plusieurs fois te permet d’ajuster ta vitesse à l’espace choisi.'),
  ],
  loi: {
    texte:
      'Ne pas céder le passage aux véhicules déjà sur la voie rapide, c’est un refus de priorité. Pour info, cela peut coûter une amende, un retrait de points et une suspension de permis. (Contenu de démonstration : la partie « loi » sera celle de ton auto-école.)',
  },
};
