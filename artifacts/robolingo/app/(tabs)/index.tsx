import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  MissionBanner,
  RobotAvatar,
  Screen,
  SectionTitle,
  StatPill,
  SyncStatusIndicator,
  TopBar,
  ProgressBar,
} from '@/components/RobolingoUI';
import { INTERESTS, useAppState } from '@/context/AppContext';
import { getDailyMission } from '@/data/missions';
import { useColors } from '@/hooks/useColors';

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { player, syncStatus } = useAppState();
  const progress = (player.xp / player.xpNextLevel) * 100;
  const dailyMission = getDailyMission(player.selectedThemes, player.completedMissions);

  return (
    <Screen>
      <TopBar
        subtitle="Sua jornada de inglês"
        right={
          <Pressable
            onPress={() => router.push('/profile')}
            accessibilityRole="button"
            accessibilityLabel="Abrir perfil"
            style={({ pressed }) => [{ opacity: pressed ? 0.65 : 1 }]}
          >
            <RobotAvatar size={43} />
          </Pressable>
        }
      />
      <SyncStatusIndicator status={syncStatus} />

      <View style={[styles.welcomeRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.welcomeCopy}>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>BOM DIA, {player.name.toUpperCase()}</Text>
          <Text style={[styles.welcomeTitle, { color: colors.foreground }]}>Pronto para evoluir?</Text>
          <Text style={[styles.welcomeBody, { color: colors.mutedForeground }]}>
            Mais uma missão e você fica mais perto do próximo nível.
          </Text>
          <View style={styles.levelLine}>
            <View style={styles.levelLabel}>
              <Text style={[styles.levelText, { color: colors.foreground }]}>Nível {player.level}</Text>
              <Text style={[styles.xpText, { color: colors.primary }]}>{player.xp}/{player.xpNextLevel} XP</Text>
            </View>
            <ProgressBar progress={progress} color={colors.primary} />
          </View>
        </View>
        <RobotAvatar size={64} />
      </View>

      <View style={styles.statsRow}>
        <StatPill icon="flame" value={player.streakDays} label="dias seguidos" tone="accent" />
        <StatPill icon="star" value={player.xp} label="XP total" />
        <StatPill icon="wallet-outline" value={player.coins} label="moedas" tone="purple" />
      </View>

      <SectionTitle title="Missão de hoje" action="Ver mapa" onAction={() => router.push('/learn')} />
      <MissionBanner mission={dailyMission} onPress={() => router.push('/mission')} />

      <SectionTitle title="Seu mundo" action="Explorar" onAction={() => router.push('/adventure')} />
      <Pressable
        onPress={() => router.push('/adventure')}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.adventureCard,
          { backgroundColor: colors.heroStart, opacity: pressed ? 0.84 : 1 },
        ]}
      >
        <View style={styles.adventureIcon}>
          <Ionicons name="map-outline" size={24} color={colors.primaryForeground} />
        </View>
        <View style={styles.adventureCopy}>
          <Text style={styles.adventureTitle}>Explore o mapa do Robolingo</Text>
          <Text style={styles.adventureDescription}>
            Desbloqueie regiões e recupere as palavras perdidas.
          </Text>
        </View>
        <Ionicons name="arrow-forward-circle" size={24} color={colors.primaryForeground} />
      </Pressable>

      <SectionTitle title="Seus interesses" action="Editar" onAction={() => router.push('/profile')} />
      <View style={styles.interestsGrid}>
        {player.selectedThemes.map((theme) => {
          const interest = INTERESTS.find((item) => item.id === theme);
          if (!interest) return null;
          return (
            <View key={theme} style={[styles.interestChip, { backgroundColor: colors.secondary }]}>
              <Ionicons name={interest.icon as keyof typeof Ionicons.glyphMap} size={16} color={colors.secondaryForeground} />
              <Text style={[styles.interestText, { color: colors.secondaryForeground }]}>{interest.label}</Text>
            </View>
          );
        })}
      </View>

      <View style={[styles.tipCard, { backgroundColor: colors.accent }]}>
        <Ionicons name="bulb-outline" size={22} color={colors.accentForeground} />
        <View style={styles.tipCopy}>
          <Text style={[styles.tipTitle, { color: colors.accentForeground }]}>Dica rápida</Text>
          <Text style={[styles.tipText, { color: colors.accentForeground }]}>
            Pratique um pouco todos os dias para manter seu streak.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  welcomeRow: {
    minHeight: 160,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  welcomeCopy: {
    flex: 1,
  },
  greeting: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1.1,
  },
  welcomeTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 23,
    letterSpacing: -0.6,
    marginTop: 6,
  },
  welcomeBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
    maxWidth: 230,
  },
  levelLine: {
    marginTop: 17,
  },
  levelLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  levelText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  xpText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
  },
  interestText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  tipCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    marginTop: 23,
  },
  tipCopy: {
    flex: 1,
  },
  tipTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },
  tipText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  adventureCard: {
    minHeight: 84,
    borderRadius: 21,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  adventureIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adventureCopy: { flex: 1 },
  adventureTitle: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 13 },
  adventureDescription: {
    color: 'rgba(255,255,255,0.72)',
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
});