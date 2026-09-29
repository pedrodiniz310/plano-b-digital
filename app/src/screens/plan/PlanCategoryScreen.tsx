import React from 'react';
import { radii, spacing } from '../../theme/tokens';
import { PressableFeedback } from '../../components/PressableFeedback';
import { IconButton } from '../../components/IconButton';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PLAN_CATEGORIES, TASKS } from '../../content/plan';
import type { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../state/store';
import { Icon } from '../../theme/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { toggleTask } from './toggleTask';

type Props = NativeStackScreenProps<RootStackParamList, 'PlanCategory'>;

export function PlanCategoryScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const completedTaskIds = useAppStore((s) => s.completedTaskIds);
  const category = PLAN_CATEGORIES.find((item) => item.id === route.params.categoryId);
  if (!category) return null;
  const tasks = TASKS.filter((task) => task.planCategoryId === category.id);
  const done = tasks.filter((task) => completedTaskIds.includes(task.id)).length;

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.bg }}
      contentContainerStyle={{ paddingHorizontal: theme.spacing.marginX, paddingTop: Math.max(theme.spacing.screenTop, insets.top + 16), paddingBottom: Math.max(34, insets.bottom + 20) }}
    >
      <IconButton glyph="back" accessibilityLabel="Voltar ao plano" onPress={() => navigation.goBack()} style={styles.back} />
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: theme.colors.tint }]}>
          <Icon glyph={category.glyph} size={22} color={theme.colors.blueInk} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.text, fontFamily: theme.typography.sectionTitle.family, fontSize: theme.typography.sectionTitle.size * theme.fontScale }}>{category.name}</Text>
          <Text style={{ color: theme.colors.text2, fontFamily: theme.typography.secondary.family, fontSize: theme.typography.secondary.size * theme.fontScale, marginTop: 4 }}>{done} de {tasks.length} tarefas concluídas</Text>
        </View>
      </View>
      <View style={styles.tasks}>
        {tasks.map((task) => {
          const checked = completedTaskIds.includes(task.id);
          return (
            <View key={task.id} style={[styles.taskRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <PressableFeedback
                accessibilityRole="checkbox"
                accessibilityLabel={task.title}
                accessibilityState={{ checked }}
                onPress={() => toggleTask(task.id, !checked)}
                style={styles.checkboxTarget}
              >
                <View style={[styles.checkbox, { borderColor: checked ? theme.colors.blue : theme.colors.border, backgroundColor: checked ? theme.colors.blue : 'transparent' }]}>
                  {checked ? <Icon glyph="check" size={15} color="#fff" /> : null}
                </View>
              </PressableFeedback>
              <PressableFeedback
                accessibilityRole="button"
                accessibilityLabel={`${task.title}, ${task.minutes} min, toque para ver os passos`}
                onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
                style={styles.taskBody}
              >
                <Text style={{ color: checked ? theme.colors.text2 : theme.colors.text, fontFamily: theme.typography.listItem.family, fontSize: theme.typography.bodySmall.size * theme.fontScale, lineHeight: 20 * theme.fontScale, textDecorationLine: checked ? 'line-through' : 'none' }}>{task.title}</Text>
                <Text style={{ color: theme.colors.text2, fontFamily: theme.typography.secondary.family, fontSize: theme.typography.small.size * theme.fontScale, marginTop: 3 }}>{task.minutes} min · toque para ver os passos</Text>
              </PressableFeedback>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  back: { marginBottom: 22 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 22 },
  headerIcon: { width: 46, height: 46, borderRadius: radii.iconSquare, alignItems: 'center', justifyContent: 'center' },
  tasks: { gap: spacing.listGap },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, borderRadius: radii.card, borderWidth: 1, minHeight: 74 },
  checkboxTarget: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  checkbox: { width: 24, height: 24, borderRadius: radii.checkbox, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  taskBody: { flex: 1, minHeight: 54, justifyContent: 'center', paddingVertical: 8, paddingRight: 8 },
});
