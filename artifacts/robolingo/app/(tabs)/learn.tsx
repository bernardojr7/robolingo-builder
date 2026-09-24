import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ProgressBar, Screen, SectionTitle, TopBar } from '@/components/RobolingoUI';
import { useAppState } from '@/context/AppContext';
import { getDailyMission } from '@/data/missions';
import { useColors } from '@/hooks/useColors';

export default function LearnScreen() {
  const colors = useColors();
  const router = useRouter();
  const { player } = useAppState();
  const dailyMission = getDailyMission(player.selectedThemes, player.completedMissions);
  const journeyTotal = 12;
  const journeyCompleted = Math.min(player.completedMissions, journeyTotal);
  const missions = [
    {
      id: 'daily-mission',
      title: dailyMission.title,
      subtitle: dailyMission.description,
      icon: dailyMission.icon as keyof typeof Ionicons.glyphMap,
      xp: 85,
      active: true,
      accent: 'primary' as const,
    },
    {
      id: 'smart-review',
      title: 'Revisão inteligente',
      subtitle: 'Reforce as palavras que você mais erra',
      icon: 'refresh-outline' as const,
      xp: 100,
      active: false,
      accent: 'accent' as const,
    },
    {
      id: 'conversation-challenge',
      title: 'Desafio de conversação',
      subtitle: 'Pratique uma situação real em inglês',
      icon: 'chatbubbles-outline' as const,
      xp: 120,
      active: false,
      accent: 'purple' as const,
    },
  ];
  return (
    <Screen>
      <TopBar title="Mapa de missões" subtitle="Escolha seu próximo desafio" />

      <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={[styles.progressEyebrow, { color: colors.mutedForeground }]}>JORNADA ATUAL</Text>
            <Text style={[styles.progressTitle, { color: colors.foreground }]}>Primeiros passos</Text>
          </View>
          <View style={[styles.progressBadge, { backgroundColor: colors.secondary }]}>
            <Ionicons name="map-outline" size={17} color={colors.secondaryForeground} />
            <Text style={[styles.progressBadgeText, { color: colors.secondaryForeground }]}>
              {journeyCompleted}/{journeyTotal}
            </Text>
          </View>
        </View>
        <ProgressBar progress={(journeyCompleted / journeyTotal) * 100} color={colors.primary} />
        <Text style={[styles.progressCaption, { color: colors.mutedForeground }]}>
          Você já conquistou {player.completedMissions} missões.
        </Text>
      </View>

      <SectionTitle title="Trilha principal" />
      <View style={styles.missionList}>
        {missions.map((mission, index) => {
          const iconColor =
            mission.accent === 'accent'
              ? colors.accentForeground
              : mission.accent === 'purple'
                ? colors.purple
                : colors.primary;
          const iconBackground =
            mission.accent === 'accent'
              ? colors.accent
              : mission.accent === 'purple'
                ? `${colors.purple}22`
                : colors.secondary;
          return (
            <Pressable
              key={mission.id}
              disabled={!mission.active}
              onPress={() => router.push('/mission')}
              accessibilityRole={mission.active ? 'button' : undefined}
              style={({ pressed }) => [
                styles.missionRow,
                { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <View style={[styles.missionIndex, { backgroundColor: mission.active ? colors.primary : colors.muted }]}>
                {mission.active ? (
                  <Text style={styles.missionIndexText}>{index + 1}</Text>
                ) : (
                  <Ionicons name="lock-closed" size={14} color={colors.mutedForeground} />
                )}
              </View>
              <View style={[styles.missionIcon, { backgroundColor: iconBackground }]}>
                <Ionicons name={mission.icon} size={23} color={iconColor} />
              </View>
              <View style={styles.missionInfo}>
                <Text style={[styles.missionRowTitle, { color: colors.foreground }]}>{mission.title}</Text>
                <Text style={[styles.missionRowSubtitle, { color: colors.mutedForeground }]}>{mission.subtitle}</Text>
              </View>
              <View style={styles.missionReward}>
                <Ionicons name="star" size={13} color={colors.accentForeground} />
                <Text style={[styles.missionXp, { color: colors.foreground }]}>{mission.xp}</Text>
                <Ionicons name={mission.active ? 'chevron-forward' : 'lock-closed'} size={16} color={colors.mutedForeground} />
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.streakCard, { backgroundColor: colors.heroStart }]}>
        <Ionicons name="flame" size={26} color={colors.accent} />
        <View style={styles.streakCopy}>
          <Text style={styles.streakTitle}>{player.streakDays} dias de sequência</Text>
          <Text style={styles.streakSubtitle}>Faça uma missão hoje para não quebrar o ritmo.</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressCard: {
    borderRadius: 23,
    borderWidth: 1,
    padding: 18,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 17,
  },
  progressEyebrow: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1.1,
  },
  progressTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 19,
    marginTop: 5,
  },
  progressBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  progressBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
  },
  progressCaption: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    marginTop: 10,
  },
  missionList: {
    gap: 11,
  },
  missionRow: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  missionIndex: {
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionIndexText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
  },
  missionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionInfo: {
    flex: 1,
  },
  missionRowTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  missionRowSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  missionReward: {
    minWidth: 33,
    alignItems: 'center',
    gap: 2,
  },
  missionXp: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 17,
    borderRadius: 20,
    marginTop: 22,
  },
  streakCopy: {
    flex: 1,
  },
  streakTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  streakSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
});