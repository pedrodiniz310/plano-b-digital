import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Icon } from '../../theme/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { ONBOARDING_SLIDES } from '../../content/onboarding';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const slide = ONBOARDING_SLIDES[index];
  const isLast = index === ONBOARDING_SLIDES.length - 1;

  const skip = () => navigation.replace('Auth', { mode: 'login' });
  const next = () => {
    if (!isLast) setIndex((i) => i + 1);
    else navigation.replace('Auth', { mode: 'signup' });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg, paddingTop: theme.spacing.screenTop }]}>
      <View style={[styles.header, { paddingHorizontal: theme.spacing.marginX }]}>
        <View style={styles.dots}>
          {ONBOARDING_SLIDES.map((s, i) => (
            <View
              key={s.chip}
              style={[
                styles.dot,
                {
                  width: i === index ? 26 : 6,
                  backgroundColor: i === index ? slide.accent : theme.colors.border,
                },
              ]}
            />
          ))}
        </View>
        <Pressable accessibilityRole="button" onPress={skip}>
          <Text style={[styles.skip, { color: theme.colors.text2 }]}>Pular introdução</Text>
        </Pressable>
      </View>

      <View style={styles.illustrationWrap}>
        <View style={[styles.illustrationRing, { borderColor: slide.accent }]} />
        <View style={[styles.illustrationCircle, { backgroundColor: slide.tint, shadowColor: slide.glow }]}>
          <Icon glyph={slide.glyph} size={64} color={slide.accent} strokeWidth={1.6} />
        </View>
      </View>

      <View style={[styles.body, { paddingHorizontal: theme.spacing.marginX }]}>
        <Text style={[styles.chip, { color: slide.accent, backgroundColor: slide.tint }]}>{slide.chip.toUpperCase()}</Text>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.screenTitle.family }]}>
          {slide.title}
        </Text>
        <Text style={[styles.description, { color: theme.colors.text2, fontFamily: theme.typography.body.family }]}>
          {slide.description}
        </Text>
      </View>

      <View style={[styles.footer, { paddingHorizontal: theme.spacing.marginX }]}>
        <Button label={isLast ? 'Começar' : 'Continuar'} onPress={next} />
        {isLast ? (
          <Pressable accessibilityRole="button" onPress={() => navigation.replace('Auth', { mode: 'login' })}>
            <Text style={[styles.haveplan, { color: theme.colors.blueInk }]}>Já tenho um plano</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { height: 6, borderRadius: 3 },
  skip: { fontSize: 13 },
  illustrationWrap: { alignItems: 'center', justifyContent: 'center', height: 236, marginTop: 24 },
  illustrationRing: { position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 1.5, borderStyle: 'dashed', opacity: 0.4 },
  illustrationCircle: {
    width: 148,
    height: 148,
    borderRadius: 74,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 4,
  },
  body: { marginTop: 32, gap: 12 },
  chip: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    overflow: 'hidden',
  },
  title: { fontSize: 26, lineHeight: 32, letterSpacing: -0.4 },
  description: { fontSize: 15, lineHeight: 23 },
  footer: { marginTop: 'auto', marginBottom: 32, gap: 16, alignItems: 'center' },
  haveplan: { fontSize: 14, fontWeight: '500' },
});
