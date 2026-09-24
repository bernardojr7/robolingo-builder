import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AccountRole, InterestId, INTERESTS } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { KeyboardAwareScrollViewCompat } from './KeyboardAwareScrollViewCompat';

const landscape = require('../assets/images/landscape.png');
const mascot = require('../assets/images/mascot.png');

export function AuthShell({
  children,
  scroll = true,
}: {
  children: ReactNode;
  scroll?: boolean;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const content = (
    <View
      style={[
        styles.authContent,
        { paddingTop: insets.top + 22, paddingBottom: insets.bottom + 28 },
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ImageBackground source={landscape} resizeMode="cover" style={styles.scene}>
        <View style={[styles.sceneShade, { backgroundColor: colors.background }]} />
      </ImageBackground>
      {scroll ? (
        <KeyboardAwareScrollViewCompat
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </KeyboardAwareScrollViewCompat>
      ) : (
        content
      )}
    </View>
  );
}

export function AuthBrand() {
  const colors = useColors();
  return (
    <View style={styles.brand}>
      <View style={[styles.brandIcon, { backgroundColor: colors.primary }]}>
        <Image source={mascot} resizeMode="contain" style={styles.mascot} />
      </View>
      <Text style={[styles.brandName, { color: colors.foreground }]}>Robolingo</Text>
      <Text style={[styles.brandCaption, { color: colors.mutedForeground }]}>
        Inglês que conversa com o seu mundo
      </Text>
    </View>
  );
}

export function AuthCard({ children }: { children: ReactNode }) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

export function AuthTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.titleBlock}>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>{description}</Text>
    </View>
  );
}

export function AuthInput({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  const colors = useColors();
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <TextInput
        {...props}
        style={[
          styles.input,
          { backgroundColor: colors.input, borderColor: error ? colors.destructive : colors.border, color: colors.foreground },
          props.style,
        ]}
        placeholderTextColor={colors.mutedForeground}
      />
      {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
    </View>
  );
}

export function AuthButton({
  label,
  onPress,
  disabled = false,
  secondary = false,
  icon,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: secondary ? colors.secondary : disabled ? colors.muted : colors.primary,
          borderColor: secondary ? colors.border : 'transparent',
          opacity: pressed ? 0.82 : disabled ? 0.6 : 1,
        },
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={18}
          color={secondary ? colors.secondaryForeground : colors.primaryForeground}
        />
      ) : null}
      <Text
        style={[
          styles.buttonText,
          { color: secondary ? colors.secondaryForeground : colors.primaryForeground },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function AuthLink({
  prefix,
  label,
  onPress,
}: {
  prefix: string;
  label: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.linkRow}>
      <Text style={[styles.linkPrefix, { color: colors.mutedForeground }]}>{prefix}</Text>
      <Pressable onPress={onPress} accessibilityRole="link">
        <Text style={[styles.linkLabel, { color: colors.primary }]}>{label}</Text>
      </Pressable>
    </View>
  );
}

export function RoleChoice({
  role,
  selected,
  onPress,
}: {
  role: AccountRole;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const isStudent = role === 'student';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.roleChoice,
        {
          backgroundColor: selected ? colors.secondary : colors.card,
          borderColor: selected ? colors.primary : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={[styles.roleIcon, { backgroundColor: isStudent ? colors.accent : colors.primary }]}>
        <Ionicons
          name={isStudent ? 'school-outline' : 'people-outline'}
          size={22}
          color={isStudent ? colors.accentForeground : colors.primaryForeground}
        />
      </View>
      <View style={styles.roleCopy}>
        <Text style={[styles.roleTitle, { color: colors.foreground }]}>
          {isStudent ? 'Sou aluno' : 'Sou professor'}
        </Text>
        <Text style={[styles.roleDescription, { color: colors.mutedForeground }]}>
          {isStudent ? 'Aprenda inglês com seus interesses' : 'Acompanhe turmas e evolução'}
        </Text>
      </View>
      <Ionicons
        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
        size={22}
        color={selected ? colors.primary : colors.mutedForeground}
      />
    </Pressable>
  );
}

export function InterestPicker({
  selected,
  onToggle,
}: {
  selected: InterestId[];
  onToggle: (interest: InterestId) => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.interestGrid}>
      {INTERESTS.map((interest) => {
        const active = selected.includes(interest.id);
        return (
          <Pressable
            key={interest.id}
            onPress={() => onToggle(interest.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: active }}
            style={[
              styles.interestChoice,
              {
                backgroundColor: active ? colors.secondary : colors.input,
                borderColor: active ? colors.primary : colors.border,
              },
            ]}
          >
            <Ionicons
              name={interest.icon as keyof typeof Ionicons.glyphMap}
              size={17}
              color={active ? colors.primary : colors.mutedForeground}
            />
            <Text style={[styles.interestLabel, { color: active ? colors.primary : colors.foreground }]}>
              {interest.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function InlineNotice({ children }: { children: ReactNode }) {
  const colors = useColors();
  return (
    <View style={[styles.notice, { backgroundColor: colors.destructive + '18', borderColor: colors.destructive + '50' }]}>
      <Ionicons name="information-circle-outline" size={18} color={colors.destructive} />
      <Text style={[styles.noticeText, { color: colors.destructive }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  scene: { ...StyleSheet.absoluteFill, height: 255 },
  sceneShade: { ...StyleSheet.absoluteFill, opacity: 0.76 },
  authContent: { paddingHorizontal: 20, minHeight: '100%' },
  brand: { alignItems: 'center', marginBottom: 24 },
  brandIcon: {
    width: 72,
    height: 72,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mascot: { width: 67, height: 67 },
  brandName: { fontFamily: 'Inter_700Bold', fontSize: 26, marginTop: 10, letterSpacing: -0.7 },
  brandCaption: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 4, textAlign: 'center' },
  card: { borderWidth: 1, borderRadius: 25, padding: 20 },
  titleBlock: { marginBottom: 20 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 25, letterSpacing: -0.5 },
  description: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginTop: 7 },
  inputGroup: { marginBottom: 14 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 12, marginBottom: 7 },
  input: {
    minHeight: 51,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  error: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 5, lineHeight: 15 },
  button: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingHorizontal: 16,
    marginTop: 5,
  },
  buttonText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  linkPrefix: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  linkLabel: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  roleChoice: {
    minHeight: 78,
    borderWidth: 1,
    borderRadius: 18,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 10,
  },
  roleIcon: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  roleCopy: { flex: 1 },
  roleTitle: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  roleDescription: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 3 },
  interestGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  interestChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 11,
    borderRadius: 13,
    borderWidth: 1,
  },
  interestLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  notice: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 11,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  noticeText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17 },
});