import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RobotAvatar, Screen, SectionTitle, StatPill, TopBar } from '@/components/RobolingoUI';
import { INTERESTS, useAppState } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function ProfileScreen() {
  const colors = useColors();
  const { player, toggleTheme } = useAppState();
  return (
    <Screen>
      <TopBar title="Seu perfil" subtitle="Sua evolução até aqui" />
      <View style={[styles.profileHero, { backgroundColor: colors.heroStart }]}>
        <RobotAvatar size={78} />
        <View style={styles.profileCopy}>
          <Text style={styles.profileName}>{player.name} Silva</Text>
          <Text style={styles.profileMeta}>Explorador do inglês · Nível {player.level}</Text>
        </View>
        <View style={[styles.levelBadge, { backgroundColor: colors.accent }]}>
          <Text style={[styles.levelBadgeText, { color: colors.accentForeground }]}>{player.level}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatPill icon="trophy-outline" value={player.completedMissions} label="missões" />
        <StatPill icon="flame" value={player.streakDays} label="streak" tone="accent" />
        <StatPill icon="star-outline" value={player.xp} label="XP" tone="purple" />
      </View>

      <SectionTitle title="Seus interesses" />
      <Text style={[styles.helperText, { color: colors.mutedForeground }]}>
        Escolha os temas que deixam suas missões mais divertidas.
      </Text>
      <View style={styles.interestList}>
        {INTERESTS.map((interest) => {
          const selected = player.selectedThemes.includes(interest.id);
          return (
            <Pressable
              key={interest.id}
              onPress={() => toggleTheme(interest.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              style={({ pressed }) => [
                styles.interestRow,
                {
                  backgroundColor: selected ? colors.secondary : colors.card,
                  borderColor: selected ? colors.primary : colors.border,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <View style={[styles.interestIcon, { backgroundColor: selected ? colors.primary : colors.muted }]}>
                <Ionicons
                  name={interest.icon as keyof typeof Ionicons.glyphMap}
                  size={19}
                  color={selected ? colors.primaryForeground : colors.mutedForeground}
                />
              </View>
              <Text style={[styles.interestLabel, { color: colors.foreground }]}>{interest.label}</Text>
              <Ionicons
                name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={selected ? colors.primary : colors.mutedForeground}
              />
            </Pressable>
          );
        })}
      </View>

      <SectionTitle title="Conquistas recentes" />
      <View style={[styles.achievement, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.achievementIcon, { backgroundColor: colors.accent }]}>
          <Ionicons name="flame" size={20} color={colors.accentForeground} />
        </View>
        <View style={styles.achievementCopy}>
          <Text style={[styles.achievementTitle, { color: colors.foreground }]}>Em chamas</Text>
          <Text style={[styles.achievementSubtitle, { color: colors.mutedForeground }]}>Mantenha 5 dias seguidos</Text>
        </View>
        <Ionicons name="checkmark-circle" size={22} color={colors.success} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileHero: {
    minHeight: 138,
    borderRadius: 25,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  profileCopy: {
    flex: 1,
  },
  profileName: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 21,
  },
  profileMeta: {
    color: 'rgba(255,255,255,0.68)',
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    marginTop: 5,
  },
  levelBadge: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  helperText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 13,
  },
  interestList: {
    gap: 9,
  },
  interestRow: {
    minHeight: 58,
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  interestIcon: {
    width: 37,
    height: 37,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  interestLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    flex: 1,
  },
  achievement: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  achievementIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementCopy: {
    flex: 1,
  },
  achievementTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },
  achievementSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    marginTop: 3,
  },
});