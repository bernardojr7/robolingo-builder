import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AuthBrand, AuthButton, AuthCard, AuthInput, AuthShell, AuthTitle, InterestPicker, RoleChoice } from '@/components/AuthUI';
import { AccountRole, InterestId, useAppState } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function OnboardingScreen() {
  const colors = useColors();
  const router = useRouter();
  const { player, setProfile, syncStatus } = useAppState();
  const [name, setName] = useState(player.name === 'Alex' ? '' : player.name);
  const [role, setRole] = useState<AccountRole>('student');
  const [themes, setThemes] = useState<InterestId[]>(player.selectedThemes);
  const [className, setClassName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted && syncStatus === 'synced') {
      router.replace(role === 'teacher' ? '/teacher' : '/(tabs)');
    }
  }, [role, router, submitted, syncStatus]);

  const finish = () => {
    setSubmitted(true);
    setProfile({
      role,
      name,
      selectedThemes: themes.length > 0 ? themes : ['games'],
      teacherClassName: role === 'teacher' ? className : '',
      teacherClassCode: role === 'student' ? classCode : '',
    });
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
            <AuthInput
              label="Código da sua turma"
              value={classCode}
              onChangeText={setClassCode}
              placeholder="Ex.: ROB-A1B2C3"
              autoCapitalize="characters"
              autoCorrect={false}
            />
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
        {syncStatus === 'error' ? (
          <Text style={[styles.error, { color: colors.destructive }]}>
            Não encontramos essa turma. Confira o código e tente novamente.
          </Text>
        ) : null}
        <AuthButton
          label="Entrar no Robolingo"
          onPress={finish}
          disabled={
            !name ||
            (role === 'teacher' && !className) ||
            (role === 'student' && !classCode) ||
            (submitted && syncStatus !== 'error')
          }
        />
      </AuthCard>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: 'Inter_700Bold', fontSize: 13, marginTop: 6, marginBottom: 10 },
  error: { fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 17, marginTop: 8 },
});