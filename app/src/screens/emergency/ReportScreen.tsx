import React from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { allActions, planFor } from '../../lib/emergency';
import type { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../state/store';
import { Icon } from '../../theme/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { clockTime, reportText, scenarioTitle } from './format';

type Props = NativeStackScreenProps<RootStackParamList, 'Report'>;

export function ReportScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const incident = useAppStore((s) => s.lastReport);
  const outbox = useAppStore((s) => s.outbox);
  const actions = incident ? allActions(planFor(incident.scenarioId)) : [];
  const done = actions.filter((action) => incident?.actions[action.id]);
  const pending = actions.filter((action) => !incident?.actions[action.id]).slice(0, 4);
  const unsynced = !!incident && (outbox.some((op) => op.incidentId === incident.id) || !incident.closedAtServer || done.some((action) => !incident.actions[action.id].completedAt));
  const timeline = incident ? [
    { key: 'start', label: 'Atendimento iniciado', time: incident.startedAtServer ?? incident.startedAtLocal, local: !incident.startedAtServer },
    ...done.map((action) => ({ key: action.id, label: action.title, time: incident.actions[action.id].completedAt ?? incident.actions[action.id].clientTimestamp, local: !incident.actions[action.id].completedAt }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
    { key: 'close', label: 'Atendimento encerrado', time: incident.closedAtServer ?? incident.closedAtLocal ?? incident.startedAtLocal, local: !incident.closedAtServer },
  ] : [];

  return <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={{ paddingHorizontal: theme.spacing.marginX, paddingTop: Math.max(insets.top + 18, 48), paddingBottom: insets.bottom + 32 }}>
    <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => navigation.navigate('MainTabs')} style={[styles.back, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}><Icon glyph="back" size={19} color={theme.colors.text} /></Pressable>
    {!incident ? <View style={styles.empty}>
      <Text style={{ color: theme.colors.text, fontFamily: theme.typography.sectionTitle.family, fontSize: 22 * theme.fontScale }}>Ainda não há relatório</Text>
      <Text style={{ color: theme.colors.text2, fontSize: 14 * theme.fontScale, lineHeight: 22 * theme.fontScale }}>Após encerrar um atendimento, o relatório aparecerá aqui.</Text>
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate('EmergencyPick')} style={[styles.exportButton, { backgroundColor: theme.colors.blue }]}><Text style={[styles.exportText, { fontSize: 15 * theme.fontScale }]}>Abrir Modo Emergência</Text></Pressable>
    </View> : <>
      <Text style={[styles.eyebrow, { fontSize: 11 * theme.fontScale, color: theme.colors.text2, fontFamily: theme.typography.sectionLabel.family }]}>RELATÓRIO DO ATENDIMENTO</Text>
      <Text style={{ color: theme.colors.text, fontFamily: theme.typography.screenTitle.family, fontSize: 24 * theme.fontScale, marginTop: 10 }}>{scenarioTitle(incident.scenarioId)}</Text>
      <Text style={{ color: theme.colors.text2, fontSize: 13 * theme.fontScale, marginTop: 6, marginBottom: 22 }}>Início às {clockTime(incident.startedAtServer ?? incident.startedAtLocal)}</Text>
      {unsynced && <View style={[styles.banner, { backgroundColor: theme.colors.tint, borderColor: theme.colors.blue }]}><Text style={{ color: theme.colors.blueInk, fontSize: 13 * theme.fontScale }}>Alguns horários são locais e aguardam sincronização. O horário do servidor aparecerá quando houver conexão.</Text></View>}
      <View style={[styles.countCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.countRow}><Text style={{ color: theme.colors.text, fontSize: 14 * theme.fontScale }}>Ações concluídas</Text><Text style={{ color: theme.ink(theme.colors.green), fontSize: 19 * theme.fontScale, fontWeight: '600' }}>{done.length}/{actions.length}</Text></View>
        <View style={[styles.track, { backgroundColor: theme.colors.soft }]}><View style={{ width: `${done.length / actions.length * 100}%`, height: 7, borderRadius: 99, backgroundColor: theme.colors.green }} /></View>
      </View>
      <Text style={[styles.eyebrow, { fontSize: 11 * theme.fontScale, color: theme.colors.text2, fontFamily: theme.typography.sectionLabel.family }]}>LINHA DO TEMPO</Text>
      <View style={styles.timeline}>{timeline.map((event) => <View key={event.key} style={styles.event}><View style={[styles.marker, { backgroundColor: theme.colors.blue }]} /><View style={{ flex: 1, paddingBottom: 14 }}><Text style={{ color: theme.colors.text2, fontSize: 12 * theme.fontScale }}>{clockTime(event.time)}{event.local ? ' · aguardando sincronização' : ''}</Text><Text style={{ color: theme.colors.text, fontSize: 14 * theme.fontScale, marginTop: 3 }}>{event.label}</Text></View></View>)}</View>
      {pending.length > 0 && <><Text style={[styles.eyebrow, { fontSize: 11 * theme.fontScale, color: theme.colors.text2, fontFamily: theme.typography.sectionLabel.family }]}>AINDA PENDENTE</Text><View style={styles.pendingList}>{pending.map((action) => <View key={action.id} style={[styles.pending, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><Icon glyph="clock" size={17} color={theme.ink(theme.colors.amber)} /><Text style={{ color: theme.colors.text, flex: 1, fontSize: 13.5 * theme.fontScale }}>{action.title}</Text></View>)}</View></>}
      <Pressable accessibilityRole="button" accessibilityLabel="Exportar relatório" onPress={() => { void Share.share({ message: reportText(incident) }); }} style={[styles.exportButton, { backgroundColor: theme.colors.blue }]}><Text style={[styles.exportText, { fontSize: 15 * theme.fontScale }]}>Exportar relatório</Text></Pressable>
    </>}
  </ScrollView>;
}

const styles = StyleSheet.create({
  back: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  empty: { gap: 14, marginTop: 24 },
  eyebrow: { letterSpacing: 2, marginBottom: 14 },
  banner: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 18 },
  countCard: { padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 24 },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 },
  track: { height: 7, borderRadius: 99, overflow: 'hidden' },
  timeline: { marginBottom: 22 },
  event: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  marker: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  pendingList: { gap: 8, marginBottom: 24 },
  pending: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, borderRadius: 15, borderWidth: 1 },
  exportButton: { minHeight: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginTop: 8, paddingHorizontal: 12 },
  exportText: { color: '#fff', fontWeight: '600' },
});
