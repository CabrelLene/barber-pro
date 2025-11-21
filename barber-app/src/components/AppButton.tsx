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
  style?: StyleProp<ViewStyle>;     // ✅ accepte tableau, undefined, etc.
  textStyle?: StyleProp<TextStyle>; // ✅ idem pour le texte
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
        style, // ✅ tu peux passer un tableau ici sans que TS gueule
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#0f172a' : colors.text} />
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
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.6)',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  textBase: {
    fontSize: 14,
    fontWeight: '600',
  },
  textPrimary: {
    color: '#0f172a',
  },
  textSecondary: {
    color: colors.text,
  },
});
