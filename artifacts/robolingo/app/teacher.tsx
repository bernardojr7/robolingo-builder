import { Ionicons } from '@expo/vector-icons';
import { useClerk } from '@clerk/expo';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { IconButton, PrimaryButton, RobotAvatar, Screen, SectionTitle, StatPill, TopBar } from '@/components/RobolingoUI';
import { useAppState } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function TeacherScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signOut } = useClerk();
  const { player } = useAppState();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/welcome');
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
        <StatPill icon="people-outline" value="24" label="alunos" />
        <StatPill icon="checkmark-circle-outline" value="78%" label="participação" tone="accent" />
        <StatPill icon="trending-up-outline" value="+12%" label="evolução" tone="purple" />
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
            Código de entrada · ROB-2026
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={19} color={colors.mutedForeground} />
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

      <PrimaryButton label="Compartilhar código da turma" icon="share-social-outline" onPress={() => undefined} />
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
  actionGrid: { flexDirection: 'row', gap: 9, marginBottom: 20 },
  actionCard: { flex: 1, minHeight: 119, borderWidth: 1, borderRadius: 19, padding: 14 },
  actionLabel: { fontFamily: 'Inter_700Bold', fontSize: 13, marginTop: 12 },
  actionDescription: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4, lineHeight: 15 },
});