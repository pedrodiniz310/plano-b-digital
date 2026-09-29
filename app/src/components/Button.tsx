import React from 'react';
import { PressableFeedback } from './PressableFeedback';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'dashed';
  disabled?: boolean;
  loading?: boolean;
}

export function Button({ label, onPress, variant = 'primary', disabled, loading }: ButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';
  const isDashed = variant === 'dashed';

  return (
    <PressableFeedback
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        {
          height: isPrimary ? theme.heights.buttonPrimary : theme.heights.buttonSecondary,
          borderRadius: theme.radii.field,
          backgroundColor: isPrimary ? theme.colors.blue : 'transparent',
          borderWidth: isPrimary ? 0 : 1.5,
          borderStyle: isDashed ? 'dashed' : 'solid',
          borderColor: theme.colors.border,
          opacity: disabled ? 0.5 : 1,
        },
        isPrimary ? theme.shadow.primaryButton : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? theme.colors.onPrimary : theme.colors.text} />
      ) : (
        <Text
          style={{
            color: isPrimary ? theme.colors.onPrimary : theme.colors.text,
            fontFamily: theme.typography.listItem.family,
            fontSize: theme.typography.listItem.size * theme.fontScale,
          }}
        >
          {label}
        </Text>
      )}
    </PressableFeedback>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', width: '100%' },
});
