// src/components/AppButton.tsx
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { colors, radii, spacing } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface AppButtonProps {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#020617' : colors.text}
        />
      ) : (
        <Text
          style={[
            styles.textBase,
            variant === 'primary' && styles.textPrimary,
            (variant === 'secondary' || variant === 'ghost') &&
              styles.textSecondary,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.full,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    // pas de `gap` ici pour éviter les warnings TS
    minHeight: 44,
  },
  primary: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.9)',
    shadowColor: '#38bdf8',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  secondary: {
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.7)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  textBase: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textPrimary: {
    color: '#020617',
  },
  textSecondary: {
    color: colors.text,
  },
});
