/**
 * Conversation élève ↔ auto-école. L'élève écrit à « son auto-école » ; la direction répond.
 * Les relances du dossier y arrivent aussi (avec la mention « relance »).
 * Tutoiement côté élève, vouvoiement côté direction.
 */
import { Stack } from 'expo-router';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { EtatVide, Icone, Texte } from '@/components/ui';
import { infosAutoEcole, trouverEleve } from '@/data/depot';
import { useDossier } from '@/lib/dossier';
import { formatHeure, formatJour } from '@/lib/format';
import { useTheme } from '@/theme/use-theme';

export function EcranConversation({ eleveId, vue }: { eleveId: string; vue: 'eleve' | 'direction' }) {
  const { couleurs, espace, rayon, cibleTactile, typo } = useTheme();
  const dossier = useDossier();
  const [brouillon, setBrouillon] = useState('');
  const defilement = useRef<ComponentRef<typeof ScrollView>>(null);
  const eleve = trouverEleve(eleveId);
  const messages = dossier.conversation(eleveId);
  const moi = vue === 'eleve' ? 'eleve' : 'auto-ecole';
  const maintenant = new Date();
  const { marquerLu } = dossier;

  // Ouvrir la conversation marque les messages comme lus.
  useEffect(() => {
    marquerLu(eleveId, vue);
  }, [eleveId, vue, messages.length, marquerLu]);

  const envoyer = () => {
    const texte = brouillon.trim();
    if (!texte) return;
    dossier.envoyer(eleveId, moi, texte);
    setBrouillon('');
  };

  const titre = vue === 'eleve' ? infosAutoEcole().nom : eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève';

  return (
    <>
      <Stack.Screen options={{ title: titre, headerLargeTitle: false }} />
      <KeyboardAvoidingView style={[styles.plein, { backgroundColor: couleurs.fond }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        {messages.length === 0 ? (
          <EtatVide
            icone="message"
            titre="Aucun message"
            message={vue === 'eleve' ? 'Écris à ton auto-école : une question sur ton dossier, une leçon, un paiement…' : 'Écrivez à l’élève : il recevra le message dans l’appli.'}
          />
        ) : (
          <ScrollView
            ref={defilement}
            style={styles.plein}
            contentContainerStyle={{ padding: espace.l, gap: espace.s }}
            onContentSizeChange={() => defilement.current?.scrollToEnd({ animated: false })}>
            {messages.map((m) => {
              const deMoi = m.de === moi;
              return (
                <View key={m.id} style={[styles.message, { alignSelf: deMoi ? 'flex-end' : 'flex-start', gap: espace.xxs }]}>
                  <View
                    style={{
                      backgroundColor: deMoi ? couleurs.teinte : couleurs.surface,
                      borderRadius: rayon.bouton,
                      paddingHorizontal: espace.m,
                      paddingVertical: espace.s,
                    }}>
                    <Texte variante="corps" couleur={deMoi ? couleurs.surTeinte : couleurs.texte}>
                      {m.texte}
                    </Texte>
                  </View>
                  <Texte variante="note" ton="tertiaire" style={{ alignSelf: deMoi ? 'flex-end' : 'flex-start', paddingHorizontal: espace.xs }}>
                    {formatJour(m.envoyeLe, maintenant)} · {formatHeure(m.envoyeLe)}
                    {m.relance ? ` · relance ${m.relance === 'automatique' ? 'automatique' : 'de la direction'}` : ''}
                  </Texte>
                </View>
              );
            })}
          </ScrollView>
        )}

        <View style={[styles.saisie, { backgroundColor: couleurs.surface, borderTopColor: couleurs.separateur, padding: espace.s, gap: espace.s }]}>
          <TextInput
            value={brouillon}
            onChangeText={setBrouillon}
            placeholder={vue === 'eleve' ? 'Écrire à ton auto-école' : 'Écrire à l’élève'}
            placeholderTextColor={couleurs.texteTertiaire}
            multiline
            accessibilityLabel="Message"
            style={[
              styles.champ,
              typo.corps,
              { color: couleurs.texte, backgroundColor: couleurs.fond, borderRadius: rayon.bouton, paddingHorizontal: espace.m, paddingVertical: espace.s, minHeight: cibleTactile },
            ]}
          />
          <Pressable
            onPress={envoyer}
            disabled={!brouillon.trim()}
            accessibilityRole="button"
            accessibilityLabel="Envoyer le message"
            style={({ pressed }) => [styles.bouton, { width: cibleTactile, height: cibleTactile, opacity: !brouillon.trim() ? 0.35 : pressed ? 0.6 : 1 }]}>
            <Icone nom="envoyer" taille={30} couleur={couleurs.teinte} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  plein: { flex: 1 },
  message: { maxWidth: '82%' },
  saisie: { flexDirection: 'row', alignItems: 'flex-end', borderTopWidth: StyleSheet.hairlineWidth },
  champ: { flex: 1, maxHeight: 120 },
  bouton: { alignItems: 'center', justifyContent: 'center' },
});
