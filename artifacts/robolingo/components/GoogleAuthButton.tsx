import React, { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { useSSO } from '@clerk/expo';
import { AuthButton, InlineNotice } from './AuthUI';

WebBrowser.maybeCompleteAuthSession();

export function GoogleAuthButton({ onError }: { onError: (message: string) => void }) {
  const router = useRouter();
  const { startSSOFlow } = useSSO();

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const handleGoogle = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri({ scheme: 'robolingo' }),
      });

      if (!createdSessionId || !setActive) {
        onError('O Google pediu uma etapa extra. Tente novamente ou use e-mail e senha.');
        return;
      }

      await setActive({
        session: createdSessionId,
        navigate: async () => {
          router.replace('/');
        },
      });
    } catch {
      onError('Não foi possível entrar com Google agora. Tente novamente.');
    }
  }, [onError, router, startSSOFlow]);

  return <AuthButton label="Continuar com Google" secondary icon="logo-google" onPress={handleGoogle} />;
}

export function AuthError({ message }: { message?: string }) {
  return message ? <InlineNotice>{message}</InlineNotice> : null;
}