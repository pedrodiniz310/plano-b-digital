import React, { useEffect, useState } from 'react';
import { radii } from '../../theme/tokens';
import { PressableFeedback } from '../../components/PressableFeedback';
import { useReduceMotion } from '../../components/useReduceMotion';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Icon } from '../../theme/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { ONBOARDING_SLIDES } from '../../content/onboarding';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const [orbit] = useState(() => new Animated.Value(0));
  const [index, setIndex] = useState(0);
  const slide = ONBOARDING_SLIDES[index];
  const isLast = index === ONBOARDING_SLIDES.length - 1;
  const accent = theme.name === 'dark' ? [theme.colors.blue, theme.colors.blueInk, theme.colors.green, theme.colors.amber][index] : slide.accent;
  const tint = theme.name === 'dark' ? theme.colors.soft : slide.tint;

  useEffect(() => {
    if (reduceMotion) {
      orbit.stopAnimation();
      orbit.setValue(0);
      return;
    }
    const animation = Animated.loop(Animated.timing(orbit, { toValue: 1, duration: theme.motion.onboardingOrbitMs, easing: Easing.linear, useNativeDriver: true }));
    animation.start();
    return () => animation.stop();
  }, [orbit, reduceMotion, theme.motion]);

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
                  backgroundColor: i === index ? accent : theme.colors.border,
                },
              ]}
            />
          ))}
        </View>
        <PressableFeedback accessibilityRole="button" onPress={skip} style={styles.textAction}>
          <Text style={{ fontSize: theme.typography.secondary.size * theme.fontScale, color: theme.colors.text2 }}>Pular introdução</Text>
        </PressableFeedback>
      </View>

      <View style={styles.illustrationWrap}>
        <Animated.View style={[styles.illustrationRing, { borderColor: accent, transform: [{ rotate: orbit.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]} />
        <View style={[styles.illustrationCircle, { backgroundColor: tint, shadowColor: theme.name === 'dark' ? accent : slide.glow }]}>
          <Icon glyph={slide.glyph} size={64} color={accent} strokeWidth={1.6} />
        </View>
      </View>

      <View style={[styles.body, { paddingHorizontal: theme.spacing.marginX }]}>
        <Text style={[styles.chip, { fontSize: theme.typography.sectionLabel.size * theme.fontScale, color: theme.ink(accent), backgroundColor: tint }]}>{slide.chip.toUpperCase()}</Text>
        <Text style={[styles.title, { fontSize: theme.typography.screenTitle.size * theme.fontScale, lineHeight: 32 * theme.fontScale, color: theme.colors.text, fontFamily: theme.typography.screenTitle.family }]}>
          {slide.title}
        </Text>
        <Text style={{ fontSize: theme.typography.body.size * theme.fontScale, lineHeight: 23 * theme.fontScale, color: theme.colors.text2, fontFamily: theme.typography.body.family }}>
          {slide.description}
        </Text>
      </View>

      <View style={[styles.footer, { paddingHorizontal: theme.spacing.marginX }]}>
        <Button label={isLast ? 'Começar' : 'Continuar'} onPress={next} />
        {isLast ? (
          <PressableFeedback accessibilityRole="button" onPress={() => navigation.replace('Auth', { mode: 'login' })} style={styles.textAction}>
            <Text style={[styles.haveplan, { fontSize: theme.typography.bodySmall.size * theme.fontScale, color: theme.colors.blueInk }]}>Já tenho um plano</Text>
          </PressableFeedback>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  textAction: { minHeight: 44, justifyContent: 'center' },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { height: 6, borderRadius: radii.pill },
  illustrationWrap: { alignItems: 'center', justifyContent: 'center', height: 236, marginTop: 24 },
  illustrationRing: { position: 'absolute', width: 200, height: 200, borderRadius: radii.pill, borderWidth: 1.5, borderStyle: 'dashed', opacity: 0.4 },
  illustrationCircle: {
    width: 148,
    height: 148,
    borderRadius: radii.pill,
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
    fontWeight: '600',
    letterSpacing: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  title: { letterSpacing: -0.4 },
  footer: { marginTop: 'auto', marginBottom: 32, gap: 16, alignItems: 'center' },
  haveplan: { fontWeight: '500' },
});
