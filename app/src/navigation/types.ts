import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Plan: undefined;
  /** Nunca navegado de verdade — `tabPress` é interceptado, ver TabNavigator.tsx. */
  SOS: undefined;
  Simulations: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: { mode?: 'login' | 'signup' } | undefined;
  Recover: undefined;
  Verifying: { label: string } | undefined;
  Ready: undefined;
  Quiz: undefined;
  Processing: undefined;
  Result: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Vault: undefined;
  Contact: undefined;
  FamilyProtocol: undefined;
  SimulationPlay: { simulationId: string };
  SimulationResult: { simulationId: string };
  EmergencyPick: undefined;
  EmergencyRun: { scenarioId: string };
  Report: undefined;
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- padrão oficial de tipagem global do React Navigation.
    interface RootParamList extends RootStackParamList {}
  }
}
