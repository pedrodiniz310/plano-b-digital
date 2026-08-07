import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Icon } from '../theme/Icon';
import { useTheme } from '../theme/ThemeProvider';

export interface TextFieldProps extends Pick<TextInputProps, 'value' | 'onChangeText' | 'placeholder' | 'keyboardType' | 'autoCapitalize'> {
  label: string;
  error?: string;
  secure?: boolean;
}

export function TextField({ label, error, secure, ...inputProps }: TextFieldProps) {
  const theme = useTheme();
  const [reveal, setReveal] = useState(false);
  const borderColor = error ? theme.colors.red : theme.colors.border;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: theme.colors.text2, fontFamily: theme.typography.secondary.family }]}>
        {label}
      </Text>
      <View
        style={[
          styles.fieldRow,
          { height: theme.heights.field, borderRadius: theme.radii.field, borderColor, backgroundColor: theme.colors.surface },
        ]}
      >
        <TextInput
          {...inputProps}
          secureTextEntry={secure && !reveal}
          placeholderTextColor={theme.colors.text2}
          style={[styles.input, { color: theme.colors.text, fontFamily: theme.typography.body.family }]}
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={reveal ? 'Ocultar senha' : 'Mostrar senha'}
            onPress={() => setReveal((v) => !v)}
            style={styles.eyeButton}
          >
            <Icon glyph={reveal ? 'eyeOff' : 'eye'} size={20} color={theme.colors.text2} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View style={styles.errorRow}>
          <Icon glyph="alert" size={14} color={theme.colors.red} />
          <Text style={[styles.errorText, { color: theme.colors.red }]}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', gap: 6 },
  label: { fontSize: 13 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, paddingHorizontal: 16 },
  input: { flex: 1, fontSize: 15 },
  eyeButton: { padding: 4 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorText: { fontSize: 12 },
});
