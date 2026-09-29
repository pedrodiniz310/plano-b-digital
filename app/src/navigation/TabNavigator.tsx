import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/home/HomeScreen';
import { PlanScreen } from '../screens/plan/PlanScreen';
import { SimulationsScreen } from '../screens/simulations/SimulationsScreen';
import { PlaceholderScreen } from '../screens/shared/PlaceholderScreen';
import { Icon } from '../theme/Icon';
import { useTheme } from '../theme/ThemeProvider';
import type { MainTabParamList, RootStackParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function SosButton() {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Modo Emergência"
      onPress={() => navigation.navigate('EmergencyPick')}
      style={[
        styles.sos,
        { backgroundColor: theme.colors.red, shadowColor: theme.colors.red },
      ]}
    >
      <Text style={styles.sosLabel}>SOS</Text>
    </Pressable>
  );
}

export function TabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.blue,
        tabBarInactiveTintColor: theme.colors.text2,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <Icon glyph="home" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Plan"
        component={PlanScreen}
        options={{
          title: 'Meu Plano',
          tabBarIcon: ({ color, size }) => <Icon glyph="plan" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="SOS"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: () => null,
          tabBarButton: () => <SosButton />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('EmergencyPick');
          },
        })}
      />
      <Tab.Screen
        name="Simulations"
        component={SimulationsScreen}
        options={{
          title: 'Simulações',
          tabBarIcon: ({ color, size }) => <Icon glyph="play" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={PlaceholderScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Icon glyph="user" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  sos: {
    width: 58,
    height: 58,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  sosLabel: { color: '#fff', fontWeight: '700', fontSize: 12, letterSpacing: 0.5 },
});
