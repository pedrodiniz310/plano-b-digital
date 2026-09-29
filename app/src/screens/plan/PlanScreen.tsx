import React from 'react';
import { radii, spacing } from '../../theme/tokens';
import { PressableFeedback } from '../../components/PressableFeedback';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { ProgressBar } from '../../components/ProgressBar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PLAN_CATEGORIES, TASKS, type Priority } from '../../content/plan';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../state/store';
import { Icon } from '../../theme/Icon';
import { useTheme } from '../../theme/ThemeProvider';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Plan'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function PlanScreen({ navigation }: Props) {
  const theme = useTheme();
  const completedTaskIds = useAppStore((s) => s.completedTaskIds);
  const completed = new Set(completedTaskIds);
  const totalDone = TASKS.filter((task) => completed.has(task.id)).length;
  const percent = Math.round(totalDone / TASKS.length * 100);

  function priorityColor(priority: Priority) {
    if (priority === 'Crítica') return theme.ink(theme.colors.red);
    if (priority === 'Alta') return theme.ink(theme.colors.amber);
    return theme.colors.text2;
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.bg }}
      contentContainerStyle={{ paddingHorizontal: theme.spacing.marginX, paddingTop: theme.spacing.screenTop, paddingBottom: theme.spacing.tabBarReserve }}
    >
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.screenTitle.family, fontSize: theme.typography.screenTitle.size * theme.fontScale }]}>Meu Plano B</Text>
      <Text style={[styles.intro, { color: theme.colors.text2, fontFamily: theme.typography.secondary.family, fontSize: theme.typography.bodySmall.size * theme.fontScale, lineHeight: 22 * theme.fontScale }]}>Organizado por área. Cada tarefa concluída aumenta sua prontidão.</Text>

      <Card style={styles.progressCard}>
        <View style={styles.progressHeading}>
          <Text style={{ color: theme.colors.text, fontFamily: theme.typography.listItem.family, fontSize: theme.typography.bodySmall.size * theme.fontScale }}>Progresso geral</Text>
          <Text style={{ color: theme.colors.blueInk, fontFamily: theme.typography.sectionTitle.family, fontSize: theme.typography.sectionTitle.size * theme.fontScale }}>{percent}%</Text>
        </View>
        <ProgressBar value={percent} max={100} size="overview" />
        <Text style={[styles.progressCaption, { color: theme.colors.text2, fontFamily: theme.typography.secondary.family, fontSize: theme.typography.secondary.size * theme.fontScale }]}>{totalDone} de {TASKS.length} tarefas concluídas</Text>
      </Card>

      <View style={styles.categories}>
        {PLAN_CATEGORIES.map((category) => {
          const tasks = TASKS.filter((task) => task.planCategoryId === category.id);
          const done = tasks.filter((task) => completed.has(task.id)).length;
          return (
            <PressableFeedback
              key={category.id}
              accessibilityRole="button"
              accessibilityLabel={`${category.name}, prioridade ${category.priority}, ${done} de ${tasks.length} tarefas concluídas`}
              onPress={() => navigation.navigate('PlanCategory', { categoryId: category.id })}
              style={[styles.category, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            >
              <View style={[styles.categoryIcon, { backgroundColor: theme.colors.tint }]}>
                <Icon glyph={category.glyph} size={20} color={theme.colors.blueInk} />
              </View>
              <View style={styles.categoryBody}>
                <View style={styles.categoryHeading}>
                  <Text style={{ color: theme.colors.text, fontFamily: theme.typography.listItem.family, fontSize: theme.typography.body.size * theme.fontScale, flexShrink: 1 }}>{category.name}</Text>
                  <Badge label={category.priority} color={priorityColor(category.priority)} glyph="alert" style={styles.badge} />
                </View>
                <View style={styles.categoryProgress}>
                  <ProgressBar value={done} max={tasks.length} style={styles.categoryTrack} />
                  <Text style={{ color: theme.colors.text2, fontSize: theme.typography.small.size * theme.fontScale }}>{done}/{tasks.length}</Text>
                </View>
              </View>
              <View style={{ transform: [{ rotate: '-90deg' }] }}>
                <Icon glyph="down" size={18} color={theme.colors.text2} />
              </View>
            </PressableFeedback>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { letterSpacing: -0.8 },
  intro: { marginTop: 8, marginBottom: 22 },
  progressCard: { padding: 20, marginBottom: spacing.blockGap },
  progressHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  progressCaption: { marginTop: 10 },
  categories: { gap: spacing.listGap },
  category: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: spacing.inset, borderRadius: radii.card, borderWidth: 1, minHeight: 74 },
  categoryIcon: { width: 42, height: 42, borderRadius: radii.iconSquare, alignItems: 'center', justifyContent: 'center' },
  categoryBody: { flex: 1, minWidth: 0 },
  categoryHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 7, paddingVertical: 3 },
  categoryProgress: { flexDirection: 'row', alignItems: 'center', gap: spacing.listGap },
  categoryTrack: { flex: 1 },
});
