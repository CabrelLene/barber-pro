// src/components/AppTextInput.tsx
import React from 'react';
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { colors, radii, spacing } from '../theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

export const AppTextInput: React.FC<Props> = ({
  label,
  error,
  style,
  ...rest
}) => {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={colors.textSubtle}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: 4,
    color: colors.text,
    fontSize: 13,
  },
  input: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
    fontSize: 14,
    backgroundColor: '#020617',
  },
  error: {
    marginTop: 4,
    color: colors.danger,
    fontSize: 12,
  },
});
