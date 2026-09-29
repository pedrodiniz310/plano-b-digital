import React from 'react';
import { radii, spacing } from '../../theme/tokens';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { SectionTitle } from '../../components/SectionTitle';
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
          <Text style={[styles.avatarText, { fontSize: theme.typography.sectionTitle.size * theme.fontScale }]}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.headerCopy}>
          <Text style={{ color: theme.colors.text, fontFamily: theme.typography.sectionTitle.family, fontSize: theme.typography.compactHeading.size * theme.fontScale, lineHeight: 24 * theme.fontScale }}>
            Tudo pronto, {name}
          </Text>
          {email ? <Text numberOfLines={1} style={[styles.email, { color: theme.colors.text2, fontSize: theme.typography.secondary.size * theme.fontScale }]}>{email}</Text> : null}
        </View>
        {user?.guest ? <Badge label="Visitante" color={theme.colors.blue} glyph="user" style={styles.guestBadge} /> : null}
      </View>

      <View style={[styles.introCard, { backgroundColor: theme.colors.deep }]}>
        <Text style={[styles.eyebrow, { color: theme.colors.onDeepSubtle, fontSize: theme.typography.micro.size * theme.fontScale }]}>PRIMEIRO PASSO</Text>
        <Text style={[styles.cardTitle, { fontFamily: theme.typography.screenTitle.family, fontSize: theme.typography.cardTitle.size * theme.fontScale, lineHeight: 30 * theme.fontScale }]}>Teste de Prontidão Digital</Text>
        <Text style={[styles.cardDescription, { color: theme.colors.onDeepMuted, fontFamily: theme.typography.secondary.family, fontSize: theme.typography.bodySmall.size * theme.fontScale, lineHeight: 23 * theme.fontScale }]}>
          Responda algumas perguntas para descobrir o quanto você está preparado para recuperar sua vida digital.
        </Text>
        <View style={styles.facts}>
          {([['10', 'perguntas'], ['3 min', 'duração'], ['5', 'áreas']] as const).map(([value, label]) => (
            <View key={label} style={[styles.fact, { backgroundColor: theme.colors.onDeepTile, borderColor: theme.colors.onDeepBorder }]}>
              <Text style={[styles.factValue, { fontSize: theme.typography.body.size * theme.fontScale }]}>{value}</Text>
              <Text style={[styles.factLabel, { color: theme.colors.onDeepSubtle, fontSize: theme.typography.sectionLabel.size * theme.fontScale }]}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.nextSection}>
        <SectionTitle style={styles.sectionLabel}>O QUE VEM DEPOIS</SectionTitle>
        {NEXT_STEPS.map((step) => (
          <Card key={step.title} style={styles.step}>
            <View style={[styles.stepIcon, { backgroundColor: theme.colors.tint }]}>
              <Icon glyph={step.glyph} size={19} color={theme.colors.blueInk} />
            </View>
            <View style={styles.stepCopy}>
              <Text style={{ color: theme.colors.text, fontFamily: theme.typography.listItem.family, fontSize: theme.typography.bodySmall.size * theme.fontScale, lineHeight: 20 * theme.fontScale }}>{step.title}</Text>
              <Text style={[styles.stepDescription, { color: theme.colors.text2, fontFamily: theme.typography.secondary.family, fontSize: theme.typography.small.size * theme.fontScale, lineHeight: 18 * theme.fontScale }]}>{step.description}</Text>
            </View>
          </Card>
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
  avatar: { width: 52, height: 52, borderRadius: radii.card, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '600' },
  headerCopy: { flex: 1, minWidth: 0 },
  email: { marginTop: 3 },
  guestBadge: { paddingHorizontal: 10, paddingVertical: 6 },
  introCard: { borderRadius: radii.heroCard, paddingHorizontal: 24, paddingVertical: 26 },
  eyebrow: { fontWeight: '600', letterSpacing: 2.4, marginBottom: 14 },
  cardTitle: { color: '#fff' },
  cardDescription: { marginTop: 12 },
  facts: { flexDirection: 'row', gap: 8, marginTop: 20 },
  fact: { flex: 1, alignItems: 'center', paddingVertical: 11, paddingHorizontal: 4, borderRadius: radii.iconSquare, borderWidth: 1 },
  factValue: { color: '#fff', fontWeight: '600' },
  factLabel: { marginTop: 3 },
  nextSection: { gap: 12, marginTop: 26 },
  sectionLabel: { marginBottom: 2 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15 },
  stepIcon: { width: 38, height: 38, borderRadius: radii.iconSquare, alignItems: 'center', justifyContent: 'center' },
  stepCopy: { flex: 1, minWidth: 0 },
  stepDescription: { marginTop: 2 },
  actions: { gap: spacing.listGap, marginTop: 'auto', paddingTop: 24 },
});
