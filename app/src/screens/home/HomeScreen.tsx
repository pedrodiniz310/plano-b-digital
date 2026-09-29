import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon } from '../../theme/Icon';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppStore } from '../../state/store';
import { readinessScore, levelOf } from '../../lib/scoring';
import { totalPoints } from '../../lib/gamification';
import { PLAN_CATEGORIES, TASKS } from '../../content/plan';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function HomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const user = useAppStore((s) => s.user);
  const baseScore = useAppStore((s) => s.baseScore);
  const completedTaskIds = useAppStore((s) => s.completedTaskIds);
  const hasTrustedContact = useAppStore((s) => s.hasTrustedContact);

  const completedTaskCount = completedTaskIds.length;
  const completedSimulationCount = 0;
  const score = readinessScore({ baseScore, completedTaskCount, completedSimulationCount });
  const level = levelOf(score);
  const points = totalPoints({
    assessmentDone: baseScore !== null,
    completedTaskCount,
    hasTrustedContact,
    completedSimulationCount,
  });
  const pendingTasks = TASKS.filter((task) => !completedTaskIds.includes(task.id)).slice(0, 3);

  const quickAccess: { label: string; glyph: 'lock' | 'users' | 'play' | 'doc'; onPress: () => void }[] = [
    { label: 'Cofre', glyph: 'lock', onPress: () => navigation.navigate('Vault') },
    { label: 'Contato', glyph: 'users', onPress: () => navigation.navigate('Contact') },
    { label: 'Simulações', glyph: 'play', onPress: () => navigation.navigate('Simulations') },
    { label: 'Relatório', glyph: 'doc', onPress: () => navigation.navigate('Report') },
  ];

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.bg }}
      contentContainerStyle={[
        styles.container,
        { paddingHorizontal: theme.spacing.marginX, paddingTop: theme.spacing.screenTop, paddingBottom: theme.spacing.tabBarReserve },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.hello, { color: theme.colors.text, fontFamily: theme.typography.screenTitle.family }]}>
          {greeting()}, {user?.name ?? 'visitante'}
        </Text>
        <Icon glyph="bell" size={22} color={theme.colors.text2} />
      </View>

      <View style={[styles.readinessCard, { backgroundColor: theme.colors.deep }]}>
        <View>
          <Text style={styles.readinessScore}>{score}</Text>
          <Text style={[styles.readinessLevel, { color: level.color }]}>{level.label}</Text>
        </View>
        <View style={styles.readinessMeta}>
          <Text style={styles.readinessMetaText}>{completedTaskCount}/{TASKS.length} tarefas</Text>
          <Text style={styles.readinessMetaText}>{points} pontos</Text>
        </View>
      </View>

      {baseScore === null ? <Button label="Iniciar teste" onPress={() => navigation.navigate('Quiz')} /> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Preciso de ajuda agora — Modo Emergência"
        onPress={() => navigation.navigate('EmergencyPick')}
        style={[styles.emergencyButton, { backgroundColor: 'rgba(229,72,77,.12)', borderColor: theme.colors.red }]}
      >
        <Icon glyph="alert" size={18} color={theme.colors.red} />
        <Text style={[styles.emergencyText, { color: theme.colors.red }]}>Preciso de ajuda agora — Modo Emergência</Text>
      </Pressable>

      <Text style={[styles.sectionLabel, { color: theme.colors.text2 }]}>PRÓXIMAS TAREFAS</Text>
      <View style={styles.taskList}>
        {pendingTasks.map((task) => {
          const category = PLAN_CATEGORIES.find((c) => c.id === task.planCategoryId);
          return (
            <Pressable
              key={task.id}
              accessibilityRole="button"
              accessibilityLabel={task.title}
              onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
              style={[styles.taskRow, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.taskTitle, { color: theme.colors.text }]}>{task.title}</Text>
                <Text style={[styles.taskMeta, { color: theme.colors.text2 }]}>{task.minutes} min · {category?.name}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sectionLabel, { color: theme.colors.text2 }]}>ACESSO RÁPIDO</Text>
      <View style={styles.grid}>
        {quickAccess.map((item) => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={item.onPress}
            style={[styles.gridItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          >
            <Icon glyph={item.glyph} size={20} color={theme.colors.blue} />
            <Text style={[styles.gridLabel, { color: theme.colors.text }]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hello: { fontSize: 22 },
  readinessCard: { borderRadius: 20, padding: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  readinessScore: { fontSize: 44, fontWeight: '600', color: '#fff', letterSpacing: -1.5 },
  readinessLevel: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  readinessMeta: { alignItems: 'flex-end', gap: 4 },
  readinessMetaText: { color: 'rgba(255,255,255,.85)', fontSize: 13 },
  emergencyButton: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderRadius: 16, borderWidth: 1 },
  emergencyText: { fontSize: 14, fontWeight: '600', flex: 1 },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1.5 },
  taskList: { gap: 10 },
  taskRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1 },
  taskTitle: { fontSize: 15, fontWeight: '500' },
  taskMeta: { fontSize: 12, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '47%', padding: 16, borderRadius: 16, borderWidth: 1, gap: 8 },
  gridLabel: { fontSize: 13, fontWeight: '500' },
});
