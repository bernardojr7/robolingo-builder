import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  PrimaryButton,
  ProgressBar,
  RobotAvatar,
  Screen,
  SectionTitle,
  StatPill,
  TopBar,
} from '@/components/RobolingoUI';
import { useAppState } from '@/context/AppContext';
import {
  ACHIEVEMENTS,
  ENGLISH_LEVEL_REQUIREMENTS,
  ENGLISH_LEVELS,
  getEnglishLevel,
  REGIONS,
  SKILLS,
  type RegionId,
} from '@/data/gameDesign';
import { getCurriculumMissionState, getCurriculumMissions, getSkillProgress } from '@/data/missions';
import { useColors } from '@/hooks/useColors';

export default function AdventureScreen() {
  const colors = useColors();
  const router = useRouter();
  const { player } = useAppState();
  const [regionFilter, setRegionFilter] = useState<RegionId | 'all'>('all');
  const englishLevel = getEnglishLevel(player.level);
  const curriculumMissions = getCurriculumMissions();
  const skillProgress = getSkillProgress(player.completedMissions, player.curriculumYear);
  const filteredMissions = useMemo(
    () =>
      getCurriculumMissions({
        curriculumYear: player.curriculumYear,
        region: regionFilter === 'all' ? undefined : regionFilter,
      }),
    [player.curriculumYear, regionFilter],
  );

  return (
    <Screen>
      <TopBar
        title="Mundo Robolingo"
        subtitle="Aprenda para avançar"
        right={
          <Pressable onPress={() => router.back()} accessibilityLabel="Fechar mundo">
            <Ionicons name="close" size={25} color={colors.foreground} />
          </Pressable>
        }
      />

      <View style={[styles.storyHero, { backgroundColor: colors.heroStart }]}>
        <View style={styles.storyCopy}>
          <Text style={styles.eyebrow}>THE LOST WORDS</Text>
          <Text style={styles.storyTitle}>Recupere o conhecimento perdido.</Text>
          <Text style={styles.storyDescription}>
            Cada região guarda uma aventura. O inglês é a ferramenta para seguir adiante.
          </Text>
        </View>
        <RobotAvatar size={72} />
      </View>

      <View style={styles.statsRow}>
        <StatPill icon="star" value={player.level} label="nível" />
        <StatPill icon="flame" value={player.streakDays} label="dias" tone="accent" />
        <StatPill icon="flag-outline" value={player.completedMissions} label="missões" tone="purple" />
      </View>

      <View style={[styles.levelCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.levelHeader}>
          <View>
            <Text style={[styles.cardEyebrow, { color: colors.mutedForeground }]}>NÍVEL DE INGLÊS</Text>
            <Text style={[styles.levelName, { color: colors.foreground }]}>{englishLevel.name}</Text>
          </View>
          <View style={[styles.levelBadge, { backgroundColor: colors.secondary }]}>
            <Ionicons name="language-outline" size={16} color={colors.secondaryForeground} />
            <Text style={[styles.levelBadgeText, { color: colors.secondaryForeground }]}>
              {englishLevel.portugueseShare}
            </Text>
          </View>
        </View>
        <Text style={[styles.levelSubtitle, { color: colors.mutedForeground }]}>{englishLevel.subtitle}</Text>
        <ProgressBar progress={(player.xp / player.xpNextLevel) * 100} color={colors.primary} />
      </View>

      <SectionTitle title="Mapa da aventura" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
        <Pressable
          onPress={() => setRegionFilter('all')}
          accessibilityRole="button"
          accessibilityState={{ selected: regionFilter === 'all' }}
          style={[styles.filterChip, { backgroundColor: regionFilter === 'all' ? colors.primary : colors.card, borderColor: regionFilter === 'all' ? colors.primary : colors.border }]}
        >
          <Text style={[styles.filterChipText, { color: regionFilter === 'all' ? colors.primaryForeground : colors.mutedForeground }]}>Todas</Text>
        </Pressable>
        {REGIONS.map((region) => (
          <Pressable
            key={region.id}
            onPress={() => setRegionFilter(region.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: regionFilter === region.id }}
            style={[
              styles.filterChip,
              { backgroundColor: regionFilter === region.id ? colors.primary : colors.card, borderColor: regionFilter === region.id ? colors.primary : colors.border },
            ]}
          >
            <Ionicons name={region.icon as keyof typeof Ionicons.glyphMap} size={14} color={regionFilter === region.id ? colors.primaryForeground : colors.mutedForeground} />
            <Text style={[styles.filterChipText, { color: regionFilter === region.id ? colors.primaryForeground : colors.mutedForeground }]}>{region.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.regionList}>
        {REGIONS.map((region, index) => {
          const unlocked =
            region.id === 'village' ||
            (region.id === 'castle' ? player.level >= 10 : region.id === 'future' ? player.level >= 20 : player.completedMissions >= region.missionsRequired);
          const isCurrent = unlocked && player.completedMissions < region.missionsRequired + 5;
          return (
            <View key={region.id} style={styles.regionWrapper}>
              {index > 0 ? (
                <View style={[styles.routeLine, { backgroundColor: unlocked ? colors.primary : colors.muted }]} />
              ) : null}
              <Pressable
                disabled={!unlocked}
                onPress={() => setRegionFilter(region.id)}
                accessibilityRole={unlocked ? 'button' : undefined}
                style={({ pressed }) => [
                  styles.regionCard,
                  {
                    backgroundColor: unlocked ? colors.card : colors.muted,
                    borderColor: isCurrent ? colors.primary : colors.border,
                    opacity: pressed ? 0.78 : unlocked ? 1 : 0.72,
                  },
                ]}
              >
                <View
                  style={[
                    styles.regionIcon,
                    { backgroundColor: unlocked ? (isCurrent ? colors.primary : colors.secondary) : colors.muted },
                  ]}
                >
                  <Ionicons
                    name={unlocked ? (region.icon as keyof typeof Ionicons.glyphMap) : 'lock-closed-outline'}
                    size={22}
                    color={unlocked ? (isCurrent ? colors.primaryForeground : colors.secondaryForeground) : colors.mutedForeground}
                  />
                </View>
                <View style={styles.regionCopy}>
                  <View style={styles.regionTitleRow}>
                    <Text style={[styles.regionName, { color: colors.foreground }]}>{region.name}</Text>
                    {isCurrent ? (
                      <Text style={[styles.currentLabel, { color: colors.primary }]}>ATUAL</Text>
                    ) : null}
                  </View>
                  <Text style={[styles.regionSubtitle, { color: colors.mutedForeground }]}>{region.subtitle}</Text>
                  <Text style={[styles.regionRequirement, { color: unlocked ? colors.success : colors.mutedForeground }]}>
                    {unlocked ? 'Região disponível' : region.requirement}
                  </Text>
                </View>
                <Ionicons
                  name={unlocked ? 'chevron-forward' : 'lock-closed'}
                  size={17}
                  color={unlocked ? colors.mutedForeground : colors.mutedForeground}
                />
              </Pressable>
            </View>
          );
        })}
      </View>

      <View style={styles.missionSectionHeader}>
        <View>
          <Text style={[styles.missionSectionTitle, { color: colors.foreground }]}>Missões curriculares</Text>
          <Text style={[styles.missionSectionSubtitle, { color: colors.mutedForeground }]}>
            {regionFilter === 'all' ? 'Sua progressão do 6º ao 9º ano' : 'Missões desta região'}
          </Text>
        </View>
        <Text style={[styles.missionCount, { color: colors.primary }]}>{player.completedMissions}/{curriculumMissions.length}</Text>
      </View>
      <View style={styles.curriculumMissionList}>
        {filteredMissions.map((mission) => {
          const missionIndex = curriculumMissions.findIndex((item) => item.id === mission.id);
          const state = getCurriculumMissionState(mission, player.completedMissions, player.level);
          const completed = state === 'completed';
          const available = state !== 'blocked';
          const level = ENGLISH_LEVELS.find((item) => item.id === mission.difficulty);
          return (
            <Pressable
              key={mission.id}
              disabled={!available}
              onPress={() => router.push({ pathname: '/mission', params: { missionId: mission.id } })}
              accessibilityRole={available ? 'button' : undefined}
              accessibilityLabel={`${mission.title}, ${mission.year}º ano, ${mission.unit}`}
              style={({ pressed }) => [
                styles.curriculumMissionCard,
                {
                  backgroundColor: available ? colors.card : colors.muted,
                  borderColor: completed ? colors.success : available ? colors.border : colors.muted,
                  opacity: pressed ? 0.76 : available ? 1 : 0.7,
                },
              ]}
            >
              <View style={[styles.missionStatus, { backgroundColor: completed ? colors.success : available ? colors.primary : colors.muted }]}>
                <Ionicons
                  name={completed ? 'checkmark' : available ? 'play' : 'lock-closed'}
                  size={14}
                  color={completed || available ? colors.primaryForeground : colors.mutedForeground}
                />
              </View>
              <View style={styles.curriculumMissionCopy}>
                <View style={styles.curriculumMissionTitleRow}>
                  <Text style={[styles.curriculumMissionTitle, { color: colors.foreground }]}>{mission.title}</Text>
                  <Text style={[styles.difficultyLabel, { color: colors.primary }]}>{level?.name}</Text>
                </View>
                <Text style={[styles.curriculumMissionMeta, { color: colors.mutedForeground }]}>
                  {mission.year}º ano · {mission.unit}
                </Text>
                <Text style={[styles.curriculumMissionTopic, { color: colors.mutedForeground }]}>
                  {mission.topic} · {mission.skills.map((skill) => SKILLS.find((item) => item.id === skill)?.label).join(' · ')}
                </Text>
                {!available && !completed ? (
                  <Text style={[styles.curriculumMissionLock, { color: colors.mutedForeground }]}>
                    {player.level < ENGLISH_LEVEL_REQUIREMENTS[mission.difficulty]
                      ? `Alcance o nível ${ENGLISH_LEVEL_REQUIREMENTS[mission.difficulty]}`
                      : `Complete a missão ${missionIndex}`}
                  </Text>
                ) : null}
              </View>
              {available ? <Ionicons name="chevron-forward" size={17} color={colors.mutedForeground} /> : null}
            </Pressable>
          );
        })}
      </View>

      <SectionTitle title="Habilidades" />
      <View style={styles.skillGrid}>
        {SKILLS.map((skill) => {
          const progress = skillProgress[skill.id];
          return (
            <View key={skill.id} style={[styles.skillCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.skillHeading}>
                <Ionicons name={skill.icon as keyof typeof Ionicons.glyphMap} size={18} color={colors.primary} />
                <Text style={[styles.skillLabel, { color: colors.foreground }]}>{skill.label}</Text>
              </View>
              <Text style={[styles.skillPercent, { color: colors.primary }]}>{progress}%</Text>
              <ProgressBar progress={progress} color={colors.primary} />
            </View>
          );
        })}
      </View>

      <SectionTitle title="Conquistas" />
      <View style={styles.achievementList}>
        {ACHIEVEMENTS.map((achievement) => {
          const unlocked = achievement.requirement(player.completedMissions, player.streakDays, player.level);
          return (
            <View
              key={achievement.id}
              style={[
                styles.achievementRow,
                { backgroundColor: unlocked ? colors.card : colors.muted, borderColor: unlocked ? colors.border : 'transparent' },
              ]}
            >
              <View style={[styles.achievementIcon, { backgroundColor: unlocked ? colors.accent : colors.muted }]}>
                <Ionicons
                  name={unlocked ? (achievement.icon as keyof typeof Ionicons.glyphMap) : 'lock-closed-outline'}
                  size={20}
                  color={unlocked ? colors.accentForeground : colors.mutedForeground}
                />
              </View>
              <View style={styles.achievementCopy}>
                <Text style={[styles.achievementTitle, { color: colors.foreground }]}>{achievement.title}</Text>
                <Text style={[styles.achievementDescription, { color: colors.mutedForeground }]}>
                  {achievement.description}
                </Text>
              </View>
              {unlocked ? <Ionicons name="checkmark-circle" size={20} color={colors.success} /> : null}
            </View>
          );
        })}
      </View>

      <PrimaryButton label="Continuar missão" onPress={() => router.push('/mission')} icon="arrow-forward" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  storyHero: {
    minHeight: 172,
    borderRadius: 25,
    padding: 19,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  storyCopy: { flex: 1 },
  eyebrow: { color: '#FFD166', fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2 },
  storyTitle: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 22, lineHeight: 27, marginTop: 7 },
  storyDescription: { color: 'rgba(255,255,255,0.72)', fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17, marginTop: 7 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  levelCard: { borderWidth: 1, borderRadius: 22, padding: 17, marginTop: 16 },
  levelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardEyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.1 },
  levelName: { fontFamily: 'Inter_700Bold', fontSize: 22, marginTop: 5 },
  levelBadge: { borderRadius: 12, paddingHorizontal: 9, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 5, maxWidth: 135 },
  levelBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, flexShrink: 1 },
  levelSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 5, marginBottom: 14 },
  regionList: { gap: 0 },
  regionWrapper: { position: 'relative' },
  routeLine: { position: 'absolute', width: 3, height: 13, left: 31, top: -1, zIndex: 0 },
  regionCard: { minHeight: 82, borderWidth: 1, borderRadius: 20, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 11, zIndex: 1 },
  regionIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  regionCopy: { flex: 1 },
  regionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  regionName: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  currentLabel: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.8 },
  regionSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 3 },
  regionRequirement: { fontFamily: 'Inter_600SemiBold', fontSize: 10, marginTop: 4 },
  filterList: { gap: 8, paddingBottom: 12 },
  filterChip: { minHeight: 34, paddingHorizontal: 11, borderWidth: 1, borderRadius: 17, flexDirection: 'row', alignItems: 'center', gap: 5 },
  filterChipText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  missionSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 19, marginBottom: 10 },
  missionSectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 17 },
  missionSectionSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 3 },
  missionCount: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  curriculumMissionList: { gap: 9 },
  curriculumMissionCard: { minHeight: 86, borderWidth: 1, borderRadius: 18, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 10 },
  missionStatus: { width: 29, height: 29, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  curriculumMissionCopy: { flex: 1 },
  curriculumMissionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  curriculumMissionTitle: { fontFamily: 'Inter_700Bold', fontSize: 12, flex: 1 },
  difficultyLabel: { fontFamily: 'Inter_700Bold', fontSize: 9, textTransform: 'uppercase' },
  curriculumMissionMeta: { fontFamily: 'Inter_600SemiBold', fontSize: 10, marginTop: 4 },
  curriculumMissionTopic: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 14, marginTop: 3 },
  curriculumMissionLock: { fontFamily: 'Inter_600SemiBold', fontSize: 9, marginTop: 4 },
  skillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillCard: { width: '48%', borderWidth: 1, borderRadius: 16, padding: 12 },
  skillHeading: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  skillLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11, flex: 1 },
  skillPercent: { fontFamily: 'Inter_700Bold', fontSize: 17, marginTop: 10, marginBottom: 7 },
  achievementList: { gap: 8 },
  achievementRow: { minHeight: 64, borderWidth: 1, borderRadius: 17, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  achievementIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  achievementCopy: { flex: 1 },
  achievementTitle: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  achievementDescription: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 3 },
});