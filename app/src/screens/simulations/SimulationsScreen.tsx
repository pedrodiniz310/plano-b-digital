import React from 'react';
import { radii, spacing } from '../../theme/tokens';
import { Badge } from '../../components/Badge';
import { ListRow } from '../../components/ListRow';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SIMULATIONS } from '../../content/simulations';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../state/store';
import { Icon } from '../../theme/Icon';
import { useTheme } from '../../theme/ThemeProvider';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Simulations'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function SimulationsScreen({ navigation }: Props) {
  const theme = useTheme();
  const completedSimulationIds = useAppStore((s) => s.completedSimulationIds);
  const completed = new Set(completedSimulationIds);

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.bg }}
      contentContainerStyle={{ paddingHorizontal: theme.spacing.marginX, paddingTop: theme.spacing.screenTop, paddingBottom: theme.spacing.tabBarReserve }}
    >
      <Text style={{ color: theme.colors.text, fontFamily: theme.typography.screenTitle.family, fontSize: theme.typography.screenTitle.size * theme.fontScale }}>Simulações</Text>
      <Text style={[styles.intro, { color: theme.colors.text2, fontFamily: theme.typography.secondary.family, fontSize: theme.typography.bodySmall.size * theme.fontScale, lineHeight: 22 * theme.fontScale }]}>Treine decisões difíceis com calma, para agir com clareza quando acontecer. {completed.size} de {SIMULATIONS.length} concluídas.</Text>
      <View style={styles.list}>
        {SIMULATIONS.map((simulation) => {
          const done = completed.has(simulation.id);
          const status = done ? 'Concluída' : simulation.playable ? 'Disponível' : 'Em breve';
          const statusColor = done ? theme.colors.green : simulation.playable ? theme.colors.blue : theme.colors.text2;
          return (
            <ListRow
              key={simulation.id}
              accessibilityRole="button"
              accessibilityLabel={`${simulation.title}, ${status}, ${simulation.difficulty}, ${simulation.durationLabel}, mais ${simulation.points} pontos${simulation.playable ? '' : ', conteúdo em breve'}`}
              accessibilityState={{ disabled: !simulation.playable }}
              disabled={!simulation.playable}
              onPress={() => navigation.navigate('SimulationPlay', { simulationId: simulation.id })}
              style={[styles.card, { opacity: simulation.playable || theme.contrast ? 1 : 0.72 }]}
            >
              <View style={[styles.iconBox, { backgroundColor: theme.colors.tint }]}>
                <Icon glyph={simulation.glyph} size={21} color={theme.colors.blueInk} />
              </View>
              <View style={styles.body}>
                <Text style={{ color: theme.colors.text, fontFamily: theme.typography.listItem.family, fontSize: theme.typography.body.size * theme.fontScale, lineHeight: 20 * theme.fontScale }}>{simulation.title}</Text>
                <View style={styles.metaRow}>
                  <Badge label={status} color={statusColor} glyph={done ? 'check' : simulation.playable ? 'play' : 'clock'} style={{ backgroundColor: done ? theme.colors.soft : simulation.playable ? theme.colors.tint : theme.colors.soft, borderColor: statusColor, borderWidth: 1 }} />
                  <Text style={{ color: theme.colors.text2, fontFamily: theme.typography.secondary.family, fontSize: theme.typography.small.size * theme.fontScale, flexShrink: 1 }}>{simulation.difficulty} · {simulation.durationLabel} · +{simulation.points} pts</Text>
                </View>
                {!simulation.playable && <Text style={{ color: theme.colors.text2, fontSize: theme.typography.small.size * theme.fontScale, marginTop: 5 }}>Conteúdo em breve</Text>}
              </View>
            </ListRow>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  intro: { marginTop: 8, marginBottom: 22 },
  list: { gap: spacing.listGap },
  card: { gap: 14, minHeight: 76 },
  iconBox: { width: 44, height: 44, borderRadius: radii.iconSquare, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, minWidth: 0 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 7, marginTop: 5 },
});
