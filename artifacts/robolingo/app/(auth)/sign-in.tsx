import { useSignIn } from '@clerk/expo';
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
} from '@/components/AuthUI';
import { AuthError, GoogleAuthButton } from '@/components/GoogleAuthButton';
import { useColors } from '@/hooks/useColors';

export default function SignInScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const isLoading = fetchStatus === 'fetching';

  const finishSignIn = async () => {
    await signIn.finalize({
      navigate: async () => {
        router.replace('/');
      },
    });
  };

  const handleSubmit = async () => {
    setMessage('');
    const result = await signIn.password({ emailAddress: email.trim(), password });
    if (result.error) {
      setMessage(result.error.message ?? 'Confira seus dados e tente novamente.');
      return;
    }
    if (signIn.status === 'complete') {
      await finishSignIn();
      return;
    }
    if (signIn.status === 'needs_client_trust') {
      const emailFactor = signIn.supportedSecondFactors.find((factor) => factor.strategy === 'email_code');
      if (emailFactor) {
        await signIn.mfa.sendEmailCode();
        setMessage('Enviamos um código de segurança para seu e-mail.');
      }
      return;
    }
    if (signIn.status === 'needs_second_factor') {
      setMessage('Sua conta pede uma segunda etapa de autenticação que ainda não está disponível nesta tela.');
    }
  };

  const handleVerify = async () => {
    setMessage('');
    const result = await signIn.mfa.verifyEmailCode({ code: code.trim() });
    if (result.error) {
      setMessage(result.error.message ?? 'Código inválido. Tente novamente.');
      return;
    }
    if (signIn.status === 'complete') {
      await finishSignIn();
    }
  };

  const needsCode = signIn.status === 'needs_client_trust';

  return (
    <AuthShell>
      <AuthBrand />
      <AuthCard>
        <AuthTitle
          title="Boas-vindas de volta"
          description="Entre para continuar sua jornada e manter seu progresso."
        />
        <AuthError message={message || errors.fields.identifier?.message || errors.fields.password?.message} />
        {needsCode ? (
          <>
            <AuthInput
              label="Código de segurança"
              value={code}
              onChangeText={setCode}
              placeholder="Digite o código recebido"
              keyboardType="number-pad"
              autoFocus
            />
            <AuthButton label="Verificar e entrar" onPress={handleVerify} disabled={!code || isLoading} />
            <AuthButton label="Voltar para o início" secondary onPress={() => signIn.reset()} />
          </>
        ) : (
          <>
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
              placeholder="Sua senha"
              secureTextEntry
              textContentType="password"
            />
            <AuthButton
              label="Entrar"
              onPress={handleSubmit}
              disabled={!email || !password || isLoading}
              icon="arrow-forward"
            />
            <View style={styles.divider}>
              <View style={[styles.line, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>ou</Text>
              <View style={[styles.line, { backgroundColor: colors.border }]} />
            </View>
            <GoogleAuthButton onError={setMessage} />
          </>
        )}
        <AuthLink
          prefix="Ainda não tem uma conta?"
          label="Criar agora"
          onPress={() => router.replace('/(auth)/sign-up')}
        />
      </AuthCard>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  line: { flex: 1, height: 1 },
  dividerText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
});