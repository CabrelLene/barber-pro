// src/screens/SplashScreen.tsx
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppBackground } from '../components/AppBackground';
import { colors } from '../theme';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Anim d’apparition de tout le splash (Lottie inclus)
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Après 1.5s on redirige vers Auth ou Location
    const timeout = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: user ? 'Location' : 'Auth' }],
      });
    }, 1500);

    return () => clearTimeout(timeout);
  }, [navigation, user, opacity, scale]);

  return (
    <AppBackground>
      {/* LOTTIE PLEIN ÉCRAN */}
      <Animated.View
        style={[
          styles.lottieContainer,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <LottieView
          source={require('../../assets/lottie/bonjour.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      </Animated.View>

      {/* OVERLAY TEXTE (en bas) */}
      <View style={styles.overlay}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>BC</Text>
        </View>
        <Text style={styles.appName}>Barber Connect</Text>
        <Text style={styles.tagline}>
          Réservation de barbers nouvelle génération • Québec
        </Text>
      </View>
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  // Lottie en full screen
  lottieContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },

  // Bandeau texte par-dessus
  overlay: {
    position: 'absolute',
    bottom: 56,
    alignSelf: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.7)',
    backgroundColor: 'rgba(15,23,42,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  tagline: {
    marginTop: 4,
    fontSize: 11,
    color: colors.textMuted,
  },
});
