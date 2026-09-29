import React from 'react';
import { radii, spacing } from '../../theme/tokens';
import { PressableFeedback } from '../../components/PressableFeedback';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { TASKS } from '../../content/plan';
import type { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../state/store';
import { Icon } from '../../theme/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { toggleTask } from './toggleTask';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

export function TaskDetailScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const completedTaskIds = useAppStore((s) => s.completedTaskIds);
  const task = TASKS.find((item) => item.id === route.params.taskId);
  if (!task) return null;
  const completed = completedTaskIds.includes(task.id);

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.surface }}
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: Math.max(20, insets.top + 12), paddingBottom: Math.max(32, insets.bottom + 20) }}
    >
      <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
      <View style={styles.header}>
        <Text style={{ flex: 1, color: theme.colors.text, fontFamily: theme.typography.sectionTitle.family, fontSize: theme.typography.sectionTitle.size * theme.fontScale, lineHeight: 25 * theme.fontScale }}>{task.title}</Text>
        <PressableFeedback accessibilityRole="button" accessibilityLabel="Fechar" onPress={() => navigation.goBack()} style={[styles.close, { borderColor: theme.colors.border }]}>
          <Text style={{ color: theme.colors.text2, fontSize: theme.typography.cardTitle.size * theme.fontScale, lineHeight: 28 * theme.fontScale }}>×</Text>
        </PressableFeedback>
      </View>

      <View style={styles.blocks}>
        <View style={[styles.infoBlock, { backgroundColor: theme.colors.tint }]}>
          <Icon glyph="shield" size={18} color={theme.colors.blueInk} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.blockLabel, { color: theme.colors.blueInk, fontSize: theme.typography.sectionLabel.size * theme.fontScale }]}>POR QUE IMPORTA</Text>
            <Text style={{ color: theme.colors.text, fontFamily: theme.typography.body.family, fontSize: theme.typography.bodySmall.size * theme.fontScale, lineHeight: 21 * theme.fontScale }}>{task.why}</Text>
          </View>
        </View>
        <View style={[styles.infoBlock, { backgroundColor: theme.colors.soft, borderColor: theme.colors.amber, borderWidth: 1 }]}>
          <Icon glyph="alert" size={18} color={theme.ink(theme.colors.amber)} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.blockLabel, { color: theme.ink(theme.colors.amber), fontSize: theme.typography.sectionLabel.size * theme.fontScale }]}>RISCO SE FICAR DE FORA</Text>
            <Text style={{ color: theme.colors.text, fontFamily: theme.typography.body.family, fontSize: theme.typography.bodySmall.size * theme.fontScale, lineHeight: 21 * theme.fontScale }}>{task.risk}</Text>
          </View>
        </View>

        <View>
          <Text style={[styles.stepsLabel, { color: theme.colors.text2, fontSize: theme.typography.sectionLabel.size * theme.fontScale }]}>COMO FAZER · {task.minutes} MIN</Text>
          <View style={styles.steps}>
            {task.steps.map((step, index) => (
              <View key={step} style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: theme.colors.soft }]}>
                  <Text style={{ color: theme.colors.text, fontSize: theme.typography.small.size * theme.fontScale, fontWeight: '600' }}>{index + 1}</Text>
                </View>
                <Text style={{ flex: 1, color: theme.colors.text, fontFamily: theme.typography.body.family, fontSize: theme.typography.bodySmall.size * theme.fontScale, lineHeight: 21 * theme.fontScale }}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        <Button label={completed ? 'Reabrir tarefa' : 'Marcar como concluída'} variant={completed ? 'secondary' : 'primary'} onPress={() => toggleTask(task.id, !completed)} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  handle: { width: 44, height: 4, borderRadius: radii.pill, alignSelf: 'center', marginBottom: 18 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 20 },
  close: { width: 44, height: 44, borderRadius: radii.iconSquare, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  blocks: { gap: 16 },
  infoBlock: { flexDirection: 'row', gap: spacing.listGap, padding: 15, borderRadius: radii.iconSquare },
  blockLabel: { fontWeight: '600', letterSpacing: 1.5, marginBottom: 5 },
  stepsLabel: { fontWeight: '600', letterSpacing: 2, marginBottom: 12 },
  steps: { gap: spacing.listGap },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepNumber: { width: 24, height: 24, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
});
