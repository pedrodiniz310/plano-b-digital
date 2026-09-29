import React, { useEffect, useState } from 'react';
import { Animated, Easing, View, type ViewProps } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useReduceMotion } from './useReduceMotion';

type Props = Omit<ViewProps, 'accessibilityValue'> & {
  value: number;
  max: number;
  color?: string;
  size?: keyof ReturnType<typeof useTheme>['progressHeight'];
};

export function ProgressBar({ value, max, color, size = 'thin', style, ...props }: Props) {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const [progress] = useState(() => new Animated.Value(0));
  const percent = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(percent);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: percent,
      duration: theme.motion.progressMs,
      easing: Easing.bezier(...theme.motion.easing),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [percent, progress, reduceMotion, theme.motion]);

  const height = theme.progressHeight[size];
  return (
    <View {...props} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max, now: value }} style={[{ height, borderRadius: theme.radii.pill, backgroundColor: theme.colors.soft, overflow: 'hidden' }, style]}>
      <Animated.View style={{ height, borderRadius: theme.radii.pill, backgroundColor: color ?? theme.colors.blue, width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
    </View>
  );
}
