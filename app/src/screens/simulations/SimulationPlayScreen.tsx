import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { usePreventRemove } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError } from '../../api/client';
import { submitSimulationResult } from '../../api/simulations';
import { Button } from '../../components/Button';
import { ROUBO_STEPS, SIMULATIONS } from '../../content/simulations';
import { isCorrect } from '../../lib/simulation';
import type { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../state/store';
import { Icon } from '../../theme/Icon';
import { useTheme } from '../../theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'SimulationPlay'>;

export function SimulationPlayScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const completeSimulation = useAppStore((s) => s.completeSimulation);
  const simulation = SIMULATIONS.find((item) => item.id === route.params.simulationId && item.playable);
  const [stepIndex, setStepIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [multi, setMulti] = useState<number[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [hits, setHits] = useState(0);
  const [startAt, setStartAt] = useState<number | null>(null);
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [resultReady, setResultReady] = useState(false);
  const step = ROUBO_STEPS[stepIndex];

  usePreventRemove(!resultReady, ({ data }) => {
    Alert.alert('Sair da simulação?', 'Seu progresso nesta tentativa será perdido.', [
      { text: 'Continuar simulação', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => navigation.dispatch(data.action) },
    ]);
  });

  useEffect(() => {
    if (resultReady && simulation) {
      navigation.replace('SimulationResult', { simulationId: simulation.id, hits, timeSeconds });
    }
  }, [resultReady, simulation, hits, timeSeconds, navigation]);

  if (!simulation || !step) return null;
  const simulationId = simulation.id;

  const correctCount = step.type === 'multi' ? step.options.filter((option) => option.correct).length : 0;
  const canConfirm = step.type === 'intro' || feedback !== null ||
    (step.type === 'choice' && choice !== null) ||
    (step.type === 'multi' && multi.length === correctCount) ||
    (step.type === 'order' && order.length === step.items.length);
  const isLast = stepIndex === ROUBO_STEPS.length - 1;
  const buttonLabel = step.type === 'intro' ? 'Começar simulação' : feedback ? (isLast ? 'Ver resultado' : 'Continuar') : 'Confirmar resposta';

  function advance() {
    if (step.type === 'intro') {
      setStartAt(Date.now());
      setStepIndex(stepIndex + 1);
      return;
    }
    if (!feedback) {
      const answer = step.type === 'choice' ? choice : step.type === 'multi' ? multi : order;
      const correct = isCorrect(step, answer);
      setFeedback(correct ? 'correct' : 'incorrect');
      if (correct) setHits((count) => count + 1);
      if (isLast) setTimeSeconds(Math.min(7200, Math.max(0, Math.floor((Date.now() - (startAt ?? Date.now())) / 1000))));
      return;
    }
    if (isLast) {
      completeSimulation(simulationId);
      void submitSimulationResult(simulationId, { hits, timeSeconds }).catch((error: unknown) => {
        console.warn(error instanceof ApiError ? error.code : 'network_error');
      });
      setResultReady(true);
      return;
    }
    setStepIndex(stepIndex + 1);
    setChoice(null);
    setMulti([]);
    setOrder([]);
    setFeedback(null);
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.bg }}
      contentContainerStyle={[styles.container, {
        paddingHorizontal: theme.spacing.marginX,
        paddingTop: Math.max(theme.spacing.screenTop, insets.top + 16),
        paddingBottom: Math.max(34, insets.bottom + 20),
      }]}
    >
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Sair da simulação" onPress={() => navigation.goBack()} style={[styles.exit, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={{ color: theme.colors.text, fontSize: 24 * theme.fontScale, lineHeight: 28 * theme.fontScale }}>×</Text>
        </Pressable>
        <View style={styles.progressBody}>
          <View style={styles.progressLabel}>
            <Text style={{ color: theme.colors.text2, fontFamily: theme.typography.sectionLabel.family, fontSize: 11 * theme.fontScale, letterSpacing: 1.5, flexShrink: 1 }}>{simulation.title.toUpperCase()}</Text>
            <Text style={{ color: theme.colors.text2, fontSize: 12 * theme.fontScale }}>{stepIndex + 1}/{ROUBO_STEPS.length}</Text>
          </View>
          <View style={[styles.track, { backgroundColor: theme.colors.soft }]}>
            <View style={{ width: `${stepIndex / ROUBO_STEPS.length * 100}%`, height: 5, backgroundColor: theme.colors.blue, borderRadius: 99 }} />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View>
          <Text style={{ color: theme.colors.text, fontFamily: theme.typography.screenTitle.family, fontSize: 23 * theme.fontScale, lineHeight: 30 * theme.fontScale }}>{step.title}</Text>
          {step.type === 'intro' && <Text style={{ color: theme.colors.text2, fontFamily: theme.typography.body.family, fontSize: 15 * theme.fontScale, lineHeight: 24 * theme.fontScale, marginTop: 14 }}>{step.description}</Text>}
          {(step.type === 'multi' || step.type === 'order') && <Text style={{ color: theme.colors.blueInk, fontFamily: theme.typography.listItem.family, fontSize: 12.5 * theme.fontScale, marginTop: 10 }}>{step.type === 'multi' ? `Selecione as ${correctCount} corretas` : step.hint}</Text>}
        </View>

        {(step.type === 'choice' || step.type === 'multi') && (
          <View style={styles.options} accessibilityRole={step.type === 'choice' ? 'radiogroup' : undefined}>
            {step.options.map((option, index) => {
              const selected = step.type === 'choice' ? choice === index : multi.includes(index);
              return (
                <Pressable
                  key={option.label}
                  accessibilityRole={step.type === 'choice' ? 'radio' : 'checkbox'}
                  accessibilityLabel={option.label}
                  accessibilityState={{ checked: selected, disabled: feedback !== null }}
                  disabled={feedback !== null}
                  onPress={() => {
                    if (step.type === 'choice') setChoice(index);
                    else setMulti((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
                  }}
                  style={[styles.option, { borderColor: selected ? theme.colors.blue : theme.colors.border, backgroundColor: selected ? theme.colors.tint : theme.colors.surface }]}
                >
                  <View style={[styles.square, { borderColor: selected ? theme.colors.blue : theme.colors.border }]}>
                    {selected && <View style={[styles.squareFill, { backgroundColor: theme.colors.blue }]} />}
                  </View>
                  <Text style={{ color: selected ? theme.colors.blueInk : theme.colors.text, fontFamily: theme.typography.listItem.family, fontSize: 14.5 * theme.fontScale, flex: 1 }}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {step.type === 'order' && (
          <View style={styles.options}>
            {step.items.map((item) => {
              const position = order.indexOf(item.id);
              const selected = position >= 0;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.label}${selected ? `, posição ${position + 1}` : ', não selecionada'}`}
                  accessibilityState={{ selected, disabled: feedback !== null }}
                  disabled={feedback !== null}
                  onPress={() => setOrder((current) => selected ? current.filter((id) => id !== item.id) : [...current, item.id])}
                  style={[styles.option, { borderColor: selected ? theme.colors.blue : theme.colors.border, backgroundColor: selected ? theme.colors.tint : theme.colors.surface }]}
                >
                  <View style={[styles.orderNumber, { backgroundColor: selected ? theme.colors.blue : theme.colors.soft }]}>
                    <Text style={{ color: selected ? '#fff' : theme.colors.text2, fontSize: 12 * theme.fontScale, fontWeight: '600' }}>{selected ? position + 1 : ''}</Text>
                  </View>
                  <Text style={{ color: selected ? theme.colors.blueInk : theme.colors.text, fontFamily: theme.typography.listItem.family, fontSize: 14.5 * theme.fontScale, flex: 1 }}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {feedback && step.type !== 'intro' && (
          <View accessible accessibilityLiveRegion="polite" style={[styles.feedback, { borderColor: feedback === 'correct' ? theme.colors.green : theme.colors.amber, backgroundColor: theme.colors.soft }]}>
            <Icon glyph={feedback === 'correct' ? 'check' : 'alert'} size={18} color={theme.ink(feedback === 'correct' ? theme.colors.green : theme.colors.amber)} />
            <Text style={{ color: theme.ink(feedback === 'correct' ? theme.colors.green : theme.colors.amber), fontFamily: theme.typography.body.family, fontSize: 13.5 * theme.fontScale, lineHeight: 21 * theme.fontScale, flex: 1 }}>{feedback === 'correct' ? step.feedbackOk : step.feedbackNo}</Text>
          </View>
        )}
      </View>

      <Button label={buttonLabel} onPress={advance} disabled={!canConfirm} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 26 },
  exit: { width: 44, height: 44, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  progressBody: { flex: 1 },
  progressLabel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 7 },
  track: { height: 5, borderRadius: 99, overflow: 'hidden' },
  content: { flex: 1, gap: 22, marginBottom: 22 },
  options: { gap: 10 },
  option: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 17, paddingVertical: 14, borderRadius: 18, borderWidth: 1.5 },
  square: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  squareFill: { width: 10, height: 10, borderRadius: 3 },
  orderNumber: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  feedback: { flexDirection: 'row', gap: 11, padding: 16, borderWidth: 1, borderRadius: 18 },
});
