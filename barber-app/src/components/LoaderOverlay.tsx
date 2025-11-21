// src/components/LoaderOverlay.tsx
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

interface Props {
  visible: boolean;
  message?: string;
}

export const LoaderOverlay: React.FC<Props> = ({ visible, message }) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color={colors.primary} />
        {message ? <Text style={styles.text}>{message}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    backgroundColor: 'rgba(15,23,42,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  text: {
    marginTop: 8,
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
});
