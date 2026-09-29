import React from 'react';
import { Text, View, type ViewProps } from 'react-native';
import { Icon } from '../theme/Icon';
import type { GlyphKey } from '../theme/icons';
import { useTheme } from '../theme/ThemeProvider';

type Props = ViewProps & { label: string; color: string; glyph: GlyphKey; size?: 'small' | 'regular' };

export function Badge({ label, color, glyph, size = 'small', style, ...props }: Props) {
  const theme = useTheme();
  return (
    <View {...props} style={[{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: theme.radii.pill, backgroundColor: theme.colors.soft }, style]}>
      <Icon glyph={glyph} size={size === 'small' ? 12 : 14} color={theme.ink(color)} />
      <Text style={{ color: theme.ink(color), fontFamily: theme.typography.listItem.family, fontSize: (size === 'small' ? theme.typography.sectionLabel.size : theme.typography.secondary.size) * theme.fontScale }}>{label}</Text>
    </View>
  );
}
