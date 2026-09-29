import React from 'react';
import { StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from '../theme/Icon';
import type { GlyphKey } from '../theme/icons';
import { useTheme } from '../theme/ThemeProvider';
import { PressableFeedback } from './PressableFeedback';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  glyph: GlyphKey;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({ glyph, accessibilityLabel, style, ...props }: Props) {
  const theme = useTheme();
  return (
    <PressableFeedback
      {...props}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.base, { borderRadius: theme.radii.iconSquare, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, style]}
    >
      <Icon glyph={glyph} size={20} color={theme.colors.text} />
    </PressableFeedback>
  );
}

const styles = StyleSheet.create({
  base: { width: 44, height: 44, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
