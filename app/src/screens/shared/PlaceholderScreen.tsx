import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Stub roteável pras telas que ainda não têm UI real (marcos 2-7 do plano em
 * docs/decisions/). Existe pra a navegação inteira já funcionar desde o
 * marco 1 — cada tela vira código de verdade sem tocar em RootNavigator.
 */
export function PlaceholderScreen({ route }: { route: RouteProp<Record<string, object | undefined>, string> }) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <Text style={{ fontSize: 22 * theme.fontScale, color: theme.colors.text, fontFamily: theme.typography.screenTitle.family }}>
        {route.name}
      </Text>
      <Text style={[styles.subtitle, { fontSize: 14 * theme.fontScale, color: theme.colors.text2, fontFamily: theme.typography.body.family }]}>
        Tela em construção — chega num marco seguinte do plano.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 26, gap: 8 },
  subtitle: { textAlign: 'center' },
});
