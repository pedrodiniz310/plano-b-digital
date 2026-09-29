import React, { useEffect, useState } from 'react';
import { radii } from '../../theme/tokens';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useReduceMotion } from '../../components/useReduceMotion';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon } from '../../theme/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppStore } from '../../state/store';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const AUTO_ADVANCE_MS = 2400;

export function SplashScreen({ navigation }: Props) {
  const theme = useTheme();
  // Identidade estável via useState (não useRef) — Animated.Value não é uma
  // ref de DOM, mas a regra react-hooks/refs trata .current de useRef como
  // inacessível durante o render, o que .interpolate() faria logo abaixo.
  const [ripples] = useState(() => [new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]);
  const [progress] = useState(() => new Animated.Value(0));
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) {
      ripples.forEach((ripple) => ripple.stopAnimation());
      progress.stopAnimation();
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    const loops = ripples.map((ripple, index) => Animated.loop(Animated.sequence([
      Animated.delay(index * theme.motion.splashRippleStaggerMs),
      Animated.timing(ripple, { toValue: 1, duration: theme.motion.splashRippleMs, easing: Easing.bezier(...theme.motion.easing), useNativeDriver: true }),
    ])));
    loops.forEach((loop) => loop.start());
    Animated.timing(progress, { toValue: 1, duration: AUTO_ADVANCE_MS, easing: Easing.linear, useNativeDriver: false }).start();

    return () => {
      loops.forEach((loop) => loop.stop());
      progress.stopAnimation();
    };
  }, [progress, reduceMotion, ripples, theme.motion]);

  useEffect(() => {
    let active = true;
    let unsubscribeHydration = () => {};
    const hydrated = new Promise<void>((resolve) => {
      if (useAppStore.persist.hasHydrated()) resolve();
      else unsubscribeHydration = useAppStore.persist.onFinishHydration(() => resolve());
    });
    let timer: ReturnType<typeof setTimeout>;
    const delay = new Promise<void>((resolve) => { timer = setTimeout(resolve, AUTO_ADVANCE_MS); });
    void Promise.all([hydrated, delay]).then(() => {
      if (!active) return;
      const { obDone, user } = useAppStore.getState();
      if (!obDone) navigation.replace('Onboarding');
      else if (user) navigation.replace('MainTabs');
      else navigation.replace('Auth');
    });

    return () => {
      active = false;
      clearTimeout(timer);
      unsubscribeHydration();
    };
  }, [navigation]);

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.badgeWrap}>
        {!reduceMotion ? ripples.map((ripple, index) => <Animated.View
          key={index}
          pointerEvents="none"
          style={[
            styles.ripple,
            { borderColor: theme.colors.blue, opacity: ripple.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }), transform: [{ scale: ripple.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }] },
          ]}
        />) : null}
        <View style={[styles.badge, { backgroundColor: theme.colors.surface }]}>
          <Icon glyph="shield" size={52} color={theme.colors.blue} strokeWidth={1.8} />
          <Text style={[styles.badgeLetter, { color: theme.colors.blue, fontFamily: theme.typography.sectionTitle.family }]}>B</Text>
        </View>
      </View>

      <Text style={[styles.wordmark, { fontSize: theme.typography.displaySplash.size * theme.fontScale, color: theme.colors.deep, fontFamily: theme.typography.displaySplash.family }]}>
        Plano B Digital
      </Text>
      <Text style={[styles.subtitle, { fontSize: theme.typography.body.size * theme.fontScale, color: theme.colors.text2, fontFamily: theme.typography.body.family }]}>
        Prepare-se antes que aconteça
      </Text>

      <View style={styles.footer}>
        <View style={[styles.progressTrack, { backgroundColor: theme.colors.soft }]}>
          <Animated.View style={[styles.progressFill, { backgroundColor: theme.colors.green, width: barWidth }]} />
        </View>
        <View style={styles.privacyRow}>
          <Icon glyph="lock" size={14} color={theme.colors.text2} />
          <Text style={{ fontSize: theme.typography.small.size * theme.fontScale, color: theme.colors.text2, fontFamily: theme.typography.secondary.family }}>
            Seus dados ficam apenas neste aparelho
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badgeWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  ripple: { position: 'absolute', width: 96, height: 96, borderRadius: radii.pill, borderWidth: 2 },
  badge: {
    width: 88,
    height: 88,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLetter: { position: 'absolute', fontSize: 18, marginTop: 3 },
  wordmark: { letterSpacing: -0.9 },
  subtitle: { marginTop: 8 },
  footer: { position: 'absolute', bottom: 62, alignItems: 'center', gap: 14, width: 200 },
  progressTrack: { width: 120, height: 3, borderRadius: radii.pill, overflow: 'hidden' },
  progressFill: { height: 3, borderRadius: radii.pill },
  privacyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
