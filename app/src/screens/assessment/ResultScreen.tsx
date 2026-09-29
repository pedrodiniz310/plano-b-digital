import React, { useEffect } from 'react';
import { radii, spacing } from '../../theme/tokens';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Circle } from 'react-native-svg';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { ProgressBar } from '../../components/ProgressBar';
import { SectionTitle } from '../../components/SectionTitle';
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
  const completedSimulationIds = useAppStore((s) => s.completedSimulationIds);

  useEffect(() => {
    if (!answers || baseScore === null) navigation.replace('Ready');
  }, [answers, baseScore, navigation]);

  if (!answers || baseScore === null) return null;

  const score = readinessScore({ baseScore, completedTaskCount: completedTaskIds.length, completedSimulationCount: completedSimulationIds.length });
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
      <SectionTitle>SEU RESULTADO</SectionTitle>

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
          <Text style={[styles.score, { color: theme.colors.text, fontFamily: theme.typography.bigNumber.family, fontSize: theme.typography.bigNumber.size * theme.fontScale, lineHeight: 52 * theme.fontScale }]}>{score}</Text>
          <Text style={[styles.scoreCaption, { color: theme.colors.text2, fontSize: theme.typography.small.size * theme.fontScale }]}>de 100</Text>
        </View>
        <Badge label={level.label} color={levelColor} glyph="shield" size="regular" style={styles.levelBadge} />
        <Text style={[styles.levelDescription, { color: theme.colors.text2, fontFamily: theme.typography.secondary.family, fontSize: theme.typography.body.size * theme.fontScale, lineHeight: 23 * theme.fontScale }]}>{level.description}</Text>
      </View>

      <SectionTitle>POR ÁREA</SectionTitle>
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
                  <Text style={[styles.categoryName, { color: theme.colors.text, fontFamily: theme.typography.listItem.family, fontSize: theme.typography.bodySmall.size * theme.fontScale }]}>{category.name}</Text>
                  <Text style={[styles.categoryScore, { color: theme.ink(color), fontSize: theme.typography.secondary.size * theme.fontScale }]}>{score}%</Text>
                </View>
                <ProgressBar value={score} max={100} color={color} size="regular" />
              </View>
            </View>
          );
        })}
      </View>

      {risks.length > 0 ? (
        <View style={styles.riskSection}>
          <SectionTitle>RISCOS PRIORITÁRIOS</SectionTitle>
          <View style={styles.risks}>
            {risks.map((risk, index) => (
              <Card key={risk.title} style={styles.riskCard}>
                <Text style={[styles.riskNumber, { color: theme.ink(theme.colors.amber), fontSize: theme.typography.secondary.size * theme.fontScale }]}>{String(index + 1).padStart(2, '0')}</Text>
                <View style={styles.riskCopy}>
                  <Text style={{ color: theme.colors.text, fontFamily: theme.typography.listItem.family, fontSize: theme.typography.bodySmall.size * theme.fontScale, lineHeight: 20 * theme.fontScale }}>{risk.title}</Text>
                  <Text style={[styles.riskDescription, { color: theme.colors.text2, fontFamily: theme.typography.secondary.family, fontSize: theme.typography.secondary.size * theme.fontScale, lineHeight: 19 * theme.fontScale }]}>{risk.description}</Text>
                </View>
              </Card>
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
  summary: { alignItems: 'center', marginTop: 26, marginBottom: 30 },
  ring: { width: 168, height: 168, alignItems: 'center', justifyContent: 'center' },
  ringSvg: { position: 'absolute' },
  score: { letterSpacing: -1.8 },
  scoreCaption: { marginTop: -2 },
  levelBadge: { paddingHorizontal: 15, paddingVertical: 7, marginTop: 16 },
  levelDescription: { textAlign: 'center', maxWidth: 300, marginTop: 12 },
  categories: { gap: 13, marginTop: 14, marginBottom: 28 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  categoryIcon: { width: 34, height: 34, borderRadius: radii.iconSquare, alignItems: 'center', justifyContent: 'center' },
  categoryBody: { flex: 1 },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 },
  categoryName: { flex: 1 },
  categoryScore: { fontWeight: '600' },
  riskSection: { marginBottom: 28 },
  risks: { gap: spacing.listGap, marginTop: 12 },
  riskCard: { flexDirection: 'row', gap: 13, padding: spacing.inset },
  riskNumber: { fontWeight: '600', fontStyle: 'italic' },
  riskCopy: { flex: 1 },
  riskDescription: { marginTop: 5 },
  actions: { gap: spacing.listGap, marginTop: 'auto' },
});
