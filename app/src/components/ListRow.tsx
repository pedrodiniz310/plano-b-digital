import React from 'react';
import { StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { PressableFeedback } from './PressableFeedback';

type Props = Omit<PressableProps, 'style'> & { style?: StyleProp<ViewStyle> };

export function ListRow({ style, ...props }: Props) {
  const theme = useTheme();
  return (
    <PressableFeedback
      {...props}
      style={[styles.base, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radii.card, padding: theme.spacing.inset }, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', gap: 13, borderWidth: 1 },
});
