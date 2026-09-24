import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { ReactNode } from 'react';
import {
  Image,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { DailyMission } from '@/data/missions';
import type { SyncStatus } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

const landscape = require('../assets/images/landscape.png');
const mascot = require('../assets/images/mascot.png');

export function Screen({
  children,
  scroll = true,
}: {
  children: ReactNode;
  scroll?: boolean;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const paddingTop = insets.top + (Platform.OS === 'web' ? 67 : 12);
  const content = (
    <View
      style={[
        styles.screenContent,
        {
          paddingTop,
          paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 96),
          backgroundColor: 'transparent',
        },
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ImageBackground source={landscape} resizeMode="cover" style={styles.sceneLayer}>
        <View style={[styles.sceneShade, { backgroundColor: colors.background }]} />
      </ImageBackground>
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </View>
  );
}

export function TopBar({
  title,
  subtitle,
  right,
}: {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.topBar}>
      <View style={[styles.brandMark, { backgroundColor: colors.primary }]}>
        <Image source={mascot} resizeMode="contain" style={styles.brandMascot} />
      </View>
      <View style={styles.topBarCopy}>
        <Text style={[styles.brandName, { color: colors.foreground }]}>
          {title ?? 'Robolingo'}
        </Text>
        {subtitle ? (
          <Text style={[styles.topBarSubtitle, { color: colors.mutedForeground }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function SyncStatusIndicator({ status }: { status: SyncStatus }) {
  const colors = useColors();
  const statusCopy = {
    syncing: {
      icon: 'cloud-upload-outline',
      label: 'Sincronizando progresso',
      detail: 'Suas alterações estão chegando ao servidor.',
      color: colors.primary,
      foreground: colors.primaryForeground,
    },
    synced: {
      icon: 'cloud-done-outline',
      label: 'Progresso salvo no servidor',
      detail: 'Tudo certo por aqui.',
      color: colors.success,
      foreground: colors.primaryForeground,
    },
    offline: {
      icon: 'phone-portrait-outline',
      label: 'Salvo apenas neste aparelho',
      detail: 'Vamos sincronizar quando a conexão voltar.',
      color: colors.accent,
      foreground: colors.accentForeground,
    },
    error: {
      icon: 'cloud-offline-outline',
      label: 'Temporariamente offline',
      detail: 'Seu progresso está salvo neste aparelho por enquanto.',
      color: colors.destructive,
      foreground: colors.destructiveForeground,
    },
  } satisfies Record<
    SyncStatus,
    {
      icon: keyof typeof Ionicons.glyphMap;
      label: string;
      detail: string;
      color: string;
      foreground: string;
    }
  >;
  const copy = statusCopy[status];

  return (
    <View
      testID="sync-status-indicator"
      accessibilityRole="text"
      accessibilityLabel={`${copy.label}. ${copy.detail}`}
      style={[styles.syncStatus, { backgroundColor: copy.color }]}
    >
      <Ionicons name={copy.icon} size={19} color={copy.foreground} />
      <View style={styles.syncStatusCopy}>
        <Text style={[styles.syncStatusLabel, { color: copy.foreground }]}>{copy.label}</Text>
        <Text style={[styles.syncStatusDetail, { color: copy.foreground }]}>{copy.detail}</Text>
      </View>
    </View>
  );
}

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      testID={accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.65 : 1 },
      ]}
    >
      <Ionicons name={icon} size={21} color={colors.foreground} />
    </Pressable>
  );
}

export function SectionTitle({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.sectionTitle}>
      <Text style={[styles.sectionHeading, { color: colors.foreground }]}>{title}</Text>
      {action && onAction ? (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1 })}
          accessibilityRole="button"
        >
          <Text style={[styles.sectionAction, { color: colors.primary }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function RobotAvatar({ size = 52 }: { size?: number }) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.robotAvatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.accent,
        },
      ]}
    >
      <Image source={mascot} resizeMode="contain" style={{ width: size * 0.9, height: size * 0.9 }} />
    </View>
  );
}

export function StatPill({
  icon,
  value,
  label,
  tone = 'primary',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  tone?: 'primary' | 'accent' | 'purple';
}) {
  const colors = useColors();
  const tint = tone === 'accent' ? colors.accentForeground : tone === 'purple' ? colors.purple : colors.primary;
  return (
    <View style={[styles.statPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons name={icon} size={17} color={tint} />
      <View>
        <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
      </View>
    </View>
  );
}

export function ProgressBar({ progress, color }: { progress: number; color?: string }) {
  const colors = useColors();
  return (
    <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
      <View
        style={[
          styles.progressFill,
          { width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: color ?? colors.accent },
        ]}
      />
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  icon = 'arrow-forward',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const colors = useColors();
  return (
    <Pressable
      testID={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        styles.primaryButton,
        {
          backgroundColor: disabled ? colors.muted : colors.primary,
          opacity: pressed ? 0.82 : 1,
        },
      ]}
    >
      <Text style={[styles.primaryButtonText, { color: disabled ? colors.mutedForeground : colors.primaryForeground }]}>
        {label}
      </Text>
      <Ionicons
        name={icon}
        size={19}
        color={disabled ? colors.mutedForeground : colors.primaryForeground}
      />
    </Pressable>
  );
}

export function MissionBanner({
  onPress,
  mission,
}: {
  onPress: () => void;
  mission: DailyMission;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
    >
      <LinearGradient
        colors={[colors.heroStart, colors.heroEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.missionBanner}
      >
        <View style={styles.missionBannerGlow} />
        <View style={styles.missionBannerCopy}>
          <View style={styles.missionEyebrow}>
            <Ionicons name={mission.icon as keyof typeof Ionicons.glyphMap} size={13} color={colors.accent} />
            <Text style={[styles.eyebrowText, { color: colors.accent }]}>
              MISSÃO DE {mission.skill.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.missionTitle}>{mission.title}</Text>
          <Text style={styles.missionDescription}>{mission.description} +85 XP.</Text>
          <View style={styles.startRow}>
            <Text style={styles.startText}>Começar missão</Text>
            <Ionicons name="arrow-forward-circle" size={20} color={colors.primaryForeground} />
          </View>
        </View>
        <View style={styles.missionRobot}>
          <RobotAvatar size={74} />
          <View style={[styles.robotBadge, { backgroundColor: colors.success }]}>
            <Ionicons name="checkmark" size={12} color={colors.primaryForeground} />
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingHorizontal: 20,
    minHeight: '100%',
  },
  sceneLayer: {
    ...StyleSheet.absoluteFill,
    height: 270,
  },
  sceneShade: {
    ...StyleSheet.absoluteFill,
    opacity: 0.74,
  },
  topBar: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 22,
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  brandMascot: {
    width: 37,
    height: 37,
  },
  topBarCopy: {
    flex: 1,
  },
  brandName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    letterSpacing: -0.4,
  },
  topBarSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
  syncStatus: {
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 14,
  },
  syncStatusCopy: {
    flex: 1,
  },
  syncStatusLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
  },
  syncStatusDetail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
    opacity: 0.86,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 27,
    marginBottom: 13,
  },
  sectionHeading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 19,
    letterSpacing: -0.3,
  },
  sectionAction: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  robotAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statPill: {
    flex: 1,
    minHeight: 63,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  statValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    marginTop: 1,
  },
  progressTrack: {
    height: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
  },
  primaryButton: {
    minHeight: 53,
    paddingHorizontal: 18,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
  },
  missionBanner: {
    minHeight: 190,
    borderRadius: 26,
    padding: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  missionBannerGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    right: -65,
    top: -45,
    backgroundColor: 'rgba(255, 209, 102, 0.11)',
  },
  missionBannerCopy: {
    flex: 1,
    justifyContent: 'center',
  },
  missionEyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  eyebrowText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1.2,
  },
  missionTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    lineHeight: 25,
    maxWidth: 220,
  },
  missionDescription: {
    color: 'rgba(255,255,255,0.72)',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 7,
  },
  startRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 17,
  },
  startText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  missionRobot: {
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  robotBadge: {
    position: 'absolute',
    right: 2,
    bottom: 31,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});