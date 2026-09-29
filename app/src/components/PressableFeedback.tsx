import React, { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useReduceMotion } from './useReduceMotion';

type Props = Omit<PressableProps, 'style'> & { style?: StyleProp<ViewStyle> };
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressableFeedback({ style, onPressIn, onPressOut, disabled, ...props }: Props) {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const [scale] = useState(() => new Animated.Value(1));
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reduceMotion || disabled) {
      scale.stopAnimation();
      opacity.stopAnimation();
      scale.setValue(1);
      opacity.setValue(1);
    }
  }, [disabled, opacity, reduceMotion, scale]);

  function animate(pressed: boolean) {
    if (reduceMotion || disabled) return;
    const easing = Easing.bezier(...theme.motion.easing);
    Animated.parallel([
      Animated.timing(scale, { toValue: pressed ? 0.97 : 1, duration: theme.motion.pressMs, easing, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: pressed ? 0.9 : 1, duration: theme.motion.pressMs, easing, useNativeDriver: true }),
    ]).start();
  }

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPressIn={(event) => { animate(true); onPressIn?.(event); }}
      onPressOut={(event) => { animate(false); onPressOut?.(event); }}
      style={[{ minHeight: theme.heights.minTouchTarget, minWidth: theme.heights.minTouchTarget }, style, { opacity, transform: [{ scale }] }]}
    />
  );
}
