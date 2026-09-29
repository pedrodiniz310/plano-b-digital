import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon } from '../../theme/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppStore } from '../../state/store';
import { readinessScore } from '../../lib/scoring';
import { totalPoints } from '../../lib/gamification';
import { evaluateAchievements } from '../../lib/achievements';
import { TASKS } from '../../content/plan';
import type { FontSizeKey } from '../../theme/tokens';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';

type Props = CompositeScreenProps<BottomTabScreenProps<MainTabParamList, 'Profile'>, NativeStackScreenProps<RootStackParamList>>;

const FONT_OPTIONS: { key: FontSizeKey; label: string }[] = [
  { key: 's', label: 'Pequena' }, { key: 'm', label: 'Média' }, { key: 'g', label: 'Grande' },
];

export function ProfileScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const emailMasked = useAppStore((s) => s.emailMasked);
  const baseScore = useAppStore((s) => s.baseScore);
  const completedTaskIds = useAppStore((s) => s.completedTaskIds);
  const completedSimulationIds = useAppStore((s) => s.completedSimulationIds);
  const hasTrustedContact = useAppStore((s) => s.hasTrustedContact);
  const dark = useAppStore((s) => s.theme === 'dark');
  const contrast = useAppStore((s) => s.contrast);
  const font = useAppStore((s) => s.font);
  const setTheme = useAppStore((s) => s.setTheme);
  const toggleContrast = useAppStore((s) => s.toggleContrast);
  const setFont = useAppStore((s) => s.setFont);
  const logout = useAppStore((s) => s.logout);
  const outboxCount = useAppStore((s) => s.outbox.length);
  const score = readinessScore({ baseScore, completedTaskCount: completedTaskIds.length, completedSimulationCount: completedSimulationIds.length });
  const points = totalPoints({ assessmentDone: baseScore !== null, completedTaskCount: completedTaskIds.length, completedSimulationCount: completedSimulationIds.length, hasTrustedContact });
  const achievements = evaluateAchievements({ assessmentDone: baseScore !== null, completedTaskIds: new Set(completedTaskIds), hasTrustedContact, completedSimulationCount: completedSimulationIds.length, readinessScore: score });

  function confirmLogout() {
    const warning = outboxCount > 0
      ? 'Há registros de emergência ainda não sincronizados. Eles ficarão neste aparelho para esta conta até você entrar novamente.'
      : 'Você precisará entrar novamente para acessar sua conta.';
    Alert.alert('Sair da conta?', warning, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => {
        void logout().then(() => navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.reset({ index: 0, routes: [{ name: 'Auth', params: { mode: 'login' } }] }));
      } },
    ]);
  }

  const label = (text: string) => <Text style={{ color: theme.colors.text2, fontFamily: theme.typography.sectionLabel.family, fontSize: 11 * theme.fontScale, letterSpacing: 1.4 }}>{text}</Text>;

  return (
    <ScrollView style={{ backgroundColor: theme.colors.bg }} contentContainerStyle={{ paddingTop: insets.top + 22, paddingBottom: insets.bottom + theme.spacing.tabBarReserve, paddingHorizontal: theme.spacing.marginX, gap: 22 }}>
      <View style={styles.identity}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.deep }]}><Text style={{ color: '#fff', fontSize: 22 * theme.fontScale, fontWeight: '600' }}>{user?.name?.[0]?.toUpperCase() ?? 'P'}</Text></View>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={{ color: theme.colors.text, fontFamily: theme.typography.sectionTitle.family, fontSize: 20 * theme.fontScale, flexShrink: 1 }}>{user?.name ?? 'Perfil'}</Text>
            {user?.guest ? <Text style={{ color: theme.colors.blueInk, backgroundColor: theme.colors.tint, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99, fontSize: 10 * theme.fontScale }}>Visitante</Text> : null}
          </View>
          {emailMasked && !user?.guest ? <Text style={{ color: theme.colors.text2, fontSize: 12.5 * theme.fontScale }}>{emailMasked}</Text> : null}
        </View>
      </View>

      <View style={styles.metrics}>
        {[[`${score}%`, 'prontidão'], [`${completedTaskIds.length}/${TASKS.length}`, 'tarefas'], [String(points), 'pontos']].map(([value, title]) => (
          <View key={title} style={[styles.metric, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={{ color: title === 'prontidão' ? theme.ink(theme.statusColor(score)) : theme.colors.text, fontSize: 19 * theme.fontScale, fontWeight: '600', textAlign: 'center' }}>{value}</Text>
            <Text style={{ color: theme.colors.text2, fontSize: 11 * theme.fontScale, textAlign: 'center' }}>{title}</Text>
          </View>
        ))}
      </View>

      <View style={{ gap: 12 }}>
        {label(`CONQUISTAS · ${achievements.filter((a) => a.unlocked).length}/${achievements.length}`)}
        <View style={styles.achievements}>
          {achievements.map((item) => (
            <View key={item.id} accessibilityLabel={`${item.title}, ${item.unlocked ? 'desbloqueada' : 'bloqueada'}`} style={[styles.achievement, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: item.unlocked ? 1 : 0.55 }]}>
              <Icon glyph={item.unlocked ? item.glyph : 'lock'} size={24} color={item.unlocked ? theme.colors.blueInk : theme.colors.text2} />
              <Text style={{ color: theme.colors.text, fontSize: 13 * theme.fontScale, fontWeight: '600' }}>{item.title}</Text>
              <Text style={{ color: theme.colors.text2, fontSize: 11 * theme.fontScale }}>{item.unlocked ? item.description : 'Bloqueada · ' + item.description}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ gap: 10 }}>
        {label('PREFERÊNCIAS')}
        <View style={[styles.preferences, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.preferenceRow}><Text style={{ color: theme.colors.text, fontSize: 15 * theme.fontScale }}>Modo escuro</Text><Switch accessibilityLabel="Modo escuro" value={dark} onValueChange={(value) => setTheme(value ? 'dark' : 'light')} trackColor={{ true: theme.colors.blue }} /></View>
          <View style={styles.preferenceRow}><Text style={{ color: theme.colors.text, fontSize: 15 * theme.fontScale }}>Alto contraste</Text><Switch accessibilityLabel="Alto contraste" value={contrast} onValueChange={toggleContrast} trackColor={{ true: theme.colors.blue }} /></View>
          <Text style={{ color: theme.colors.text, fontSize: 15 * theme.fontScale }}>Tamanho da fonte</Text>
          <View accessibilityRole="radiogroup" style={styles.fontOptions}>
            {FONT_OPTIONS.map(({ key, label: sizeLabel }) => (
              <Pressable key={key} accessibilityRole="radio" accessibilityLabel={`Fonte ${sizeLabel.toLowerCase()}`} accessibilityState={{ checked: font === key }} onPress={() => setFont(key)} style={[styles.fontOption, { backgroundColor: font === key ? theme.colors.blue : theme.colors.surface, borderColor: font === key ? theme.colors.blue : theme.colors.border }]}>
                <Text style={{ color: font === key ? '#fff' : theme.colors.text, fontSize: 12 * theme.fontScale }}>{sizeLabel}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        {label('SUA CONTA')}
        {[
          { text: 'Refazer o teste', glyph: 'plan' as const, action: () => navigation.navigate('Quiz') },
          { text: 'Notificações', glyph: 'bell' as const, action: () => navigation.navigate('Notifications') },
          { text: 'Sair da conta', glyph: 'back' as const, action: confirmLogout },
        ].map(({ text, glyph, action }) => (
          <Pressable key={text} accessibilityRole="button" accessibilityLabel={text} onPress={action} style={[styles.action, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Icon glyph={glyph} size={20} color={text === 'Sair da conta' ? theme.ink(theme.colors.red) : theme.colors.blueInk} />
            <Text style={{ color: text === 'Sair da conta' ? theme.ink(theme.colors.red) : theme.colors.text, fontSize: 14 * theme.fontScale }}>{text}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  metrics: { flexDirection: 'row', gap: 8 },
  metric: { flex: 1, minWidth: 0, paddingVertical: 14, paddingHorizontal: 4, borderWidth: 1, borderRadius: 18, gap: 3 },
  achievements: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achievement: { width: '48%', minHeight: 128, borderWidth: 1, borderRadius: 16, padding: 12, gap: 5 },
  preferences: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 10 },
  preferenceRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fontOptions: { flexDirection: 'row', gap: 8 },
  fontOption: { flex: 1, minHeight: 44, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  action: { minHeight: 52, borderWidth: 1, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 },
});
