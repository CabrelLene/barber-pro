// src/components/AppBackground.tsx
import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const AppBackground: React.FC<Props> = ({ children, style }) => {
  return (
    <View style={styles.root}>
      {/* Gradient principal */}
      <LinearGradient
        colors={['#020617', '#020617', '#020617']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBase}
      />

      {/* Halo indigo en haut à gauche */}
      <View style={styles.glowTopLeft} />

      {/* Halo cyan en haut à droite */}
      <View style={styles.glowTopRight} />

      {/* Halo magenta en bas */}
      <View style={styles.glowBottom} />

      {/* Film glass pour un effet légèrement “frosted” */}
      <View style={styles.glassOverlay} />

      {/* Contenu de l’écran */}
      <View style={[styles.content, style]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background ?? '#020617',
  },
  gradientBase: {
    ...StyleSheet.absoluteFillObject,
  },

  // Halos / glows
  glowTopLeft: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(129, 140, 248, 0.45)', // indigo
    opacity: 0.9,
    transform: [{ rotate: '-8deg' }],
  },
  glowTopRight: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(56, 189, 248, 0.4)', // cyan
    opacity: 0.85,
    transform: [{ rotate: '10deg' }],
  },
  glowBottom: {
    position: 'absolute',
    bottom: -120,
    left: -40,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(244, 114, 182, 0.35)', // rose
    opacity: 0.8,
  },

  // Overlay glass léger pour adoucir les halos
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
  },

  content: {
    flex: 1,
  },
});
