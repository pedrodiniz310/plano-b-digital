import React from 'react';
import { radii, spacing } from '../../theme/tokens';
import { PressableFeedback } from '../../components/PressableFeedback';
import { IconButton } from '../../components/IconButton';
import { ProgressBar } from '../../components/ProgressBar';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { EmergencyAction } from '../../content/emergency';
import { allActions, planFor } from '../../lib/emergency';
import type { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../state/store';
import { Icon } from '../../theme/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { clockTime, scenarioTitle } from './format';

type Props = NativeStackScreenProps<RootStackParamList, 'EmergencyRun'>;

export function EmergencyRunScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const incident = useAppStore((s) => s.activeIncident);
  const completeAction = useAppStore((s) => s.completeAction);
  const finishIncident = useAppStore((s) => s.finishIncident);
  if (!incident) {
    return <View style={[styles.empty, { backgroundColor: theme.colors.surface }]}><Text style={{ color: theme.colors.text }}>Nenhum atendimento em andamento.</Text><PressableFeedback accessibilityRole="button" onPress={() => navigation.replace('EmergencyPick')} style={styles.emptyButton}><Text style={{ color: theme.colors.blueInk }}>Escolher situação</Text></PressableFeedback></View>;
  }

  const plan = planFor(incident.scenarioId);
  const total = allActions(plan).length;
  const completed = Object.keys(incident.actions).length;
  const groups: { label: string; sub: string; actions: EmergencyAction[] }[] = [
    { label: 'Agora', sub: 'primeiros minutos', actions: plan.now },
    { label: 'Em seguida', sub: 'primeiras horas', actions: plan.next },
    { label: 'Depois', sub: 'primeiros dias', actions: plan.later },
  ];

  function close() {
    Alert.alert('Encerrar atendimento?', 'O relatório ficará disponível mesmo sem conexão.', [
      { text: 'Continuar atendimento', style: 'cancel' },
      { text: 'Encerrar e gerar relatório', onPress: () => { finishIncident(new Date().toISOString()); navigation.replace('Report'); } },
    ]);
  }

  return (
    <ScrollView style={{ backgroundColor: theme.colors.surface }} contentContainerStyle={{ paddingHorizontal: theme.spacing.marginXIncident, paddingTop: Math.max(insets.top + 14, 44), paddingBottom: insets.bottom + 32 }}>
      <View style={styles.header}>
        <IconButton glyph="back" accessibilityLabel="Sair do atendimento e continuar depois" onPress={() => navigation.navigate('MainTabs')} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.ink(theme.colors.red), fontFamily: theme.typography.sectionLabel.family, fontSize: theme.typography.micro.size * theme.fontScale, letterSpacing: 1.5 }}>Atendimento · início {clockTime(incident.startedAtServer ?? incident.startedAtLocal)}</Text>
          <Text style={{ color: theme.colors.text, fontFamily: theme.typography.sectionTitle.family, fontSize: theme.typography.compactHeading.size * theme.fontScale, marginTop: 4 }}>{scenarioTitle(incident.scenarioId)}</Text>
        </View>
      </View>

      <View style={[styles.progressCard, { backgroundColor: theme.colors.bg, borderColor: theme.colors.border }]}>
        <View style={styles.progressLabels}><Text style={{ color: theme.colors.text, fontSize: theme.typography.secondary.size * theme.fontScale }}>Progresso do atendimento</Text><Text style={{ color: theme.ink(theme.colors.green), fontWeight: '600', fontSize: theme.typography.secondary.size * theme.fontScale }}>{completed}/{total}</Text></View>
        <ProgressBar value={completed} max={total} color={theme.colors.green} size="incident" />
      </View>

      {groups.map((group) => (
        <View key={group.label} style={styles.group}>
          <View style={styles.groupHeading}><Text style={{ color: theme.colors.text, fontFamily: theme.typography.listItem.family, fontSize: theme.typography.body.size * theme.fontScale }}>{group.label}</Text><Text style={{ color: theme.colors.text2, fontSize: theme.typography.small.size * theme.fontScale }}>{group.sub}</Text></View>
          {group.actions.map((action) => {
            const done = incident.actions[action.id];
            return <PressableFeedback key={action.id} accessibilityRole="checkbox" accessibilityLabel={action.title} accessibilityState={{ checked: !!done, disabled: !!done }} disabled={!!done} onPress={() => completeAction(action.id, new Date().toISOString())} style={[styles.action, { backgroundColor: theme.colors.bg, borderColor: done ? theme.colors.green : theme.colors.border }]}>
              <View style={[styles.checkbox, { backgroundColor: done ? theme.colors.green : 'transparent', borderColor: done ? theme.colors.green : theme.colors.border }]}>{done && <Icon glyph="check" size={16} color="#fff" />}</View>
              <View style={{ flex: 1 }}><Text style={{ color: theme.colors.text, fontFamily: theme.typography.listItem.family, fontSize: theme.typography.bodySmall.size * theme.fontScale }}>{action.title}</Text><Text style={{ color: theme.colors.text2, fontFamily: theme.typography.secondary.family, fontSize: theme.typography.secondary.size * theme.fontScale, lineHeight: 20 * theme.fontScale, marginTop: 5 }}>{action.how}</Text>{done && <Text style={{ color: theme.ink(theme.colors.green), fontSize: theme.typography.sectionLabel.size * theme.fontScale, marginTop: 8 }}>Concluída às {clockTime(done.completedAt ?? done.clientTimestamp)}{!done.completedAt ? ' · aguardando sincronização' : ''}</Text>}</View>
            </PressableFeedback>;
          })}
        </View>
      ))}

      <View style={styles.footer}>
        <PressableFeedback accessibilityRole="button" accessibilityLabel="Acionar contato de confiança" onPress={() => navigation.navigate('Contact')} style={[styles.footerButton, { borderColor: theme.colors.border }]}><Text style={{ color: theme.colors.text, fontFamily: theme.typography.listItem.family, fontSize: theme.typography.body.size * theme.fontScale }}>Acionar contato de confiança</Text></PressableFeedback>
        <PressableFeedback accessibilityRole="button" accessibilityLabel="Encerrar e gerar relatório" onPress={close} style={[styles.footerButton, { backgroundColor: theme.colors.deep }]}><Text style={{ color: '#fff', fontFamily: theme.typography.listItem.family, fontSize: theme.typography.body.size * theme.fontScale }}>Encerrar e gerar relatório</Text></PressableFeedback>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyButton: { minHeight: 44, justifyContent: 'center', marginTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  progressCard: { padding: spacing.inset, borderWidth: 1, borderRadius: radii.card, marginBottom: 22 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  group: { marginBottom: spacing.blockGap, gap: spacing.listGap },
  groupHeading: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.listGap, marginBottom: 3 },
  action: { flexDirection: 'row', gap: 12, padding: spacing.inset, minHeight: 60, borderRadius: radii.field, borderWidth: 1.5 },
  checkbox: { width: 24, height: 24, borderRadius: radii.checkbox, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  footer: { gap: spacing.listGap, marginTop: 4 },
  footerButton: { minHeight: 56, borderRadius: radii.field, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
});
