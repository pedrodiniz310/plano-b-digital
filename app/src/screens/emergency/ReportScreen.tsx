import React from 'react';
import { radii, spacing } from '../../theme/tokens';
import { PressableFeedback } from '../../components/PressableFeedback';
import { IconButton } from '../../components/IconButton';
import { ProgressBar } from '../../components/ProgressBar';
import { SectionTitle } from '../../components/SectionTitle';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
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
    <IconButton glyph="back" accessibilityLabel="Voltar" onPress={() => navigation.navigate('MainTabs')} style={styles.back} />
    {!incident ? <View style={styles.empty}>
      <Text style={{ color: theme.colors.text, fontFamily: theme.typography.sectionTitle.family, fontSize: theme.typography.compactTitle.size * theme.fontScale }}>Ainda não há relatório</Text>
      <Text style={{ color: theme.colors.text2, fontSize: theme.typography.bodySmall.size * theme.fontScale, lineHeight: 22 * theme.fontScale }}>Após encerrar um atendimento, o relatório aparecerá aqui.</Text>
      <PressableFeedback accessibilityRole="button" onPress={() => navigation.navigate('EmergencyPick')} style={[styles.exportButton, { backgroundColor: theme.colors.blue }]}><Text style={[styles.exportText, { color: theme.colors.onPrimary, fontSize: theme.typography.body.size * theme.fontScale }]}>Abrir Modo Emergência</Text></PressableFeedback>
    </View> : <>
      <SectionTitle style={styles.eyebrow}>RELATÓRIO DO ATENDIMENTO</SectionTitle>
      <Text style={{ color: theme.colors.text, fontFamily: theme.typography.screenTitle.family, fontSize: theme.typography.cardTitle.size * theme.fontScale, marginTop: 10 }}>{scenarioTitle(incident.scenarioId)}</Text>
      <Text style={{ color: theme.colors.text2, fontSize: theme.typography.secondary.size * theme.fontScale, marginTop: 6, marginBottom: 22 }}>Início às {clockTime(incident.startedAtServer ?? incident.startedAtLocal)}</Text>
      {unsynced && <View style={[styles.banner, { backgroundColor: theme.colors.tint, borderColor: theme.colors.blue }]}><Text style={{ color: theme.colors.blueInk, fontSize: theme.typography.secondary.size * theme.fontScale }}>Alguns horários são locais e aguardam sincronização. O horário do servidor aparecerá quando houver conexão.</Text></View>}
      <View style={[styles.countCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.countRow}><Text style={{ color: theme.colors.text, fontSize: theme.typography.bodySmall.size * theme.fontScale }}>Ações concluídas</Text><Text style={{ color: theme.ink(theme.colors.green), fontSize: theme.typography.sectionTitle.size * theme.fontScale, fontWeight: '600' }}>{done.length}/{actions.length}</Text></View>
        <ProgressBar value={done.length} max={actions.length} color={theme.colors.green} size="incident" />
      </View>
      <SectionTitle style={styles.eyebrow}>LINHA DO TEMPO</SectionTitle>
      <View style={styles.timeline}>{timeline.map((event) => <View key={event.key} style={styles.event}><View style={[styles.marker, { backgroundColor: theme.colors.blue }]} /><View style={{ flex: 1, paddingBottom: 14 }}><Text style={{ color: theme.colors.text2, fontSize: theme.typography.small.size * theme.fontScale }}>{clockTime(event.time)}{event.local ? ' · aguardando sincronização' : ''}</Text><Text style={{ color: theme.colors.text, fontSize: theme.typography.bodySmall.size * theme.fontScale, marginTop: 3 }}>{event.label}</Text></View></View>)}</View>
      {pending.length > 0 && <><SectionTitle style={styles.eyebrow}>AINDA PENDENTE</SectionTitle><View style={styles.pendingList}>{pending.map((action) => <View key={action.id} style={[styles.pending, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><Icon glyph="clock" size={17} color={theme.ink(theme.colors.amber)} /><Text style={{ color: theme.colors.text, flex: 1, fontSize: theme.typography.bodySmall.size * theme.fontScale }}>{action.title}</Text></View>)}</View></>}
      <PressableFeedback accessibilityRole="button" accessibilityLabel="Exportar relatório" onPress={() => { void Share.share({ message: reportText(incident) }); }} style={[styles.exportButton, { backgroundColor: theme.colors.blue }]}><Text style={[styles.exportText, { color: theme.colors.onPrimary, fontSize: theme.typography.body.size * theme.fontScale }]}>Exportar relatório</Text></PressableFeedback>
    </>}
  </ScrollView>;
}

const styles = StyleSheet.create({
  back: { marginBottom: 22 },
  empty: { gap: 14, marginTop: 24 },
  eyebrow: { letterSpacing: 2, marginBottom: 14 },
  banner: { borderWidth: 1, borderRadius: radii.iconSquare, padding: spacing.compactInset, marginBottom: 18 },
  countCard: { padding: 20, borderRadius: radii.card, borderWidth: 1, marginBottom: spacing.blockGap },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 },
  timeline: { marginBottom: 22 },
  event: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  marker: { width: 10, height: 10, borderRadius: radii.pill, marginTop: 5 },
  pendingList: { gap: 8, marginBottom: spacing.blockGap },
  pending: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.listGap, padding: 13, borderRadius: radii.iconSquare, borderWidth: 1 },
  exportButton: { minHeight: 56, borderRadius: radii.field, alignItems: 'center', justifyContent: 'center', marginTop: 8, paddingHorizontal: 12 },
  exportText: { fontWeight: '600' },
});
