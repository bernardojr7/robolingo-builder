import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AuthBrand, AuthButton, AuthCard, AuthShell, AuthTitle } from '@/components/AuthUI';
import { useColors } from '@/hooks/useColors';

export default function WelcomeScreen() {
  const colors = useColors();
  const router = useRouter();

  return (
    <AuthShell>
      <AuthBrand />
      <AuthCard>
        <AuthTitle
          title="Seu inglês começa aqui"
          description="Aprenda com missões rápidas baseadas em futebol, games, música, anime e tudo o que você curte."
        />
        <View style={styles.benefits}>
          {[
            ['flash-outline', 'Missões que cabem no seu dia'],
            ['game-controller-outline', 'Questões ligadas aos seus interesses'],
            ['trophy-outline', 'XP, sequência e recompensas'],
          ].map(([icon, label]) => (
            <View key={label} style={styles.benefit}>
              <View style={[styles.benefitIcon, { backgroundColor: colors.secondary }]}>
                <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={17} color={colors.primary} />
              </View>
              <Text style={[styles.benefitText, { color: colors.foreground }]}>{label}</Text>
            </View>
          ))}
        </View>
        <AuthButton label="Criar minha conta" onPress={() => router.push('/(auth)/sign-up')} />
        <AuthButton
          label="Já tenho uma conta"
          secondary
          onPress={() => router.push('/(auth)/sign-in')}
        />
      </AuthCard>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  benefits: { gap: 12, marginBottom: 20 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  benefitIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  benefitText: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 12 },
});