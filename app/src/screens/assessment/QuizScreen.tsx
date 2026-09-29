import React, { useEffect, useState } from 'react';
import { radii, spacing } from '../../theme/tokens';
import { PressableFeedback } from '../../components/PressableFeedback';
import { IconButton } from '../../components/IconButton';
import { ProgressBar } from '../../components/ProgressBar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { submitAssessment } from '../../api/assessments';
import { ApiError } from '../../api/client';
import { ANSWER_OPTIONS, CATEGORIES, QUESTIONS } from '../../content/questions';
import { baseScoreOf, type Answers } from '../../lib/scoring';
import type { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../state/store';
import { Icon } from '../../theme/Icon';
import { useTheme } from '../../theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

export function QuizScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const setAssessment = useAppStore((s) => s.setAssessment);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (selected === null) return;
    const timer = setTimeout(() => {
      if (index < QUESTIONS.length - 1) {
        setIndex(index + 1);
        setSelected(null);
        return;
      }

      const score = baseScoreOf(answers);
      setAssessment(answers, score);
      void submitAssessment(answers).catch((error: unknown) => {
        console.warn('assessment_submit_failed', error instanceof ApiError ? error.code : 'network_error');
      });
      navigation.replace('Processing');
    }, 220);
    return () => clearTimeout(timer);
  }, [answers, index, navigation, selected, setAssessment]);

  const question = QUESTIONS[index];
  const category = CATEGORIES.find((item) => item.id === question.categoryId)!;
  const checked = selected ?? answers[index];

  function goBack() {
    setSelected(null);
    if (index === 0) navigation.goBack();
    else setIndex(index - 1);
  }

  function selectAnswer(optionIndex: number) {
    setAnswers((current) => ({ ...current, [index]: optionIndex }));
    setSelected(optionIndex);
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
      <View style={styles.header}>
        <IconButton glyph="back" accessibilityLabel="Voltar" onPress={goBack} />
        <View style={styles.progressBlock}>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressTitle, { color: theme.colors.text2, fontSize: theme.typography.sectionLabel.size * theme.fontScale }]}>TESTE DE PRONTIDÃO</Text>
            <Text style={[styles.progressCount, { color: theme.colors.text2, fontSize: theme.typography.small.size * theme.fontScale }]}>
              {String(index + 1).padStart(2, '0')}/{String(QUESTIONS.length).padStart(2, '0')}
            </Text>
          </View>
          <ProgressBar value={index} max={QUESTIONS.length} />
        </View>
      </View>

      <View style={styles.body}>
        <View>
          <View style={[styles.categoryChip, { backgroundColor: theme.colors.tint }]}>
            <Icon glyph={category.glyph} size={15} color={theme.colors.blueInk} />
            <Text style={[styles.categoryLabel, { color: theme.colors.blueInk, fontSize: theme.typography.small.size * theme.fontScale }]}>{category.name}</Text>
          </View>
          <Text style={[styles.question, { color: theme.colors.text, fontFamily: theme.typography.screenTitle.family, fontSize: theme.typography.screenTitle.size * theme.fontScale, lineHeight: 34 * theme.fontScale }]}>{question.text}</Text>
        </View>
        <View style={styles.options} accessibilityRole="radiogroup">
          {ANSWER_OPTIONS.map((option, optionIndex) => {
            const isChecked = checked === optionIndex;
            return (
              <PressableFeedback
                key={option.key}
                accessibilityRole="radio"
                accessibilityLabel={option.label}
                accessibilityState={{ checked: isChecked }}
                onPress={() => selectAnswer(optionIndex)}
                style={[
                  styles.option,
                  {
                    backgroundColor: isChecked ? theme.colors.tint : theme.colors.surface,
                    borderColor: isChecked ? theme.colors.blue : theme.colors.border,
                  },
                ]}
              >
                <View style={[styles.radio, { borderColor: isChecked ? theme.colors.blue : theme.colors.border }]}>
                  {isChecked ? <View style={[styles.radioDot, { backgroundColor: theme.colors.blue }]} /> : null}
                </View>
                <Text style={[styles.optionText, { color: isChecked ? theme.colors.blueInk : theme.colors.text, fontFamily: theme.typography.listItem.family, fontSize: theme.typography.body.size * theme.fontScale }]}>{option.label}</Text>
              </PressableFeedback>
            );
          })}
        </View>
      </View>

      <Text style={[styles.footer, { color: theme.colors.text2, fontSize: theme.typography.small.size * theme.fontScale }]}>
        Não existe resposta errada — o resultado guia seu plano.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  progressBlock: { flex: 1 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  progressTitle: { fontWeight: '600', letterSpacing: 1.6 },
  progressCount: { fontWeight: '500' },
  body: { flexGrow: 1, justifyContent: 'center', gap: spacing.blockGap, paddingBottom: 20 },
  categoryChip: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 13, paddingVertical: 8, borderRadius: radii.pill, marginBottom: 18 },
  categoryLabel: { fontWeight: '500' },
  question: { letterSpacing: -0.5 },
  options: { gap: spacing.listGap },
  option: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 18, paddingVertical: 14, borderWidth: 1.5, borderRadius: radii.field },
  radio: { width: 22, height: 22, borderRadius: radii.pill, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: radii.pill },
  optionText: { flex: 1 },
  footer: { lineHeight: 18, textAlign: 'center' },
});
