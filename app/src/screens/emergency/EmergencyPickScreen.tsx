import React from 'react';
import { radii, spacing } from '../../theme/tokens';
import { PressableFeedback } from '../../components/PressableFeedback';
import { IconButton } from '../../components/IconButton';
import { ListRow } from '../../components/ListRow';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { randomUUID } from 'expo-crypto';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EMERGENCY_SCENARIOS } from '../../content/emergency';
import type { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../state/store';
import { Icon } from '../../theme/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { scenarioTitle } from './format';

type Props = NativeStackScreenProps<RootStackParamList, 'EmergencyPick'>;

export function EmergencyPickScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const active = useAppStore((s) => s.activeIncident);
  const startIncident = useAppStore((s) => s.startIncident);

  function choose(scenarioId: string) {
    if (useAppStore.getState().activeIncident) return;
    startIncident(randomUUID(), scenarioId, new Date().toISOString());
    navigation.replace('EmergencyRun', { scenarioId });
  }

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={{ paddingHorizontal: theme.spacing.marginX, paddingTop: Math.max(insets.top + 18, 48), paddingBottom: insets.bottom + 32 }}>
      <IconButton glyph="back" accessibilityLabel="Voltar" onPress={() => navigation.goBack()} style={styles.back} />
      <Text style={[styles.chip, { fontSize: theme.typography.sectionLabel.size * theme.fontScale, color: theme.ink(theme.colors.red), backgroundColor: theme.colors.soft, fontFamily: theme.typography.sectionLabel.family }]}>Modo Emergência</Text>
      <Text style={{ color: theme.colors.text, fontFamily: theme.typography.screenTitle.family, fontSize: theme.typography.screenTitle.size * theme.fontScale }}>O que aconteceu?</Text>
      <Text style={[styles.intro, { color: theme.colors.text2, fontFamily: theme.typography.secondary.family, fontSize: theme.typography.bodySmall.size * theme.fontScale }]}>Escolha a situação. Você recebe um passo a passo na ordem certa, sem precisar pensar em tudo de uma vez.</Text>
      {active && !active.closedAtLocal ? (
        <PressableFeedback accessibilityRole="button" accessibilityLabel={`Retomar atendimento: ${scenarioTitle(active.scenarioId)}`} onPress={() => navigation.replace('EmergencyRun', { scenarioId: active.scenarioId })} style={[styles.resume, { backgroundColor: theme.colors.tint, borderColor: theme.colors.blue }]}>
          <Text style={{ color: theme.colors.blueInk, fontFamily: theme.typography.listItem.family, fontSize: theme.typography.body.size * theme.fontScale }}>Retomar atendimento</Text>
          <Text style={{ color: theme.colors.text, fontSize: theme.typography.bodySmall.size * theme.fontScale }}>{scenarioTitle(active.scenarioId)}</Text>
        </PressableFeedback>
      ) : null}
      {!active && <View style={styles.list}>{EMERGENCY_SCENARIOS.map((item) => (
        <ListRow key={item.id} accessibilityRole="button" accessibilityLabel={item.title} onPress={() => choose(item.id)} style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: theme.colors.soft }]}><Icon glyph={item.glyph} size={21} color={theme.colors.text} /></View>
          <Text style={{ flex: 1, color: theme.colors.text, fontFamily: theme.typography.listItem.family, fontSize: theme.typography.body.size * theme.fontScale }}>{item.title}</Text>
        </ListRow>
      ))}</View>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  back: { marginBottom: 22 },
  chip: { alignSelf: 'flex-start', paddingHorizontal: 13, paddingVertical: 8, borderRadius: radii.pill, letterSpacing: 1.5, marginBottom: 16 },
  intro: { lineHeight: 23, marginTop: 9, marginBottom: 22 },
  list: { gap: spacing.listGap },
  row: { minHeight: 72 },
  iconBox: { width: 44, height: 44, borderRadius: radii.iconSquare, alignItems: 'center', justifyContent: 'center' },
  resume: { minHeight: 72, padding: spacing.inset, borderRadius: radii.card, borderWidth: 1, marginBottom: 16, gap: 4 },
});
