import { useSignUp } from '@clerk/expo';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  AuthBrand,
  AuthButton,
  AuthCard,
  AuthInput,
  AuthLink,
  AuthShell,
  AuthTitle,
  InterestPicker,
  RoleChoice,
} from '@/components/AuthUI';
import { AuthError, GoogleAuthButton } from '@/components/GoogleAuthButton';
import { AccountRole, InterestId, useAppState } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function SignUpScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();
  const { setProfile } = useAppState();
  const [name, setName] = useState('');
  const [role, setRole] = useState<AccountRole>('student');
  const [themes, setThemes] = useState<InterestId[]>(['games', 'futebol']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [verificationStarted, setVerificationStarted] = useState(false);
  const isLoading = fetchStatus === 'fetching';

  const toggleTheme = (theme: InterestId) => {
    setThemes((current) =>
      current.includes(theme) ? current.filter((item) => item !== theme) : [...current, theme],
    );
  };

  const saveProfileChoice = () => {
    setProfile({
      role,
      name,
      selectedThemes: themes.length > 0 ? themes : ['games'],
    });
  };

  const finishSignUp = async () => {
    await signUp.finalize({
      navigate: async () => {
        router.replace('/');
      },
    });
  };

  const handleSubmit = async () => {
    setMessage('');
    saveProfileChoice();
    const result = await signUp.password({
      emailAddress: email.trim(),
      password,
    });
    if (result.error) {
      setMessage(result.error.message ?? 'Confira seus dados e tente novamente.');
      return;
    }
    await signUp.verifications.sendEmailCode();
    setVerificationStarted(true);
  };

  const handleVerify = async () => {
    setMessage('');
    const result = await signUp.verifications.verifyEmailCode({ code: code.trim() });
    if (result.error) {
      setMessage(result.error.message ?? 'Código inválido. Tente novamente.');
      return;
    }
    if (signUp.status === 'complete') {
      await finishSignUp();
    }
  };

  return (
    <AuthShell>
      <AuthBrand />
      <AuthCard>
        <AuthTitle
          title={verificationStarted ? 'Confirme seu e-mail' : 'Crie seu perfil'}
          description={
            verificationStarted
              ? `Digite o código que enviamos para ${email}.`
              : 'Escolha seu caminho e personalize as missões desde o primeiro dia.'
          }
        />
        <AuthError
          message={
            message ||
            errors.fields.emailAddress?.message ||
            errors.fields.password?.message ||
            errors.fields.code?.message
          }
        />
        {verificationStarted ? (
          <>
            <AuthInput
              label="Código de verificação"
              value={code}
              onChangeText={setCode}
              placeholder="Digite o código recebido"
              keyboardType="number-pad"
              autoFocus
            />
            <AuthButton label="Confirmar e continuar" onPress={handleVerify} disabled={!code || isLoading} />
            <AuthButton
              label="Enviar outro código"
              secondary
              onPress={() => signUp.verifications.sendEmailCode()}
              disabled={isLoading}
            />
          </>
        ) : (
          <>
            <AuthInput
              label="Como podemos chamar você?"
              value={name}
              onChangeText={setName}
              placeholder="Seu nome"
              autoCapitalize="words"
              textContentType="name"
            />
            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Qual é o seu perfil?</Text>
            <RoleChoice role="student" selected={role === 'student'} onPress={() => setRole('student')} />
            <RoleChoice role="teacher" selected={role === 'teacher'} onPress={() => setRole('teacher')} />
            {role === 'student' ? (
              <>
                <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
                  O que você curte? <Text style={{ color: colors.mutedForeground }}>(pode escolher mais de um)</Text>
                </Text>
                <InterestPicker selected={themes} onToggle={toggleTheme} />
              </>
            ) : null}
            <View style={styles.formGap} />
            <AuthInput
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="voce@exemplo.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            <AuthInput
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="Crie uma senha segura"
              secureTextEntry
              textContentType="newPassword"
            />
            <AuthButton
              label="Criar conta"
              onPress={handleSubmit}
              disabled={!name || !email || !password || isLoading}
              icon="arrow-forward"
            />
            <View style={styles.divider}>
              <View style={[styles.line, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>ou</Text>
              <View style={[styles.line, { backgroundColor: colors.border }]} />
            </View>
            <GoogleAuthButton
              onError={setMessage}
            />
            <View nativeID="clerk-captcha" />
          </>
        )}
        <AuthLink
          prefix="Já tem uma conta?"
          label="Entrar"
          onPress={() => router.replace('/(auth)/sign-in')}
        />
      </AuthCard>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { fontFamily: 'Inter_700Bold', fontSize: 13, marginTop: 5, marginBottom: 10 },
  formGap: { height: 8 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  line: { flex: 1, height: 1 },
  dividerText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
});