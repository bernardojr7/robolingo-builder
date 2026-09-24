import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AuthBrand, AuthButton, AuthCard, AuthInput, AuthShell, AuthTitle, InterestPicker, RoleChoice } from '@/components/AuthUI';
import { AccountRole, InterestId, useAppState } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function OnboardingScreen() {
  const colors = useColors();
  const router = useRouter();
  const { player, setProfile } = useAppState();
  const [name, setName] = useState(player.name === 'Alex' ? '' : player.name);
  const [role, setRole] = useState<AccountRole>('student');
  const [themes, setThemes] = useState<InterestId[]>(player.selectedThemes);
  const [className, setClassName] = useState('');

  const finish = () => {
    setProfile({
      role,
      name,
      selectedThemes: themes.length > 0 ? themes : ['games'],
      teacherClassName: className,
    });
    router.replace(role === 'teacher' ? '/teacher' : '/(tabs)');
  };

  return (
    <AuthShell>
      <AuthBrand />
      <AuthCard>
        <AuthTitle
          title="Vamos personalizar"
          description="Conte só o essencial para o Robolingo preparar a sua primeira experiência."
        />
        <AuthInput
          label="Como podemos chamar você?"
          value={name}
          onChangeText={setName}
          placeholder="Seu nome"
          autoCapitalize="words"
        />
        <Text style={[styles.label, { color: colors.foreground }]}>Escolha sua área</Text>
        <RoleChoice role="student" selected={role === 'student'} onPress={() => setRole('student')} />
        <RoleChoice role="teacher" selected={role === 'teacher'} onPress={() => setRole('teacher')} />
        {role === 'student' ? (
          <>
            <Text style={[styles.label, { color: colors.foreground }]}>Seus interesses</Text>
            <InterestPicker
              selected={themes}
              onToggle={(theme) =>
                setThemes((current) =>
                  current.includes(theme) ? current.filter((item) => item !== theme) : [...current, theme],
                )
              }
            />
          </>
        ) : (
          <AuthInput
            label="Nome da sua primeira turma"
            value={className}
            onChangeText={setClassName}
            placeholder="Ex.: 8º ano B"
          />
        )}
        <AuthButton label="Entrar no Robolingo" onPress={finish} disabled={!name || (role === 'teacher' && !className)} />
      </AuthCard>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: 'Inter_700Bold', fontSize: 13, marginTop: 6, marginBottom: 10 },
});