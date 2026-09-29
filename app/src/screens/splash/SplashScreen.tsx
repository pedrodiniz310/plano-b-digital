import React, { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
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
  const [ripple] = useState(() => new Animated.Value(0));
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(ripple, { toValue: 1, duration: 3400, easing: Easing.out(Easing.ease), useNativeDriver: true })
    );
    loop.start();
    Animated.timing(progress, { toValue: 1, duration: AUTO_ADVANCE_MS, easing: Easing.linear, useNativeDriver: false }).start();

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
      loop.stop();
      active = false;
      clearTimeout(timer);
      unsubscribeHydration();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só deve rodar uma vez no boot da tela.
  }, []);

  const rippleScale = ripple.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] });
  const rippleOpacity = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });
  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.badgeWrap}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ripple,
            { borderColor: theme.colors.blue, opacity: rippleOpacity, transform: [{ scale: rippleScale }] },
          ]}
        />
        <View style={[styles.badge, { backgroundColor: theme.colors.deep }]}>
          <Icon glyph="shield" size={44} color="#fff" strokeWidth={1.8} />
        </View>
      </View>

      <Text style={[styles.wordmark, { color: theme.colors.deep, fontFamily: theme.typography.displaySplash.family }]}>
        Plano B Digital
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.text2, fontFamily: theme.typography.body.family }]}>
        Prepare-se antes que aconteça
      </Text>

      <View style={styles.footer}>
        <View style={[styles.progressTrack, { backgroundColor: theme.colors.soft }]}>
          <Animated.View style={[styles.progressFill, { backgroundColor: theme.colors.green, width: barWidth }]} />
        </View>
        <View style={styles.privacyRow}>
          <Icon glyph="lock" size={14} color={theme.colors.text2} />
          <Text style={[styles.privacyText, { color: theme.colors.text2, fontFamily: theme.typography.secondary.family }]}>
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
  ripple: { position: 'absolute', width: 96, height: 96, borderRadius: 48, borderWidth: 2 },
  badge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: { fontSize: 31, letterSpacing: -0.9 },
  subtitle: { fontSize: 15, marginTop: 8 },
  footer: { position: 'absolute', bottom: 62, alignItems: 'center', gap: 14, width: 200 },
  progressTrack: { width: 120, height: 3, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 3, borderRadius: 2 },
  privacyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  privacyText: { fontSize: 12 },
});
