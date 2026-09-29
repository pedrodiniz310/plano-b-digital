import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Circle } from 'react-native-svg';
import { Button } from '../../components/Button';
import { CATEGORIES } from '../../content/questions';
import { categoryScores, levelOf, priorityRisks, readinessScore } from '../../lib/scoring';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../state/store';
import { Icon } from '../../theme/Icon';
import { useTheme } from '../../theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;
const CIRCUMFERENCE = 2 * Math.PI * 62;

export function ResultScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const answers = useAppStore((s) => s.answers);
  const baseScore = useAppStore((s) => s.baseScore);
  const completedTaskIds = useAppStore((s) => s.completedTaskIds);

  useEffect(() => {
    if (!answers || baseScore === null) navigation.replace('Ready');
  }, [answers, baseScore, navigation]);

  if (!answers || baseScore === null) return null;

  const score = readinessScore({ baseScore, completedTaskCount: completedTaskIds.length, completedSimulationCount: 0 });
  const level = levelOf(score);
  const levelColor = score >= 85 ? theme.colors.green : score >= 70 ? theme.colors.blue : score >= 40 ? theme.colors.amber : theme.colors.red;
  const scores = categoryScores(answers);
  const risks = priorityRisks(answers);

  function finish(screen: keyof MainTabParamList) {
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs', params: { screen } }] });
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.bg }}
      contentContainerStyle={[
        styles.container,
        {
          paddingHorizontal: theme.spacing.marginX,
          paddingTop: Math.max(theme.spacing.screenTop, insets.top + 16),
          paddingBottom: Math.max(34, insets.bottom + 20),
        },
      ]}
    >
      <Text style={[styles.eyebrow, { color: theme.colors.text2, fontSize: 11 * theme.fontScale }]}>SEU RESULTADO</Text>

      <View style={styles.summary}>
        <View style={styles.ring} accessible accessibilityLabel={`Pontuação de prontidão: ${score} de 100`}>
          <Svg width={168} height={168} style={styles.ringSvg}>
            <Circle cx={84} cy={84} r={62} stroke={theme.colors.soft} strokeWidth={14} fill="none" />
            <Circle
              cx={84}
              cy={84}
              r={62}
              stroke={levelColor}
              strokeWidth={14}
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeDashoffset={CIRCUMFERENCE * (1 - score / 100)}
              transform="rotate(-90 84 84)"
              fill="none"
            />
          </Svg>
          <Text style={[styles.score, { color: theme.colors.text, fontFamily: theme.typography.bigNumber.family, fontSize: 44 * theme.fontScale, lineHeight: 52 * theme.fontScale }]}>{score}</Text>
          <Text style={[styles.scoreCaption, { color: theme.colors.text2, fontSize: 12 * theme.fontScale }]}>de 100</Text>
        </View>
        <Text style={[styles.levelBadge, { backgroundColor: theme.colors.soft, color: theme.ink(levelColor), fontSize: 13 * theme.fontScale }]}>{level.label}</Text>
        <Text style={[styles.levelDescription, { color: theme.colors.text2, fontFamily: theme.typography.secondary.family, fontSize: 14.5 * theme.fontScale, lineHeight: 23 * theme.fontScale }]}>{level.description}</Text>
      </View>

      <Text style={[styles.sectionLabel, { color: theme.colors.text2, fontSize: 11 * theme.fontScale }]}>POR ÁREA</Text>
      <View style={styles.categories}>
        {CATEGORIES.map((category) => {
          const score = scores[category.id];
          const color = theme.statusColor(score);
          return (
            <View key={category.id} style={styles.categoryRow}>
              <View style={[styles.categoryIcon, { backgroundColor: theme.colors.soft }]}>
                <Icon glyph={category.glyph} size={17} color={theme.colors.text2} />
              </View>
              <View style={styles.categoryBody}>
                <View style={styles.categoryHeader}>
                  <Text style={[styles.categoryName, { color: theme.colors.text, fontFamily: theme.typography.listItem.family, fontSize: 13.5 * theme.fontScale }]}>{category.name}</Text>
                  <Text style={[styles.categoryScore, { color: theme.ink(color), fontSize: 12.5 * theme.fontScale }]}>{score}%</Text>
                </View>
                <View style={[styles.barTrack, { backgroundColor: theme.colors.soft }]}>
                  <View style={[styles.barFill, { width: `${score}%`, backgroundColor: color }]} />
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {risks.length > 0 ? (
        <View style={styles.riskSection}>
          <Text style={[styles.sectionLabel, { color: theme.colors.text2, fontSize: 11 * theme.fontScale }]}>RISCOS PRIORITÁRIOS</Text>
          <View style={styles.risks}>
            {risks.map((risk, index) => (
              <View key={risk.title} style={[styles.riskCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Text style={[styles.riskNumber, { color: theme.ink(theme.colors.amber), fontSize: 13 * theme.fontScale }]}>{String(index + 1).padStart(2, '0')}</Text>
                <View style={styles.riskCopy}>
                  <Text style={{ color: theme.colors.text, fontFamily: theme.typography.listItem.family, fontSize: 14 * theme.fontScale, lineHeight: 20 * theme.fontScale }}>{risk.title}</Text>
                  <Text style={[styles.riskDescription, { color: theme.colors.text2, fontFamily: theme.typography.secondary.family, fontSize: 12.5 * theme.fontScale, lineHeight: 19 * theme.fontScale }]}>{risk.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button label="Ver meu Plano B" onPress={() => finish('Plan')} />
        <Button label="Ir para o início" variant="secondary" onPress={() => finish('Home')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
  eyebrow: { fontWeight: '600', letterSpacing: 2.4 },
  summary: { alignItems: 'center', marginTop: 26, marginBottom: 30 },
  ring: { width: 168, height: 168, alignItems: 'center', justifyContent: 'center' },
  ringSvg: { position: 'absolute' },
  score: { letterSpacing: -1.8 },
  scoreCaption: { marginTop: -2 },
  levelBadge: { overflow: 'hidden', paddingHorizontal: 15, paddingVertical: 7, borderRadius: 99, fontWeight: '600', marginTop: 16 },
  levelDescription: { textAlign: 'center', maxWidth: 300, marginTop: 12 },
  sectionLabel: { fontWeight: '600', letterSpacing: 2.4 },
  categories: { gap: 13, marginTop: 14, marginBottom: 28 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  categoryIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  categoryBody: { flex: 1 },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 },
  categoryName: { flex: 1 },
  categoryScore: { fontWeight: '600' },
  barTrack: { height: 6, borderRadius: 99, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 99 },
  riskSection: { marginBottom: 28 },
  risks: { gap: 10, marginTop: 12 },
  riskCard: { flexDirection: 'row', gap: 13, padding: 16, borderRadius: 18, borderWidth: 1 },
  riskNumber: { fontWeight: '600', fontStyle: 'italic' },
  riskCopy: { flex: 1 },
  riskDescription: { marginTop: 5 },
  actions: { gap: 10, marginTop: 'auto' },
});
