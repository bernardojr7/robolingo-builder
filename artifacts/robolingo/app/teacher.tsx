import { Ionicons } from '@expo/vector-icons';
import { useClerk } from '@clerk/expo';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { getListStudentProgressQueryKey, useListStudentProgress } from '@workspace/api-client-react';
import { IconButton, PrimaryButton, RobotAvatar, Screen, SectionTitle, StatPill, TopBar } from '@/components/RobolingoUI';
import { useAppState } from '@/context/AppContext';
import { CURRICULUM_TRACKS, SKILLS } from '@/data/gameDesign';
import { getSkillProgress } from '@/data/missions';
import { useColors } from '@/hooks/useColors';

type SkillProgress = ReturnType<typeof getSkillProgress>;

function StudentSkillProgress({
  progress,
  colors,
}: {
  progress: SkillProgress;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.skillGrid}>
      {SKILLS.map((skill) => (
        <View
          key={skill.id}
          style={[styles.skillCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}
        >
          <View style={styles.skillHeading}>
            <Ionicons name={skill.icon as keyof typeof Ionicons.glyphMap} size={14} color={colors.primary} />
            <Text style={[styles.skillLabel, { color: colors.secondaryForeground }]}>{skill.label}</Text>
            <Text style={[styles.skillPercent, { color: colors.primary }]}>{progress[skill.id]}%</Text>
          </View>
          <View style={[styles.skillTrack, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.skillFill,
                { backgroundColor: colors.primary, width: `${progress[skill.id]}%` },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function TeacherScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signOut } = useClerk();
  const { player, setCurriculumYear } = useAppState();
  const studentsQuery = useListStudentProgress({
    query: {
      enabled: player.profileRole === 'teacher',
      retry: false,
      staleTime: 30_000,
      queryKey: [...getListStudentProgressQueryKey(), player.profileOwnerId ?? 'signed-out'],
    },
  });
  const students = studentsQuery.data ?? [];
  const classCode = player.teacherClassCode.trim();
  const participatingStudents = students.filter((student) => student.completedMissions > 0).length;
  const averageXp = students.length
    ? Math.round(students.reduce((total, student) => total + student.xp, 0) / students.length)
    : 0;

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/welcome');
  };

  const handleShareClassCode = async () => {
    if (!classCode) {
      Alert.alert(
        'Código ainda não disponível',
        'Aguarde alguns segundos enquanto geramos o código da sua turma.',
      );
      return;
    }

    try {
      await Share.share({
        message: `Entre na minha turma do Robolingo usando o código ${classCode}.`,
        title: 'Código da turma do Robolingo',
      });
    } catch {
      Alert.alert(
        'Não foi possível compartilhar',
        'Tente novamente em alguns instantes.',
      );
    }
  };

  return (
    <Screen>
      <TopBar
        title="Painel do professor"
        subtitle="Acompanhe sua turma"
        right={
          <IconButton
            icon="log-out-outline"
            accessibilityLabel="Sair da conta"
            onPress={handleSignOut}
          />
        }
      />
      <View style={[styles.hero, { backgroundColor: colors.heroStart }]}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>SALA DE AULA</Text>
          <Text style={styles.heroTitle}>Olá, {player.name}!</Text>
          <Text style={styles.heroDescription}>
            Transforme o interesse de cada aluno em uma missão de inglês.
          </Text>
        </View>
        <RobotAvatar size={76} />
      </View>

      <View style={styles.statsRow}>
        <StatPill icon="people-outline" value={students.length} label="alunos" />
        <StatPill
          icon="checkmark-circle-outline"
          value={students.length ? `${Math.round((participatingStudents / students.length) * 100)}%` : '—'}
          label="participação"
          tone="accent"
        />
        <StatPill icon="trending-up-outline" value={averageXp || '—'} label="XP médio" tone="purple" />
      </View>

      <SectionTitle title="Sua turma" action="Editar" onAction={() => undefined} />
      <View style={[styles.classCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.classIcon, { backgroundColor: colors.accent }]}>
          <Ionicons name="school-outline" size={23} color={colors.accentForeground} />
        </View>
        <View style={styles.classCopy}>
          <Text style={[styles.className, { color: colors.foreground }]}>
            {player.teacherClassName || 'Minha primeira turma'}
          </Text>
          <Text style={[styles.classMeta, { color: colors.mutedForeground }]}>
            Código de entrada · {player.teacherClassCode || 'gerando...'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={19} color={colors.mutedForeground} />
      </View>

      <SectionTitle title="Trilha curricular da turma" />
      <Text style={[styles.trackHelper, { color: colors.mutedForeground }]}>
        Escolha a progressão pedagógica que aparece no mapa dos alunos.
      </Text>
      <View style={styles.trackList}>
        {CURRICULUM_TRACKS.map((track) => {
          const selected = player.curriculumYear === track.id;
          return (
            <Pressable
              key={track.id}
              onPress={() => setCurriculumYear(track.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.trackOption,
                {
                  backgroundColor: selected ? colors.secondary : colors.card,
                  borderColor: selected ? colors.primary : colors.border,
                  opacity: pressed ? 0.76 : 1,
                },
              ]}
            >
              <View style={[styles.trackBadge, { backgroundColor: selected ? colors.primary : colors.muted }]}>
                <Text style={[styles.trackBadgeText, { color: selected ? colors.primaryForeground : colors.mutedForeground }]}>
                  {track.id}
                </Text>
              </View>
              <View style={styles.trackOptionCopy}>
                <Text style={[styles.trackOptionTitle, { color: colors.foreground }]}>{track.label}</Text>
                <Text style={[styles.trackOptionSubtitle, { color: colors.mutedForeground }]}>{track.subtitle}</Text>
              </View>
              <Ionicons
                name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                size={21}
                color={selected ? colors.primary : colors.mutedForeground}
              />
            </Pressable>
          );
        })}
      </View>

      <SectionTitle title="Evolução por habilidade" />
      <Text style={[styles.skillHelper, { color: colors.mutedForeground }]}>
        Missões concluídas em cada habilidade da trilha de {trackLabel(player.curriculumYear)}.
      </Text>
      <View style={[styles.studentList, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {studentsQuery.isLoading ? (
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Carregando progresso...</Text>
        ) : students.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Os alunos aparecerão aqui quando concluírem o onboarding.
          </Text>
        ) : (
          students.map((student) => (
            <View key={student.userId} style={[styles.studentRow, { borderBottomColor: colors.border }]}>
              <View style={styles.studentHeader}>
                <View style={styles.studentCopy}>
                  <Text style={[styles.studentName, { color: colors.foreground }]}>{student.name}</Text>
                  <Text style={[styles.studentMeta, { color: colors.mutedForeground }]}>
                    Nível {student.level} · {student.completedMissions} missões
                  </Text>
                </View>
                <Text style={[styles.studentXp, { color: colors.primary }]}>{student.xp} XP</Text>
              </View>
              <StudentSkillProgress
                progress={getSkillProgress(student.completedMissions, player.curriculumYear)}
                colors={colors}
              />
            </View>
          ))
        )}
      </View>

      <SectionTitle title="Ações rápidas" />
      <View style={styles.actionGrid}>
        {[
          ['add-circle-outline', 'Criar missão', 'Personalize um quiz'],
          ['bar-chart-outline', 'Ver relatórios', 'Veja o progresso'],
        ].map(([icon, label, description]) => (
          <Pressable
            key={label}
            onPress={() => undefined}
            style={({ pressed }) => [
              styles.actionCard,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
            ]}
          >
            <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={24} color={colors.primary} />
            <Text style={[styles.actionLabel, { color: colors.foreground }]}>{label}</Text>
            <Text style={[styles.actionDescription, { color: colors.mutedForeground }]}>{description}</Text>
          </Pressable>
        ))}
      </View>

      <PrimaryButton
        label="Compartilhar código da turma"
        icon="share-social-outline"
        onPress={handleShareClassCode}
        disabled={!classCode}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 165,
    borderRadius: 25,
    padding: 19,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  heroCopy: { flex: 1 },
  eyebrow: { color: '#FFC92D', fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2 },
  heroTitle: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 23, marginTop: 7 },
  heroDescription: {
    color: 'rgba(255,255,255,0.72)',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  classCard: {
    minHeight: 76,
    borderRadius: 19,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  classIcon: { width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  classCopy: { flex: 1 },
  className: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  classMeta: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  trackHelper: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, marginTop: -7, marginBottom: 11 },
  trackList: { gap: 8, marginBottom: 20 },
  trackOption: { minHeight: 68, borderRadius: 18, borderWidth: 1, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  trackBadge: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  trackBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  trackOptionCopy: { flex: 1 },
  trackOptionTitle: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  trackOptionSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 14, marginTop: 3 },
  skillHelper: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, marginTop: -7, marginBottom: 11 },
  actionGrid: { flexDirection: 'row', gap: 9, marginBottom: 20 },
  actionCard: { flex: 1, minHeight: 119, borderWidth: 1, borderRadius: 19, padding: 14 },
  actionLabel: { fontFamily: 'Inter_700Bold', fontSize: 13, marginTop: 12 },
  actionDescription: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4, lineHeight: 15 },
  studentList: { borderWidth: 1, borderRadius: 19, paddingHorizontal: 14, marginBottom: 20 },
  studentRow: { paddingVertical: 14, borderBottomWidth: 1 },
  studentHeader: { flexDirection: 'row', alignItems: 'center' },
  studentCopy: { flex: 1 },
  studentName: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  studentMeta: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  studentXp: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  skillGrid: { gap: 7, marginTop: 12 },
  skillCard: { borderWidth: 1, borderRadius: 12, padding: 9 },
  skillHeading: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  skillLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, flex: 1 },
  skillPercent: { fontFamily: 'Inter_700Bold', fontSize: 10 },
  skillTrack: { height: 5, borderRadius: 3, overflow: 'hidden', marginTop: 7 },
  skillFill: { height: '100%', borderRadius: 3 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, paddingVertical: 17 },
});

function trackLabel(curriculumYear: (typeof CURRICULUM_TRACKS)[number]['id']) {
  return CURRICULUM_TRACKS.find((track) => track.id === curriculumYear)?.label ?? `${curriculumYear}º ano`;
}