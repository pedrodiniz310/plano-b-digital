import React, { useEffect } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
import { syncOutbox } from './src/state/syncIncidents';
import { useAppStore } from './src/state/store';
import type { RootStackParamList } from './src/navigation/types';

const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function App() {
  useEffect(() => {
    const unsubscribeStore = useAppStore.subscribe((state, previous) => {
      if (state.outbox.length > previous.outbox.length) void syncOutbox();
      // Saída manual ou sessão expirada: qualquer tela logada volta pro login.
      if (previous.user && !state.user && navigationRef.isReady()) {
        navigationRef.reset({ index: 0, routes: [{ name: 'Auth', params: { mode: 'login' } }] });
      }
    });
    const unsubscribeHydration = useAppStore.persist.onFinishHydration(() => { void syncOutbox(); });
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') void syncOutbox();
    });
    void syncOutbox();
    return () => { unsubscribeStore(); unsubscribeHydration(); appState.remove(); };
  }, []);
  const [fontsLoaded] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F9FC' }}>
        <ActivityIndicator color="#246BFD" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer ref={navigationRef}>
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
