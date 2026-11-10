/**
 * Lecteur du cours avant la leçon (docs/cours-avant-lecon.md) :
 * 1. vidéos → 2. fiches → 3. quiz → 4. bilan (résultat du quiz) → 5. ce que dit la loi.
 * Contenus protégés : pas de téléchargement, pas d'image dans l'image, captures bloquées.
 */
import { Stack, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useMemo, useRef, useState, type ComponentRef } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Bouton, EtatVide, Icone, Ligne, NoteAttention, Section, Texte } from '@/components/ui';
import { idEleveConnecte, prochaineLecon, trouverCours } from '@/data/depot';
import { corrigerQuiz, tirerQuiz } from '@/features/cours/quiz';
import type { Cours, QuestionTiree, ResultatQuiz } from '@/features/cours/types';
import { formatHeure } from '@/lib/format';
import { useProtectionContenu } from '@/lib/protection-video';
import { useSuiviCours } from '@/lib/suivi-cours';
import { useTheme } from '@/theme/use-theme';

type Etape = 'videos' | 'fiches' | 'quiz' | 'bilan' | 'loi';
const ETAPES: { cle: Etape; libelle: string }[] = [
  { cle: 'videos', libelle: 'Vidéos' },
  { cle: 'fiches', libelle: 'Fiches techniques' },
  { cle: 'quiz', libelle: 'Quiz' },
  { cle: 'bilan', libelle: 'Bilan' },
  { cle: 'loi', libelle: 'Ce que dit la loi' },
];

/* ---------- 1. Vidéos ---------- */

function Lecteur({ source }: { source: number | string }) {
  const { couleurs, rayon } = useTheme();
  const { width } = useWindowDimensions();
  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
  });
  // Format vertical 9:16, à une taille qui laisse voir toute la vidéo et ses commandes.
  const largeur = Math.min(width - 32, 300);
  const hauteur = Math.round((largeur * 16) / 9);
  return (
    <View
      style={[
        styles.cadreVideo,
        { width: largeur, height: hauteur, borderRadius: rayon.groupe, backgroundColor: couleurs.bitume },
      ]}>
      <VideoView
        player={player}
        style={{ width: largeur, height: hauteur }}
        nativeControls
        allowsPictureInPicture={false}
        contentFit="contain"
      />
    </View>
  );
}

function EtapeVideos({ cours }: { cours: Cours }) {
  const [index, setIndex] = useState(0);
  const video = cours.videos[index];
  return (
    <>
      <Section titre={`Vidéo ${index + 1} sur ${cours.videos.length} · ${video.titre}`} forme="libre">
        <Lecteur key={index} source={video.source} />
      </Section>
      {cours.videos.length > 1 ? (
        <Section titre="Toutes les vidéos">
          {cours.videos.map((v, i) => (
            <Ligne
              key={v.titre}
              icone={i === index ? 'cours' : 'chevron'}
              titre={`${i + 1}. ${v.titre}`}
              sousTitre={i === index ? 'En cours de lecture' : `${Math.round(v.dureeSecondes)} s`}
              onPress={i === index ? undefined : () => setIndex(i)}
            />
          ))}
        </Section>
      ) : null}
    </>
  );
}

/* ---------- 2. Fiches ---------- */

function EtapeFiches({ cours }: { cours: Cours }) {
  return (
    <>
      {cours.fiches.map((fiche) => (
        <Section key={fiche.titre} titre={fiche.titre}>
          {fiche.etapes.map((etape, i) => (
            <Ligne key={etape.titre} titre={`${i + 1}. ${etape.titre}`} sousTitre={etape.texte} />
          ))}
        </Section>
      ))}
    </>
  );
}

/* ---------- 3. Quiz ---------- */

