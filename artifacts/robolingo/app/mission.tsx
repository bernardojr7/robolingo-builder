import { Ionicons } from '@expo/vector-icons';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton, ProgressBar, RobotAvatar, Screen, TopBar } from '@/components/RobolingoUI';
import { useAppState } from '@/context/AppContext';
import { ENGLISH_LEVELS } from '@/data/gameDesign';
import { getDailyMission, getMissionById } from '@/data/missions';
import { useColors } from '@/hooks/useColors';

export default function MissionScreen() {
  const colors = useColors();
  const router = useRouter();
  const { completeMission, player } = useAppState();
  const { missionId } = useLocalSearchParams<{ missionId?: string }>();
  const selectedMissionId = Array.isArray(missionId) ? missionId[0] : missionId;
  const mission = getMissionById(selectedMissionId) ?? getDailyMission(player.selectedThemes, player.completedMissions);
  const difficulty = ENGLISH_LEVELS.find((level) => level.id === mission.difficulty);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [speakingConfidence, setSpeakingConfidence] = useState<'confident' | 'practice' | null>(null);
  const [recordingPermission, setRecordingPermission] = useState<{ granted: boolean; canAskAgain: boolean } | null>(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const recordingPlayer = useAudioPlayer(recordingUri ?? undefined);
  const isListeningChallenge = mission.mode === 'listening';
  const isSpeakingChallenge = mission.mode === 'speaking';

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  function playListeningAudio() {
    if (!mission.audioText) return;
    Speech.stop();
    setIsPlaying(true);
    Speech.speak(mission.audioText, {
      language: 'en-US',
      rate: 0.78,
      onDone: () => setIsPlaying(false),
      onStopped: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  }

  async function toggleRecording() {
    if (recorderState.isRecording) {
      try {
        await recorder.stop();
        const uri = recorder.uri;
        setRecordingUri(uri);
        setSpeakingConfidence(null);
        setFeedback(uri ? 'Gravação pronta. Ouça e avalie como foi.' : 'Não encontramos uma gravação. Tente novamente.');
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      } catch {
        setFeedback('Não foi possível terminar a gravação. Tente novamente.');
      }
      return;
    }

    const permission = await requestRecordingPermissionsAsync();
    setRecordingPermission(permission);
    if (!permission.granted) {
      setFeedback(
        permission.canAskAgain
          ? 'Precisamos do microfone para gravar sua resposta.'
          : 'O microfone está bloqueado. Abra as configurações para permitir a gravação.',
      );
      return;
    }

    try {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecordingUri(null);
      setSpeakingConfidence(null);
      setFeedback(null);
    } catch {
      setFeedback('Não foi possível iniciar o microfone. Tente novamente.');
    }
  }

  function openMicrophoneSettings() {
    if (Platform.OS !== 'web') {
      void Linking.openSettings();
    }
  }

  function submitAnswer() {
    if (isSpeakingChallenge) {
      if (!recordingUri || !speakingConfidence) return;
      const answerIsCorrect = speakingConfidence === 'confident';
      setCorrect(answerIsCorrect);
      completeMission(answerIsCorrect);
      setStep(2);
      return;
    }
    if (selected === null) return;
    const answerIsCorrect = selected === mission.correctIndex;
    setCorrect(answerIsCorrect);
    completeMission(answerIsCorrect);
    setStep(2);
  }

  return (
    <Screen>
      <TopBar
        title="Missão diária"
        subtitle={`${mission.skill} · ${mission.year}º ano`}
        right={
          <Pressable onPress={() => router.back()} accessibilityLabel="Fechar missão">
            <Ionicons name="close" size={25} color={colors.foreground} />
          </Pressable>
        }
      />

      <View style={styles.stepRow}>
        {[0, 1, 2].map((item) => (
          <View
            key={item}
            style={[
              styles.stepDot,
              { backgroundColor: item <= step ? colors.primary : colors.muted },
            ]}
          />
        ))}
      </View>

      {step === 0 ? (
        <View style={styles.dialogueScreen}>
          <View style={[styles.dialogueAvatar, { backgroundColor: colors.secondary }]}>
            <RobotAvatar size={90} />
            <View style={[styles.speechDot, { backgroundColor: colors.success }]}>
              <Ionicons name="chatbubble" size={12} color={colors.primaryForeground} />
            </View>
          </View>
          <Text style={[styles.characterName, { color: colors.primary }]}>{mission.title}</Text>
          <Text style={[styles.dialogueTitle, { color: colors.foreground }]}>Olá, {player.name}!</Text>
          <Text style={[styles.dialogueText, { color: colors.mutedForeground }]}>
            {mission.intro}
          </Text>
          <View style={[styles.curriculumCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <View style={styles.curriculumHeader}>
              <View style={styles.curriculumPill}>
                <Ionicons name="school-outline" size={14} color={colors.primary} />
                <Text style={[styles.curriculumPillText, { color: colors.primary }]}>{mission.year}º ano</Text>
              </View>
              <Text style={[styles.curriculumDifficulty, { color: colors.accent }]}>{difficulty?.name}</Text>
            </View>
            <Text style={[styles.curriculumUnit, { color: colors.foreground }]}>{mission.unit}</Text>
            <Text style={[styles.curriculumTopic, { color: colors.secondaryForeground }]}>
              {mission.topic} · {mission.skills.join(' · ')}
            </Text>
          </View>
          <View style={[styles.tipBox, { backgroundColor: colors.accent }]}>
            <Ionicons name="bulb-outline" size={20} color={colors.accentForeground} />
            <Text style={[styles.tipBoxText, { color: colors.accentForeground }]}>
              Dica: {mission.tip}
            </Text>
          </View>
          <PrimaryButton label="Estou pronto" onPress={() => setStep(1)} />
        </View>
      ) : null}

      {step === 1 ? (
        <View>
          {isListeningChallenge ? (
            <>
              <View style={[styles.questionCard, { backgroundColor: colors.heroStart }]}>
                <Text style={styles.questionEyebrow}>OUÇA E ENTENDA</Text>
                <Text style={styles.questionText}>{mission.question}</Text>
                <Text style={styles.questionHint}>{mission.hint}</Text>
              </View>
              <Pressable
                testID="play-listening-audio"
                onPress={playListeningAudio}
                accessibilityRole="button"
                accessibilityLabel={isPlaying ? 'Reproduzindo áudio' : 'Ouvir frase em inglês'}
                style={({ pressed }) => [
                  styles.audioPlayer,
                  { backgroundColor: colors.secondary, borderColor: colors.border, opacity: pressed ? 0.76 : 1 },
                ]}
              >
                <View style={[styles.audioIcon, { backgroundColor: colors.primary }]}>
                  <Ionicons name={isPlaying ? 'volume-high' : 'play'} size={21} color={colors.primaryForeground} />
                </View>
                <View style={styles.audioCopy}>
                  <Text style={[styles.audioTitle, { color: colors.foreground }]}>
                    {isPlaying ? 'Reproduzindo...' : 'Ouvir a frase'}
                  </Text>
                  <Text style={[styles.audioSubtitle, { color: colors.mutedForeground }]}>
                    Toque quantas vezes precisar
                  </Text>
                </View>
                <Ionicons name="headset-outline" size={21} color={colors.primary} />
              </Pressable>
              <View style={styles.optionsList}>
                {mission.options.map((option, index) => {
                  const isSelected = selected === index;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setSelected(index)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      style={({ pressed }) => [
                        styles.optionRow,
                        {
                          backgroundColor: isSelected ? colors.secondary : colors.card,
                          borderColor: isSelected ? colors.primary : colors.border,
                          opacity: pressed ? 0.75 : 1,
                        },
                      ]}
                    >
                      <View style={[styles.optionLetter, { backgroundColor: isSelected ? colors.primary : colors.muted }]}>
                        <Text style={[styles.optionLetterText, { color: isSelected ? colors.primaryForeground : colors.mutedForeground }]}>
                          {String.fromCharCode(65 + index)}
                        </Text>
                      </View>
                      <Text style={[styles.optionText, { color: colors.foreground }]}>{option}</Text>
                      {isSelected ? <Ionicons name="checkmark-circle" size={22} color={colors.primary} /> : null}
                    </Pressable>
                  );
                })}
              </View>
              <PrimaryButton label="Confirmar compreensão" onPress={submitAnswer} disabled={selected === null} icon="checkmark" />
            </>
          ) : isSpeakingChallenge ? (
            <>
              <View style={[styles.questionCard, { backgroundColor: colors.heroStart }]}>
                <Text style={styles.questionEyebrow}>FALE EM INGLÊS</Text>
                <Text style={styles.questionText}>{mission.speakingPrompt}</Text>
                <Text style={styles.questionHint}>Grave sua voz e compare com a frase.</Text>
              </View>
              <View style={[styles.speakingCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <View style={styles.speakingHeading}>
                  <Ionicons name="mic-outline" size={22} color={colors.primary} />
                  <Text style={[styles.speakingTitle, { color: colors.foreground }]}>Sua resposta falada</Text>
                </View>
                <Text style={[styles.speakingHint, { color: colors.mutedForeground }]}>
                  Fale devagar. Você pode regravar quantas vezes quiser.
                </Text>
                <Pressable
                  testID="record-speaking-answer"
                  onPress={toggleRecording}
                  accessibilityRole="button"
                  accessibilityLabel={recorderState.isRecording ? 'Parar gravação' : 'Gravar resposta falada'}
                  style={({ pressed }) => [
                    styles.recordButton,
                    { backgroundColor: recorderState.isRecording ? colors.destructive : colors.primary, opacity: pressed ? 0.78 : 1 },
                  ]}
                >
                  <Ionicons name={recorderState.isRecording ? 'stop' : 'mic'} size={24} color={colors.primaryForeground} />
                  <Text style={[styles.recordButtonText, { color: colors.primaryForeground }]}>
                    {recorderState.isRecording
                      ? `Parar gravação · ${Math.round(recorderState.durationMillis / 1000)}s`
                      : recordingUri
                        ? 'Gravar novamente'
                        : 'Começar gravação'}
                  </Text>
                </Pressable>
                {recordingUri ? (
                  <Pressable
                    onPress={() => recordingPlayer.play()}
                    accessibilityRole="button"
                    accessibilityLabel="Ouvir minha gravação"
                    style={[styles.replayButton, { borderColor: colors.border }]}
                  >
                    <Ionicons name="play-circle-outline" size={20} color={colors.primary} />
                    <Text style={[styles.replayText, { color: colors.foreground }]}>Ouvir minha gravação</Text>
                  </Pressable>
                ) : null}
                {recordingPermission && !recordingPermission.granted && !recordingPermission.canAskAgain ? (
                  <Pressable onPress={openMicrophoneSettings} style={styles.settingsLink} accessibilityRole="button">
                    <Text style={[styles.settingsLinkText, { color: colors.primary }]}>Abrir configurações do microfone</Text>
                  </Pressable>
                ) : null}
              </View>
              {feedback ? <Text style={[styles.recordingFeedback, { color: colors.mutedForeground }]}>{feedback}</Text> : null}
              {recordingUri ? (
                <View style={styles.speakingEvaluation}>
                  <Text style={[styles.evaluationTitle, { color: colors.foreground }]}>Como foi sua fala?</Text>
                  <View style={styles.evaluationOptions}>
                    <Pressable
                      onPress={() => setSpeakingConfidence('confident')}
                      accessibilityRole="button"
                      accessibilityState={{ selected: speakingConfidence === 'confident' }}
                      style={[styles.evaluationOption, { backgroundColor: speakingConfidence === 'confident' ? colors.secondary : colors.card, borderColor: speakingConfidence === 'confident' ? colors.primary : colors.border }]}
                    >
                      <Ionicons name="checkmark-circle-outline" size={21} color={colors.success} />
                      <Text style={[styles.evaluationText, { color: colors.foreground }]}>Consegui falar</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setSpeakingConfidence('practice')}
                      accessibilityRole="button"
                      accessibilityState={{ selected: speakingConfidence === 'practice' }}
                      style={[styles.evaluationOption, { backgroundColor: speakingConfidence === 'practice' ? colors.secondary : colors.card, borderColor: speakingConfidence === 'practice' ? colors.primary : colors.border }]}
                    >
                      <Ionicons name="refresh-outline" size={21} color={colors.accent} />
                      <Text style={[styles.evaluationText, { color: colors.foreground }]}>Vou praticar mais</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
              <PrimaryButton label="Concluir desafio" onPress={submitAnswer} disabled={!recordingUri || !speakingConfidence} icon="checkmark" />
            </>
          ) : (
            <>
              <View style={[styles.questionCard, { backgroundColor: colors.heroStart }]}>
                <Text style={styles.questionEyebrow}>ESCOLHA A RESPOSTA</Text>
                <Text style={styles.questionText}>{mission.question}</Text>
                <Text style={styles.questionHint}>{mission.hint}</Text>
              </View>
              <View style={styles.optionsList}>
                {mission.options.map((option, index) => {
                  const isSelected = selected === index;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setSelected(index)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      style={({ pressed }) => [
                        styles.optionRow,
                        {
                          backgroundColor: isSelected ? colors.secondary : colors.card,
                          borderColor: isSelected ? colors.primary : colors.border,
                          opacity: pressed ? 0.75 : 1,
                        },
                      ]}
                    >
                      <View style={[styles.optionLetter, { backgroundColor: isSelected ? colors.primary : colors.muted }]}>
                        <Text style={[styles.optionLetterText, { color: isSelected ? colors.primaryForeground : colors.mutedForeground }]}>
                          {String.fromCharCode(65 + index)}
                        </Text>
                      </View>
                      <Text style={[styles.optionText, { color: colors.foreground }]}>{option}</Text>
                      {isSelected ? <Ionicons name="checkmark-circle" size={22} color={colors.primary} /> : null}
                    </Pressable>
                  );
                })}
              </View>
              <PrimaryButton label="Confirmar resposta" onPress={submitAnswer} disabled={selected === null} icon="checkmark" />
            </>
          )}
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.resultScreen}>
          <View style={[styles.resultIcon, { backgroundColor: correct ? colors.success : colors.secondary }]}>
            <Ionicons
              name={correct ? 'trophy' : 'refresh'}
              size={40}
              color={correct ? colors.primaryForeground : colors.primary}
            />
          </View>
          <Text style={[styles.resultTitle, { color: colors.foreground }]}>
            {correct ? 'Missão concluída!' : 'Quase lá!'}
          </Text>
          <Text style={[styles.resultDescription, { color: colors.mutedForeground }]}>
            {correct
              ? mission.explanation
              : `A resposta certa é “${mission.options[mission.correctIndex]}”. Tente novamente na próxima missão e continue praticando.`}
          </Text>
          <View style={styles.rewardsRow}>
            <View style={[styles.rewardCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="star" size={19} color={colors.accentForeground} />
              <Text style={[styles.rewardValue, { color: colors.foreground }]}>{correct ? '+85' : '+0'}</Text>
              <Text style={[styles.rewardLabel, { color: colors.mutedForeground }]}>XP ganho</Text>
            </View>
            <View style={[styles.rewardCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="wallet-outline" size={19} color={colors.purple} />
              <Text style={[styles.rewardValue, { color: colors.foreground }]}>{correct ? '+35' : '+0'}</Text>
              <Text style={[styles.rewardLabel, { color: colors.mutedForeground }]}>moedas</Text>
            </View>
          </View>
          <View style={styles.resultProgress}>
            <View style={styles.resultProgressHeader}>
              <Text style={[styles.resultProgressTitle, { color: colors.foreground }]}>Progresso do nível</Text>
              <Text style={[styles.resultProgressValue, { color: colors.primary }]}>{player.xp}/{player.xpNextLevel} XP</Text>
            </View>
            <ProgressBar progress={(player.xp / player.xpNextLevel) * 100} color={colors.primary} />
          </View>
          <View style={[styles.feedbackCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {feedback ? (
              <View style={styles.feedbackThanks}>
                <Ionicons name="heart" size={18} color={colors.primary} />
                <Text style={[styles.feedbackThanksText, { color: colors.foreground }]}>
                  Obrigado! Seu feedback ajuda a melhorar as próximas missões.
                </Text>
              </View>
            ) : (
              <>
                <Text style={[styles.feedbackTitle, { color: colors.foreground }]}>Como foi esta missão?</Text>
                <View style={styles.feedbackOptions}>
                  {[
                    ['😄', 'Fácil'],
                    ['🙂', 'Boa'],
                    ['😐', 'Difícil'],
                    ['😵', 'Muito difícil'],
                  ].map(([emoji, label]) => (
                    <Pressable
                      key={label}
                      onPress={() => setFeedback(label)}
                      accessibilityRole="button"
                      style={({ pressed }) => [
                        styles.feedbackOption,
                        { backgroundColor: colors.secondary, opacity: pressed ? 0.72 : 1 },
                      ]}
                    >
                      <Text style={styles.feedbackEmoji}>{emoji}</Text>
                      <Text style={[styles.feedbackLabel, { color: colors.secondaryForeground }]}>{label}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </View>
          <PrimaryButton label="Voltar ao mapa" onPress={() => router.replace('/')} icon="map-outline" />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stepRow: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 28,
  },
  stepDot: {
    height: 5,
    flex: 1,
    borderRadius: 4,
  },
  dialogueScreen: {
    alignItems: 'center',
    paddingTop: 13,
  },
  dialogueAvatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  speechDot: {
    position: 'absolute',
    right: 10,
    bottom: 13,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  dialogueTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 27,
    marginTop: 8,
  },
  dialogueText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 9,
    maxWidth: 330,
  },
  curriculumCard: { width: '100%', borderWidth: 1, borderRadius: 17, padding: 13, marginTop: 17, marginBottom: 3 },
  curriculumHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  curriculumPill: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  curriculumPillText: { fontFamily: 'Inter_700Bold', fontSize: 11 },
  curriculumDifficulty: { fontFamily: 'Inter_700Bold', fontSize: 10, textTransform: 'uppercase' },
  curriculumUnit: { fontFamily: 'Inter_700Bold', fontSize: 12, marginTop: 9 },
  curriculumTopic: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 15, marginTop: 4 },
  tipBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 15,
    borderRadius: 17,
    marginTop: 26,
    marginBottom: 18,
  },
  tipBoxText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    flex: 1,
  },
  questionCard: {
    borderRadius: 25,
    padding: 22,
    minHeight: 190,
    justifyContent: 'center',
  },
  questionEyebrow: {
    color: '#FFD166',
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1.1,
    marginBottom: 12,
  },
  questionText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 25,
    lineHeight: 32,
  },
  questionHint: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 14,
  },
  optionsList: {
    gap: 10,
    marginVertical: 22,
  },
  audioPlayer: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginTop: 17,
  },
  audioIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioCopy: { flex: 1 },
  audioTitle: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  audioSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 3 },
  speakingCard: { borderWidth: 1, borderRadius: 20, padding: 16, marginTop: 17 },
  speakingHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  speakingTitle: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  speakingHint: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, marginTop: 8 },
  recordButton: {
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 16,
  },
  recordButtonText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  replayButton: { minHeight: 43, borderTopWidth: 1, marginTop: 13, paddingTop: 13, flexDirection: 'row', alignItems: 'center', gap: 8 },
  replayText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  settingsLink: { alignSelf: 'center', marginTop: 12 },
  settingsLinkText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  recordingFeedback: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 10 },
  speakingEvaluation: { marginTop: 20 },
  evaluationTitle: { fontFamily: 'Inter_700Bold', fontSize: 13, textAlign: 'center', marginBottom: 10 },
  evaluationOptions: { flexDirection: 'row', gap: 8 },
  evaluationOption: { flex: 1, minHeight: 61, borderWidth: 1, borderRadius: 15, padding: 9, alignItems: 'center', justifyContent: 'center', gap: 4 },
  evaluationText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, textAlign: 'center' },
  optionRow: {
    minHeight: 61,
    borderWidth: 1,
    borderRadius: 17,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  optionLetter: {
    width: 35,
    height: 35,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },
  optionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    flex: 1,
  },
  resultScreen: {
    alignItems: 'center',
    paddingTop: 26,
  },
  resultIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 27,
    marginTop: 21,
  },
  resultDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 330,
    marginTop: 9,
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 25,
  },
  rewardCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
  },
  rewardValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 19,
    marginTop: 6,
  },
  rewardLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    marginTop: 2,
  },
  resultProgress: {
    width: '100%',
    marginTop: 25,
    marginBottom: 23,
  },
  resultProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultProgressTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  resultProgressValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  feedbackCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 18,
    padding: 13,
    marginBottom: 18,
  },
  feedbackTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
  feedbackOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 5,
  },
  feedbackOption: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 8,
    minHeight: 58,
    justifyContent: 'center',
  },
  feedbackEmoji: { fontSize: 18 },
  feedbackLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 9, marginTop: 4, textAlign: 'center' },
  feedbackThanks: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 32 },
  feedbackThanksText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16 },
});