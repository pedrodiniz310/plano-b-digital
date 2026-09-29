import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={{ paddingHorizontal: 26, paddingTop: Math.max(insets.top + 18, 48), paddingBottom: insets.bottom + 32 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => navigation.goBack()} style={[styles.back, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
        <Icon glyph="back" size={19} color={theme.colors.text} />
      </Pressable>
      <Text style={[styles.chip, { color: theme.ink(theme.colors.red), backgroundColor: theme.colors.soft, fontFamily: theme.typography.sectionLabel.family }]}>Modo Emergência</Text>
      <Text style={{ color: theme.colors.text, fontFamily: theme.typography.screenTitle.family, fontSize: 26 * theme.fontScale }}>O que aconteceu?</Text>
      <Text style={[styles.intro, { color: theme.colors.text2, fontFamily: theme.typography.secondary.family, fontSize: 14 * theme.fontScale }]}>Escolha a situação. Você recebe um passo a passo na ordem certa, sem precisar pensar em tudo de uma vez.</Text>
      {active && !active.closedAtLocal ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`Retomar atendimento: ${scenarioTitle(active.scenarioId)}`} onPress={() => navigation.replace('EmergencyRun', { scenarioId: active.scenarioId })} style={[styles.resume, { backgroundColor: theme.colors.tint, borderColor: theme.colors.blue }]}>
          <Text style={{ color: theme.colors.blueInk, fontFamily: theme.typography.listItem.family, fontSize: 15 * theme.fontScale }}>Retomar atendimento</Text>
          <Text style={{ color: theme.colors.text, fontSize: 14 * theme.fontScale }}>{scenarioTitle(active.scenarioId)}</Text>
        </Pressable>
      ) : null}
      {!active && <View style={styles.list}>{EMERGENCY_SCENARIOS.map((item) => (
        <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={item.title} onPress={() => choose(item.id)} style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={[styles.iconBox, { backgroundColor: theme.colors.soft }]}><Icon glyph={item.glyph} size={21} color={theme.colors.text} /></View>
          <Text style={{ flex: 1, color: theme.colors.text, fontFamily: theme.typography.listItem.family, fontSize: 15 * theme.fontScale }}>{item.title}</Text>
        </Pressable>
      ))}</View>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  back: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  chip: { alignSelf: 'flex-start', paddingHorizontal: 13, paddingVertical: 8, borderRadius: 99, fontSize: 11, letterSpacing: 1.5, marginBottom: 16 },
  intro: { lineHeight: 23, marginTop: 9, marginBottom: 22 },
  list: { gap: 9 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 16, minHeight: 72, borderRadius: 18, borderWidth: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  resume: { minHeight: 72, padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 16, gap: 4 },
});
