import React from 'react';
import { radii, spacing } from '../../theme/tokens';
import { PressableFeedback } from '../../components/PressableFeedback';
import { SectionTitle } from '../../components/SectionTitle';
import { ListRow } from '../../components/ListRow';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
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
import { NOTIFICATIONS } from '../../content/notifications';
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
  const completedSimulationIds = useAppStore((s) => s.completedSimulationIds);
  const hasTrustedContact = useAppStore((s) => s.hasTrustedContact);

  const completedTaskCount = completedTaskIds.length;
  const completedSimulationCount = completedSimulationIds.length;
  const score = readinessScore({ baseScore, completedTaskCount, completedSimulationCount });
  const level = levelOf(score);
  const levelColor = score >= 85 ? theme.colors.green : score >= 70 ? theme.colors.blue : score >= 40 ? theme.colors.amber : theme.colors.red;
  const points = totalPoints({
    assessmentDone: baseScore !== null,
    completedTaskCount,
    hasTrustedContact,
    completedSimulationCount,
  });
  const pendingTasks = TASKS.filter((task) => !completedTaskIds.includes(task.id)).slice(0, 3);
  const notificationCount = NOTIFICATIONS.filter((item) => item.id !== 'n2' || !hasTrustedContact).length;

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
        <Text style={{ fontSize: theme.typography.compactTitle.size * theme.fontScale, color: theme.colors.text, fontFamily: theme.typography.screenTitle.family }}>
          {greeting()}, {user?.name ?? 'visitante'}
        </Text>
        <PressableFeedback accessibilityRole="button" accessibilityLabel="Abrir notificações" onPress={() => navigation.navigate('Notifications')} style={styles.bell}>
          <Icon glyph="bell" size={22} color={theme.colors.text2} />
          {notificationCount > 0 ? <View style={[styles.notificationCount, { backgroundColor: theme.colors.red, borderColor: theme.colors.surface }]}><Text style={{ color: theme.colors.onDeep, fontFamily: theme.typography.micro.family, fontSize: theme.typography.micro.size * theme.fontScale, lineHeight: 13 * theme.fontScale }}>{notificationCount}</Text></View> : null}
        </PressableFeedback>
      </View>

      <View style={[styles.readinessCard, { backgroundColor: theme.colors.deep }]}>
        <View style={styles.readinessRing} accessible accessibilityLabel={`Pontuação de prontidão: ${score} de 100`}>
          <Svg width={92} height={92} style={styles.readinessRingSvg}>
            <Circle cx={46} cy={46} r={34} stroke={theme.colors.onDeepBorder} strokeWidth={9} fill="none" />
            <Circle cx={46} cy={46} r={34} stroke={theme.colors.green} strokeWidth={9} strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 34}`} strokeDashoffset={2 * Math.PI * 34 * (1 - score / 100)} transform="rotate(-90 46 46)" fill="none" />
          </Svg>
          <Text style={[styles.readinessScore, { fontSize: theme.typography.cardTitle.size * theme.fontScale }]}>{score}</Text>
        </View>
        <View style={styles.readinessMeta}>
          <Text style={[styles.readinessLevel, { fontSize: theme.typography.bodySmall.size * theme.fontScale, color: levelColor }]}>{level.label}</Text>
          <Text style={{ color: theme.colors.onDeepMuted, fontSize: theme.typography.secondary.size * theme.fontScale }}>{completedTaskCount}/{TASKS.length} tarefas</Text>
          <Text style={{ color: theme.colors.onDeepMuted, fontSize: theme.typography.secondary.size * theme.fontScale }}>{points} pontos</Text>
        </View>
      </View>

      {baseScore === null ? <Button label="Iniciar teste" onPress={() => navigation.navigate('Quiz')} /> : null}

      <PressableFeedback
        accessibilityRole="button"
        accessibilityLabel="Preciso de ajuda agora — Modo Emergência"
        onPress={() => navigation.navigate('EmergencyPick')}
        style={[styles.emergencyButton, { backgroundColor: theme.colors.dangerTint, borderColor: theme.colors.red }]}
      >
        <Icon glyph="alert" size={18} color={theme.colors.red} />
        <Text style={[styles.emergencyText, { fontSize: theme.typography.bodySmall.size * theme.fontScale, color: theme.ink(theme.colors.red) }]}>Preciso de ajuda agora — Modo Emergência</Text>
      </PressableFeedback>

      <SectionTitle>PRÓXIMAS TAREFAS</SectionTitle>
      <View style={styles.taskList}>
        {pendingTasks.map((task) => {
          const category = PLAN_CATEGORIES.find((c) => c.id === task.planCategoryId);
          return (
            <ListRow
              key={task.id}
              accessibilityRole="button"
              accessibilityLabel={task.title}
              onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
              style={styles.taskRow}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.taskTitle, { fontSize: theme.typography.body.size * theme.fontScale, color: theme.colors.text }]}>{task.title}</Text>
                <Text style={[styles.taskMeta, { fontSize: theme.typography.small.size * theme.fontScale, color: theme.colors.text2 }]}>{task.minutes} min · {category?.name}</Text>
              </View>
            </ListRow>
          );
        })}
      </View>

      <SectionTitle>ACESSO RÁPIDO</SectionTitle>
      <View style={styles.grid}>
        {quickAccess.map((item) => (
          <PressableFeedback
            key={item.label}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={item.onPress}
            style={[styles.gridItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          >
            <Icon glyph={item.glyph} size={20} color={theme.colors.blue} />
            <Text style={[styles.gridLabel, { fontSize: theme.typography.secondary.size * theme.fontScale, color: theme.colors.text }]}>{item.label}</Text>
          </PressableFeedback>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bell: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  notificationCount: { position: 'absolute', top: 2, right: 2, minWidth: 18, height: 18, borderRadius: radii.pill, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  readinessCard: { borderRadius: radii.heroCard, padding: spacing.heroInset, flexDirection: 'row', alignItems: 'center', gap: 20 },
  readinessRing: { width: 92, height: 92, alignItems: 'center', justifyContent: 'center' },
  readinessRingSvg: { position: 'absolute' },
  readinessScore: { fontWeight: '600', color: '#fff', letterSpacing: -1.5 },
  readinessLevel: { fontWeight: '600', marginTop: 2 },
  readinessMeta: { flex: 1, alignItems: 'flex-start', gap: 4 },
  emergencyButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.listGap, padding: spacing.inset, borderRadius: radii.card, borderWidth: 1 },
  emergencyText: { fontWeight: '600', flex: 1 },
  taskList: { gap: spacing.listGap },
  taskRow: { padding: spacing.compactInset },
  taskTitle: { fontWeight: '500' },
  taskMeta: { marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '47%', padding: spacing.inset, borderRadius: radii.card, borderWidth: 1, gap: 8 },
  gridLabel: { fontWeight: '500' },
});
