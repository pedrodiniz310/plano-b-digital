import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/splash/SplashScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { AuthScreen } from '../screens/auth/AuthScreen';
import { VerifyingScreen } from '../screens/loading/VerifyingScreen';
import { ReadyScreen } from '../screens/assessment/ReadyScreen';
import { QuizScreen } from '../screens/assessment/QuizScreen';
import { ProcessingScreen } from '../screens/assessment/ProcessingScreen';
import { ResultScreen } from '../screens/assessment/ResultScreen';
import { PlanCategoryScreen } from '../screens/plan/PlanCategoryScreen';
import { TaskDetailScreen } from '../screens/plan/TaskDetailScreen';
import { PlaceholderScreen } from '../screens/shared/PlaceholderScreen';
import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Recover" component={PlaceholderScreen} />
      <Stack.Screen name="Verifying" component={VerifyingScreen} />
      <Stack.Screen name="Ready" component={ReadyScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="Processing" component={ProcessingScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="PlanCategory" component={PlanCategoryScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Vault" component={PlaceholderScreen} />
      <Stack.Screen name="Contact" component={PlaceholderScreen} />
      <Stack.Screen name="FamilyProtocol" component={PlaceholderScreen} />
      <Stack.Screen name="SimulationPlay" component={PlaceholderScreen} />
      <Stack.Screen name="SimulationResult" component={PlaceholderScreen} />
      <Stack.Screen name="EmergencyPick" component={PlaceholderScreen} />
      <Stack.Screen name="EmergencyRun" component={PlaceholderScreen} />
      <Stack.Screen name="Report" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
}
