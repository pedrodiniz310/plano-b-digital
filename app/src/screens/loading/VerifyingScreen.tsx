import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeProvider';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Verifying'>;

const DURATION_MS = 1400;

export function VerifyingScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const label = route.params?.label ?? 'Carregando';

  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('MainTabs'), DURATION_MS);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <ActivityIndicator size={62 > 48 ? 'large' : 'small'} color={theme.colors.blue} />
      <Text style={[styles.label, { color: theme.colors.text, fontFamily: theme.typography.sectionTitle.family }]}>
        {label}
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.text2, fontFamily: theme.typography.secondary.family }]}>
        Preparando seu ambiente local
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  label: { fontSize: 18, textAlign: 'center' },
  subtitle: { fontSize: 13, textAlign: 'center' },
});
