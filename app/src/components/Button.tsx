import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
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
    <Pressable
      accessibilityRole="button"
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
        <ActivityIndicator color={isPrimary ? '#fff' : theme.colors.text} />
      ) : (
        <Text
          style={{
            color: isPrimary ? '#fff' : theme.colors.text,
            fontFamily: theme.typography.listItem.family,
            fontSize: 15 * theme.fontScale,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', width: '100%' },
});
