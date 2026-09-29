import React, { useEffect, useState } from 'react';
import { radii } from '../../theme/tokens';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useReduceMotion } from '../../components/useReduceMotion';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { Icon } from '../../theme/Icon';
import { useTheme } from '../../theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Processing'>;

const STEPS = ['Analisando suas respostas', 'Identificando riscos prioritários', 'Montando seu Plano B'];

export function ProcessingScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [litCount, setLitCount] = useState(1);
  const reducedMotion = useReduceMotion();

  useEffect(() => {
    const second = setTimeout(() => setLitCount((count) => Math.max(count, 2)), 700);
    const third = setTimeout(() => setLitCount(3), 1400);
    const finish = setTimeout(() => navigation.replace('Result'), 2100);
    return () => {
      clearTimeout(second);
      clearTimeout(third);
      clearTimeout(finish);
    };
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {reducedMotion ? (
        <Icon glyph="check" size={70} color={theme.colors.blue} />
      ) : (
        <ActivityIndicator size={70} color={theme.colors.blue} accessibilityLabel="Processando resultado" />
      )}
      <View style={styles.steps} accessibilityLiveRegion="polite">
        {STEPS.map((label, index) => {
          const visibleCount = reducedMotion ? 3 : litCount;
          const lit = index < visibleCount;
          const done = index < visibleCount - 1;
          return (
            <View key={label} style={styles.step}>
              <View style={[styles.marker, { backgroundColor: done ? theme.colors.green : lit ? theme.colors.blue : theme.colors.soft }]}>
                {done ? <Icon glyph="check" size={14} color="#fff" strokeWidth={3} /> : null}
              </View>
              <Text style={[styles.stepText, { color: lit ? theme.colors.text : theme.colors.text2, fontFamily: theme.typography.body.family, fontSize: theme.typography.body.size * theme.fontScale }]}>{label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 34, paddingHorizontal: 40 },
  steps: { alignSelf: 'stretch', gap: 14 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  marker: { width: 24, height: 24, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  stepText: { flex: 1 },
});
