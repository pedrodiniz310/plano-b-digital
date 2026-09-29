import React from 'react';
import { Text, type TextProps } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function SectionTitle({ style, ...props }: TextProps) {
  const theme = useTheme();
  const type = theme.typography.sectionLabel;
  return <Text {...props} accessibilityRole="header" style={[{ color: theme.colors.text2, fontFamily: type.family, fontSize: type.size * theme.fontScale, lineHeight: type.size * type.lineHeight * theme.fontScale, letterSpacing: type.tracking * type.size }, style]} />;
}