function EtapeQuiz({
  questions,
  onTermine,
}: {
  questions: QuestionTiree[];
  onTermine: (reponses: (number | null)[]) => void;
}) {
  const { couleurs, espace } = useTheme();
  const [position, setPosition] = useState(0);
  const [reponses, setReponses] = useState<(number | null)[]>(() => questions.map(() => null));
  const question = questions[position];
  const choix = reponses[position];
  const repondu = choix !== null;
  const juste = repondu && question.reponses[choix].correcte;

  const choisir = (i: number) => setReponses((r) => r.map((v, k) => (k === position ? i : v)));
  const suivante = () => (position + 1 < questions.length ? setPosition(position + 1) : onTermine(reponses));

  return (
    <>
      <View style={{ paddingHorizontal: espace.xl, paddingTop: espace.xl, gap: espace.xs }}>
        <Texte variante="sousTitre" ton="secondaire" tabulaire>
          Question {position + 1} sur {questions.length}
        </Texte>
        <Texte variante="titre3" accessibilityRole="header">
          {question.enonce}
        </Texte>
      </View>
      <Section>
        {question.reponses.map((r, i) => {
          const choisie = choix === i;
          const montrerBonne = repondu && r.correcte;
          const montrerFausse = repondu && choisie && !r.correcte;
          return (
            <Ligne
              key={r.texte}
              titre={r.texte}
              sousTitre={montrerBonne ? 'Bonne réponse' : montrerFausse ? 'Ta réponse' : undefined}
              sousTitreAlerte={montrerFausse}
              aDroite={
                montrerBonne ? (
                  <Icone nom="valider" taille={22} couleur={couleurs.teinte} libelle="Bonne réponse" />
                ) : montrerFausse ? (
                  <Icone nom="attention" taille={22} couleur={couleurs.danger} libelle="Mauvaise réponse" />
                ) : undefined
              }
              onPress={repondu ? undefined : () => choisir(i)}
            />
          );
        })}
      </Section>
      {repondu ? (
        <View style={{ paddingHorizontal: espace.l, paddingTop: espace.l, gap: espace.l }}>
          <NoteAttention titre={juste ? 'Exact !' : 'Pas tout à fait'} preuve={question.explication} />
          <Bouton titre={position + 1 < questions.length ? 'Question suivante' : 'Voir mon résultat'} onPress={suivante} />
        </View>
      ) : null}
    </>
  );
}

/* ---------- 4. Bilan ---------- */

function EtapeBilan({ cours, resultat }: { cours: Cours; resultat: ResultatQuiz }) {
  const { espace } = useTheme();
  return (
    <>
      <View style={{ paddingHorizontal: espace.xl, paddingTop: espace.xl, gap: espace.xs }}>
        <Texte variante="chiffreGrand" tabulaire>
          {resultat.score} / {resultat.total}
        </Texte>
        <Texte variante="titre3">{resultat.valide ? 'Cours validé, tu es prêt pour ta leçon.' : 'Pas encore validé.'}</Texte>
        <Texte variante="sousTitre" ton="secondaire">
          {resultat.valide
            ? 'Ton enseignant voit que tu as fait ton cours.'
            : `Il faut ${cours.seuilReussite} bonnes réponses sur ${cours.nbQuestionsAffichees}. Relis la fiche, revois la vidéo, puis refais le quiz : les questions changent à chaque fois.`}
        </Texte>
      </View>
      {resultat.ratees.length > 0 ? (
        <Section titre="À revoir">
          {resultat.ratees.map((r) => (
            <Ligne
              key={r.question.id}
              titre={r.question.enonce}
              sousTitre={`Bonne réponse : ${r.bonneReponse}. ${r.question.explication}`}
            />
          ))}
        </Section>
      ) : null}
    </>
  );
}

/* ---------- Écran ---------- */

