import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Icon } from '../../theme/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppStore } from '../../state/store';
import type { RootStackParamList } from '../../navigation/types';
import type { GlyphKey } from '../../theme/icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Ready'>;

const NEXT_STEPS: { title: string; description: string; glyph: GlyphKey }[] = [
  { title: 'Resultado personalizado', description: 'Sua pontuação de prontidão e os riscos prioritários', glyph: 'clock' },
  { title: 'Seu Plano B', description: 'Tarefas organizadas por aparelho, e-mail, contas e finanças', glyph: 'plan' },
  { title: 'Simulações e emergência', description: 'Treine agora para saber o que fazer na hora certa', glyph: 'play' },
];

function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!domain) return '';
  return `${name.slice(0, 2)}${'•'.repeat(Math.max(3, name.length - 2))}@${domain}`;
}

export function ReadyScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const name = user?.name ?? 'visitante';
  const email = maskEmail(user?.email ?? '');

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
        <View style={[styles.avatar, { backgroundColor: theme.colors.deep }]}>
          <Text style={[styles.avatarText, { fontSize: 19 * theme.fontScale }]}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.headerCopy}>
          <Text style={{ color: theme.colors.text, fontFamily: theme.typography.sectionTitle.family, fontSize: 16.5 * theme.fontScale, lineHeight: 24 * theme.fontScale }}>
            Tudo pronto, {name}
          </Text>
          {email ? <Text numberOfLines={1} style={[styles.email, { color: theme.colors.text2, fontSize: 12.5 * theme.fontScale }]}>{email}</Text> : null}
        </View>
        {user?.guest ? (
          <Text style={[styles.guestBadge, { backgroundColor: theme.colors.tint, color: theme.colors.blueInk, fontSize: 10.5 * theme.fontScale }]}>Visitante</Text>
        ) : null}
      </View>

      <View style={[styles.introCard, { backgroundColor: theme.colors.deep }]}>
        <Text style={[styles.eyebrow, { fontSize: 10 * theme.fontScale }]}>PRIMEIRO PASSO</Text>
        <Text style={[styles.cardTitle, { fontFamily: theme.typography.screenTitle.family, fontSize: 24 * theme.fontScale, lineHeight: 30 * theme.fontScale }]}>Teste de Prontidão Digital</Text>
        <Text style={[styles.cardDescription, { fontFamily: theme.typography.secondary.family, fontSize: 14 * theme.fontScale, lineHeight: 23 * theme.fontScale }]}>
          Responda algumas perguntas para descobrir o quanto você está preparado para recuperar sua vida digital.
        </Text>
        <View style={styles.facts}>
          {([['10', 'perguntas'], ['3 min', 'duração'], ['5', 'áreas']] as const).map(([value, label]) => (
            <View key={label} style={styles.fact}>
              <Text style={[styles.factValue, { fontSize: 15 * theme.fontScale }]}>{value}</Text>
              <Text style={[styles.factLabel, { fontSize: 10.5 * theme.fontScale }]}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.nextSection}>
        <Text style={[styles.sectionLabel, { color: theme.colors.text2, fontSize: 10 * theme.fontScale }]}>O QUE VEM DEPOIS</Text>
        {NEXT_STEPS.map((step) => (
          <View key={step.title} style={[styles.step, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={[styles.stepIcon, { backgroundColor: theme.colors.tint }]}>
              <Icon glyph={step.glyph} size={19} color={theme.colors.blueInk} />
            </View>
            <View style={styles.stepCopy}>
              <Text style={{ color: theme.colors.text, fontFamily: theme.typography.listItem.family, fontSize: 14 * theme.fontScale, lineHeight: 20 * theme.fontScale }}>{step.title}</Text>
              <Text style={[styles.stepDescription, { color: theme.colors.text2, fontFamily: theme.typography.secondary.family, fontSize: 12 * theme.fontScale, lineHeight: 18 * theme.fontScale }]}>{step.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button label="Iniciar teste" onPress={() => navigation.navigate('Quiz')} />
        <Button label="Fazer depois" variant="secondary" onPress={() => navigation.replace('MainTabs')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 30 },
  avatar: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '600' },
  headerCopy: { flex: 1, minWidth: 0 },
  email: { marginTop: 3 },
  guestBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99, fontWeight: '600', letterSpacing: 1 },
  introCard: { borderRadius: 24, paddingHorizontal: 24, paddingVertical: 26 },
  eyebrow: { color: 'rgba(234,242,255,.7)', fontWeight: '600', letterSpacing: 2.4, marginBottom: 14 },
  cardTitle: { color: '#fff' },
  cardDescription: { color: 'rgba(234,242,255,.86)', marginTop: 12 },
  facts: { flexDirection: 'row', gap: 8, marginTop: 20 },
  fact: { flex: 1, alignItems: 'center', paddingVertical: 11, paddingHorizontal: 4, borderRadius: 14, backgroundColor: 'rgba(255,255,255,.09)', borderColor: 'rgba(255,255,255,.12)', borderWidth: 1 },
  factValue: { color: '#fff', fontWeight: '600' },
  factLabel: { color: 'rgba(234,242,255,.78)', marginTop: 3 },
  nextSection: { gap: 12, marginTop: 26 },
  sectionLabel: { fontWeight: '600', letterSpacing: 2.4, marginBottom: 2 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15, borderRadius: 18, borderWidth: 1 },
  stepIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  stepCopy: { flex: 1, minWidth: 0 },
  stepDescription: { marginTop: 2 },
  actions: { gap: 10, marginTop: 'auto', paddingTop: 24 },
});
