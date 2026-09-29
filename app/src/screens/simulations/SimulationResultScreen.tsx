import React from 'react';
import { radii, spacing } from '../../theme/tokens';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { ROUBO_LEARNINGS, ROUBO_STEPS, SIMULATIONS } from '../../content/simulations';
import { gradedStepCount, levelOf } from '../../lib/simulation';
import type { RootStackParamList } from '../../navigation/types';
import { Icon } from '../../theme/Icon';
import { useTheme } from '../../theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'SimulationResult'>;

export function SimulationResultScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const simulation = SIMULATIONS.find((item) => item.id === route.params.simulationId);
  if (!simulation) return null;

  const { hits, timeSeconds } = route.params;
  const total = gradedStepCount(ROUBO_STEPS);
  const level = levelOf(hits, total);
  const levelColor = level === 'Excelente resposta' ? theme.colors.green : level === 'Boa resposta' ? theme.colors.amber : theme.colors.red;
  const timeLabel = `${Math.floor(timeSeconds / 60)}:${String(timeSeconds % 60).padStart(2, '0')}`;

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.bg }}
      contentContainerStyle={[styles.container, {
        paddingHorizontal: theme.spacing.marginX,
        paddingTop: Math.max(70, insets.top + 16),
        paddingBottom: Math.max(34, insets.bottom + 20),
      }]}
    >
      <View style={styles.heading}>
        <View style={[styles.checkCircle, { backgroundColor: theme.colors.soft }]}>
          <Icon glyph="check" size={44} color={theme.ink(theme.colors.green)} />
        </View>
        <Text style={{ color: theme.colors.text, fontFamily: theme.typography.screenTitle.family, fontSize: theme.typography.screenTitle.size * theme.fontScale, textAlign: 'center' }}>Simulação concluída</Text>
        <Text style={{ color: theme.ink(levelColor), fontFamily: theme.typography.listItem.family, fontSize: theme.typography.body.size * theme.fontScale }}>{level}</Text>
      </View>

      <View style={styles.metrics}>
        {[
          { value: `${hits}/${total}`, label: 'acertos' },
          { value: timeLabel, label: 'tempo' },
          { value: `+${simulation.points}`, label: 'pontos' },
        ].map((metric) => (
          <View key={metric.label} style={[styles.metric, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={{ color: metric.label === 'pontos' ? theme.ink(theme.colors.green) : theme.colors.text, fontFamily: theme.typography.sectionTitle.family, fontSize: theme.typography.sectionTitle.size * theme.fontScale, textAlign: 'center' }}>{metric.value}</Text>
            <Text style={{ color: theme.colors.text2, fontFamily: theme.typography.secondary.family, fontSize: theme.typography.sectionLabel.size * theme.fontScale, textAlign: 'center', marginTop: 4 }}>{metric.label}</Text>
          </View>
        ))}
      </View>

      <Text style={{ color: theme.colors.text2, fontFamily: theme.typography.sectionLabel.family, fontSize: theme.typography.sectionLabel.size * theme.fontScale, letterSpacing: 1.5, marginBottom: 12 }}>O QUE VOCÊ LEVOU DAQUI</Text>
      <View style={styles.learnings}>
        {ROUBO_LEARNINGS.map((learning) => (
          <View key={learning} style={[styles.learning, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Icon glyph="check" size={16} color={theme.ink(theme.colors.green)} />
            <Text style={{ color: theme.colors.text, fontFamily: theme.typography.body.family, fontSize: theme.typography.bodySmall.size * theme.fontScale, lineHeight: 21 * theme.fontScale, flex: 1 }}>{learning}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button label="Voltar às simulações" onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs', params: { screen: 'Simulations' } }] })} />
        <Button label="Refazer simulação" variant="secondary" onPress={() => navigation.replace('SimulationPlay', { simulationId: simulation.id })} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
  heading: { alignItems: 'center', gap: spacing.listGap },
  checkCircle: { width: 96, height: 96, borderRadius: radii.largeIcon, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  metrics: { flexDirection: 'row', gap: spacing.listGap, marginTop: 26, marginBottom: 28 },
  metric: { flex: 1, minWidth: 0, paddingHorizontal: 4, paddingVertical: spacing.inset, borderRadius: radii.card, borderWidth: 1 },
  learnings: { flex: 1, gap: spacing.listGap },
  learning: { flexDirection: 'row', gap: spacing.listGap, alignItems: 'flex-start', padding: spacing.compactInset, borderRadius: radii.card, borderWidth: 1, minHeight: 50 },
  actions: { gap: spacing.listGap, marginTop: 24 },
});