export default function LecteurCours() {
  const router = useRouter();
  const { espace } = useTheme();
  useProtectionContenu('lecteur-cours');
  const defilement = useRef<ComponentRef<typeof ScrollView>>(null);

  const eleveId = idEleveConnecte();
  const lecon = prochaineLecon(eleveId);
  const cours = trouverCours(lecon?.cours?.coursId);
  const { suivi, enregistrer } = useSuiviCours(eleveId, cours?.id);

  const [etape, setEtape] = useState<Etape>('videos');
  const [tirage, setTirage] = useState(0);
  const [resultat, setResultat] = useState<ResultatQuiz | null>(null);
  const dejaVues = useMemo(() => suivi?.tentatives.flatMap((t) => t.questionsRateesIds) ?? [], [suivi]);
  // Un nouveau tirage à chaque passage (le compteur `tirage` force le recalcul).
  const questions = useMemo(() => (cours ? tirerQuiz(cours, dejaVues) : []), [cours, tirage]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!cours) {
    return (
      <>
        <Stack.Screen options={{ title: 'Cours', headerLargeTitle: false }} />
        <EtatVide icone="cours" titre="Pas de cours à préparer" message="Ton prochain cours apparaîtra ici avant ta leçon." />
      </>
    );
  }

  const indexEtape = ETAPES.findIndex((e) => e.cle === etape);
  const aller = (e: Etape) => {
    setEtape(e);
    defilement.current?.scrollTo({ y: 0, animated: false });
  };
  const terminerQuiz = (reponses: (number | null)[]) => {
    const r = corrigerQuiz(questions, reponses, cours.seuilReussite);
    setResultat(r);
    enregistrer(r);
    aller('bilan');
  };
  const refaireQuiz = () => {
    setTirage((t) => t + 1);
    setResultat(null);
    aller('quiz');
  };

  return (
    <>
      <Stack.Screen options={{ title: cours.titre, headerLargeTitle: false }} />
      <ScrollView
        ref={defilement}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: espace.xxxl, gap: espace.xs }}>
        <Section
          pied={
            cours.demonstration
              ? `Étape ${indexEtape + 1} sur ${ETAPES.length} · ${ETAPES[indexEtape].libelle}. Contenu de démonstration.`
              : `Étape ${indexEtape + 1} sur ${ETAPES.length} · ${ETAPES[indexEtape].libelle}${lecon ? ` · à valider avant ${formatHeure(lecon.debut)}` : ''}`
          }
          forme="libre">
          {null}
        </Section>

        {etape === 'videos' ? <EtapeVideos cours={cours} /> : null}
        {etape === 'fiches' ? <EtapeFiches cours={cours} /> : null}
        {etape === 'quiz' ? <EtapeQuiz key={tirage} questions={questions} onTermine={terminerQuiz} /> : null}
        {etape === 'bilan' && resultat ? <EtapeBilan cours={cours} resultat={resultat} /> : null}
        {etape === 'loi' ? (
          <Section titre="Ce que dit la loi">
            <Ligne icone="attention" titre={cours.loi?.texte ?? 'Pas de texte pour ce cours.'} />
          </Section>
        ) : null}

        <View style={{ paddingTop: espace.xl, gap: espace.s }}>
          {etape === 'videos' ? <Bouton titre="Continuer : les fiches" onPress={() => aller('fiches')} /> : null}
          {etape === 'fiches' ? <Bouton titre="Je suis prêt : le quiz" onPress={() => aller('quiz')} /> : null}
          {etape === 'bilan' && resultat?.valide ? (
            <Bouton titre="Continuer : ce que dit la loi" onPress={() => aller('loi')} />
          ) : null}
          {etape === 'bilan' && resultat && !resultat.valide ? (
            <>
              <Bouton titre="Refaire le quiz" onPress={refaireQuiz} />
              <Bouton titre="Revoir la vidéo et la fiche" variante="secondaire" onPress={() => aller('videos')} />
            </>
          ) : null}
          {etape === 'loi' ? <Bouton titre="Terminer" onPress={() => router.back()} /> : null}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  cadreVideo: {
    overflow: 'hidden',
    alignSelf: 'center',
  },
});
