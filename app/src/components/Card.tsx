import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function Card({ style, ...props }: ViewProps) {
  const theme = useTheme();
  return <View {...props} style={[{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radii.card }, style]} />;
}
