import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import { useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AppProvider, useAppState } from '@/context/AppContext';
import { ClerkLoaded, ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { setAuthTokenGetter, setBaseUrl } from '@workspace/api-client-react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);

const queryClient = new QueryClient();

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const { player, hydrated, profileReady, ensureProfileOwner } = useAppState();

  useEffect(() => {
    setAuthTokenGetter(getToken);
    return () => setAuthTokenGetter(null);
  }, [getToken]);

  useEffect(() => {
    if (isLoaded && isSignedIn && userId && hydrated) {
      ensureProfileOwner(userId);
    }
  }, [ensureProfileOwner, hydrated, isLoaded, isSignedIn, userId]);

  const firstSegment = segments[0];
  const inAuth = firstSegment === '(auth)';
  const onOnboarding = inAuth && segments[1] === 'onboarding';

  useEffect(() => {
    if (!isLoaded || !hydrated || (isSignedIn && !profileReady)) return;
    if (!isSignedIn && !inAuth) {
      router.replace('/welcome');
      return;
    }
    if (isSignedIn && !player.profileRole && !onOnboarding) {
      router.replace('/onboarding');
      return;
    }
    if (isSignedIn && player.profileRole && inAuth && !onOnboarding) {
      router.replace(player.profileRole === 'teacher' ? '/teacher' : '/(tabs)');
    }
  }, [
    hydrated,
    inAuth,
    isLoaded,
    isSignedIn,
    onOnboarding,
    player.profileRole,
    profileReady,
    router,
  ]);

  if (!isLoaded || !hydrated || (isSignedIn && !profileReady)) {
    return (
      <View style={{ flex: 1, backgroundColor: '#061A3B', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#09A9FF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerBackTitle: 'Voltar', headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="mission" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="adventure" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="teacher" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView>
            <KeyboardProvider>
              <ClerkProvider
                publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? ''}
                tokenCache={tokenCache}
                proxyUrl={process.env.EXPO_PUBLIC_CLERK_PROXY_URL || undefined}
              >
                <ClerkLoaded>
                  <AppProvider>
                    <RootLayoutNav />
                  </AppProvider>
                </ClerkLoaded>
              </ClerkProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
