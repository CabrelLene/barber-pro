// src/components/AppTextInput.tsx
import React, { useState } from 'react';
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
  const [focused, setFocused] = useState(false);

  const showError = !!error;

  return (
    <View style={styles.wrapper}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {showError && <Text style={styles.labelError}>• Erreur</Text>}
        </View>
      ) : null}

      <View
        style={[
          styles.inputOuter,
          focused && !showError && styles.inputOuterFocused,
          showError && styles.inputOuterError,
        ]}
      >
        <TextInput
          style={[styles.inputInner, style]}
          placeholderTextColor={colors.textSubtle}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus && rest.onFocus(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur && rest.onBlur(e);
          }}
          {...rest}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  labelError: {
    fontSize: 11,
    color: colors.danger,
  },
  inputOuter: {
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.55)',
    backgroundColor: 'rgba(15,23,42,0.96)',
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  inputOuterFocused: {
    borderColor: colors.primary,
    shadowColor: '#38bdf8',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  inputOuterError: {
    borderColor: colors.danger,
    shadowColor: '#fb7185',
    shadowOpacity: 0.5,
  },
  inputInner: {
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: 14,
  },
  error: {
    marginTop: 4,
    color: colors.danger,
    fontSize: 12,
  },
});
