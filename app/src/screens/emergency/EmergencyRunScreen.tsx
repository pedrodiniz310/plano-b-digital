import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
    return <View style={[styles.empty, { backgroundColor: theme.colors.surface }]}><Text style={{ color: theme.colors.text }}>Nenhum atendimento em andamento.</Text><Pressable accessibilityRole="button" onPress={() => navigation.replace('EmergencyPick')} style={styles.emptyButton}><Text style={{ color: theme.colors.blueInk }}>Escolher situação</Text></Pressable></View>;
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
        <Pressable accessibilityRole="button" accessibilityLabel="Sair do atendimento e continuar depois" onPress={() => navigation.navigate('MainTabs')} style={[styles.back, { borderColor: theme.colors.border }]}><Icon glyph="back" size={19} color={theme.colors.text2} /></Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.ink(theme.colors.red), fontFamily: theme.typography.sectionLabel.family, fontSize: 10 * theme.fontScale, letterSpacing: 1.5 }}>Atendimento · início {clockTime(incident.startedAtServer ?? incident.startedAtLocal)}</Text>
          <Text style={{ color: theme.colors.text, fontFamily: theme.typography.sectionTitle.family, fontSize: 17 * theme.fontScale, marginTop: 4 }}>{scenarioTitle(incident.scenarioId)}</Text>
        </View>
      </View>

      <View style={[styles.progressCard, { backgroundColor: theme.colors.bg, borderColor: theme.colors.border }]}>
        <View style={styles.progressLabels}><Text style={{ color: theme.colors.text, fontSize: 13 * theme.fontScale }}>Progresso do atendimento</Text><Text style={{ color: theme.ink(theme.colors.green), fontWeight: '600', fontSize: 13 * theme.fontScale }}>{completed}/{total}</Text></View>
        <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: completed }} style={[styles.progressTrack, { backgroundColor: theme.colors.soft }]}><View style={{ width: `${completed / total * 100}%`, height: 7, borderRadius: 99, backgroundColor: theme.colors.green }} /></View>
      </View>

      {groups.map((group) => (
        <View key={group.label} style={styles.group}>
          <View style={styles.groupHeading}><Text style={{ color: theme.colors.text, fontFamily: theme.typography.listItem.family, fontSize: 15 * theme.fontScale }}>{group.label}</Text><Text style={{ color: theme.colors.text2, fontSize: 12 * theme.fontScale }}>{group.sub}</Text></View>
          {group.actions.map((action) => {
            const done = incident.actions[action.id];
            return <Pressable key={action.id} accessibilityRole="checkbox" accessibilityLabel={action.title} accessibilityState={{ checked: !!done, disabled: !!done }} disabled={!!done} onPress={() => completeAction(action.id, new Date().toISOString())} style={[styles.action, { backgroundColor: theme.colors.bg, borderColor: done ? theme.colors.green : theme.colors.border }]}>
              <View style={[styles.checkbox, { backgroundColor: done ? theme.colors.green : 'transparent', borderColor: done ? theme.colors.green : theme.colors.border }]}>{done && <Icon glyph="check" size={16} color="#fff" />}</View>
              <View style={{ flex: 1 }}><Text style={{ color: theme.colors.text, fontFamily: theme.typography.listItem.family, fontSize: 14 * theme.fontScale }}>{action.title}</Text><Text style={{ color: theme.colors.text2, fontFamily: theme.typography.secondary.family, fontSize: 12.5 * theme.fontScale, lineHeight: 20 * theme.fontScale, marginTop: 5 }}>{action.how}</Text>{done && <Text style={{ color: theme.ink(theme.colors.green), fontSize: 11 * theme.fontScale, marginTop: 8 }}>Concluída às {clockTime(done.completedAt ?? done.clientTimestamp)}{!done.completedAt ? ' · aguardando sincronização' : ''}</Text>}</View>
            </Pressable>;
          })}
        </View>
      ))}

      <View style={styles.footer}>
        <Pressable accessibilityRole="button" accessibilityLabel="Acionar contato de confiança" onPress={() => navigation.navigate('Contact')} style={[styles.footerButton, { borderColor: theme.colors.border }]}><Text style={{ color: theme.colors.text, fontFamily: theme.typography.listItem.family, fontSize: 15 * theme.fontScale }}>Acionar contato de confiança</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Encerrar e gerar relatório" onPress={close} style={[styles.footerButton, { backgroundColor: theme.colors.deep }]}><Text style={{ color: '#fff', fontFamily: theme.typography.listItem.family, fontSize: 15 * theme.fontScale }}>Encerrar e gerar relatório</Text></Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyButton: { minHeight: 44, justifyContent: 'center', marginTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  back: { width: 44, height: 44, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  progressCard: { padding: 16, borderWidth: 1, borderRadius: 16, marginBottom: 22 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressTrack: { height: 7, borderRadius: 99, overflow: 'hidden' },
  group: { marginBottom: 24, gap: 9 },
  groupHeading: { flexDirection: 'row', alignItems: 'baseline', gap: 9, marginBottom: 3 },
  action: { flexDirection: 'row', gap: 12, padding: 16, minHeight: 60, borderRadius: 18, borderWidth: 1.5 },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  footer: { gap: 10, marginTop: 4 },
  footerButton: { minHeight: 56, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
});
