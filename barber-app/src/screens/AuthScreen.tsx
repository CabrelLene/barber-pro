// src/screens/AuthScreen.tsx
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { AppBackground } from '../components/AppBackground';
import { AppButton } from '../components/AppButton';
import { AppTextInput } from '../components/AppTextInput';
import { LoaderOverlay } from '../components/LoaderOverlay';
import { colors, radii, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import { login as apiLogin, register as apiRegister } from '../api/auth';

type Mode = 'login' | 'register';

export const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const isLogin = mode === 'login';

  const handleToggleMode = (newMode: Mode) => {
    setMode(newMode);
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!email || !password || (mode === 'register' && !fullName)) {
      setError('Merci de remplir tous les champs obligatoires.');
      return;
    }

    try {
      setSubmitting(true);

      if (isLogin) {
        const data = await apiLogin({ email, password });
        login(data.user, data.accessToken);
      } else {
        const data = await apiRegister({
          email,
          password,
          fullName,
          phone: phone || undefined,
        });
        login(data.user, data.accessToken);
      }
    } catch (err: any) {
      console.error('❌ Erreur AuthScreen:', err?.response?.data || err);
      const msg =
        err?.response?.data?.message ??
        "Une erreur est survenue. Vérifie tes infos ou réessaie.";
      setError(
        Array.isArray(msg)
          ? msg.join('\n')
          : typeof msg === 'string'
          ? msg
          : 'Erreur réseau.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppBackground>
      <LoaderOverlay
        visible={submitting}
        message={isLogin ? 'Connexion en cours...' : 'Création de ton compte...'}
      />

      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        {/* Décors de fond géométriques (sans cercles) */}
        <View style={styles.bgShapeTop} pointerEvents="none" />
        <View style={styles.bgShapeBottom} pointerEvents="none" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* BARRE DE MARQUE / “NAV” */}
          <View style={styles.brandRow}>
            <View style={styles.brandLeft}>
              <View style={styles.brandLogo}>
                <Ionicons name="cut-outline" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.brandTitle}>Barber Connect</Text>
                <Text style={styles.brandSubtitle}>
                  Réservation de barbers • Québec
                </Text>
              </View>
            </View>

            <View style={styles.brandRightChip}>
              <Ionicons
                name="shield-checkmark-outline"
                size={14}
                color="#bbf7d0"
              />
              <Text style={styles.brandRightText}>Connexion sécurisée</Text>
            </View>
          </View>

          {/* HERO : Lottie + storytelling */}
          <View style={styles.heroWrapper}>
            <View style={styles.heroAccentBar} />
            <View style={styles.heroCard}>
              <View style={styles.heroLeft}>
                <Text style={styles.heroTagline}>Barbers de quartier, UX premium</Text>
                <Text style={styles.heroTitle}>
                  Ta coupe est{' '}
                  <Text style={styles.heroTitleAccent}>déjà réservée</Text>{' '}
                  avant d’entrer dans le shop.
                </Text>
                <Text style={styles.heroText}>
                  Crée ton compte, choisis un barber, bloque ton créneau, paie et
                  laisse un avis. L’app gère le reste.
                </Text>

                <View style={styles.heroBadgesRow}>
                  <View style={styles.heroBadge}>
                    <Ionicons
                      name="flash-outline"
                      size={14}
                      color={colors.primary}
                    />
                    <Text style={styles.heroBadgeText}>Réservation instantanée</Text>
                  </View>
                  <View style={styles.heroBadge}>
                    <Ionicons
                      name="people-outline"
                      size={14}
                      color="#a5b4fc"
                    />
                    <Text style={styles.heroBadgeText}>Barbers vérifiés</Text>
                  </View>
                </View>
              </View>

              <View style={styles.heroRight}>
                <View style={styles.heroLottieShadow} />
                <View style={styles.heroLottieCard}>
                  <LottieView
                    source={require('../../assets/lottie/barber-login.json')}
                    autoPlay
                    loop
                    style={styles.heroLottie}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* STEPPER “COMMENT ÇA MARCHE ?” */}
          <View style={styles.stepsWrapper}>
            <Text style={styles.stepsTitle}>Comment ça marche ?</Text>
            <View style={styles.stepsRow}>
              <View style={styles.stepCard}>
                <View style={styles.stepIconCircle}>
                  <Ionicons
                    name="person-outline"
                    size={16}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.stepTitle}>1. Crée ton profil</Text>
                <Text style={styles.stepText}>
                  Quelques infos, un mot de passe, et ton espace client est prêt.
                </Text>
              </View>
              <View style={styles.stepCard}>
                <View style={styles.stepIconCircle}>
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={'#38bdf8'}
                  />
                </View>
                <Text style={styles.stepTitle}>2. Choisis un barber</Text>
                <Text style={styles.stepText}>
                  Recherche par ville / code postal, filtre par note et services.
                </Text>
              </View>
              <View style={styles.stepCard}>
                <View style={styles.stepIconCircle}>
                  <Ionicons name="calendar-outline" size={16} color={'#facc15'} />
                </View>
                <Text style={styles.stepTitle}>3. Réserve et note</Text>
                <Text style={styles.stepText}>
                  Bloque un créneau, paie, puis laisse un avis après la coupe.
                </Text>
              </View>
            </View>
          </View>

          {/* FORMULAIRE : LOGIN / REGISTER */}
          <View style={styles.formWrapper}>
            <View style={styles.formCard}>
              {/* Tabs Connexion / Nouveau compte */}
              <View style={styles.modeTabs}>
                <TouchableOpacity
                  style={[styles.modeTab, isLogin && styles.modeTabActive]}
                  onPress={() => handleToggleMode('login')}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.modeTabText,
                      isLogin && styles.modeTabTextActive,
                    ]}
                  >
                    Connexion
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeTab, !isLogin && styles.modeTabActive]}
                  onPress={() => handleToggleMode('register')}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.modeTabText,
                      !isLogin && styles.modeTabTextActive,
                    ]}
                  >
                    Nouveau compte
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>
                  {isLogin
                    ? 'Content de te revoir 👋'
                    : 'On prépare tes futures coupes 💺'}
                </Text>
                <Text style={styles.formSubtitle}>
                  {isLogin
                    ? 'Connecte-toi pour retrouver tes réservations et booker ta prochaine coupe en quelques secondes.'
                    : 'En créant ton compte, tu pourras réserver, payer en ligne et suivre l’historique de tes visites.'}
                </Text>
              </View>

              {/* Inputs avec icônes intégrées */}
              <View style={styles.inputsGroup}>
                {!isLogin && (
                  <View style={styles.inputBlock}>
                    <Text style={styles.inputLabel}>Nom complet</Text>
                    <View style={styles.inputRow}>
                      <View style={styles.inputIcon}>
                        <Ionicons
                          name="person-outline"
                          size={16}
                          color={colors.textSubtle}
                        />
                      </View>
                      <View style={styles.inputDivider} />
                      <View style={styles.inputFieldWrapper}>
                        <AppTextInput
                          label=""
                          placeholder="Ex : Jordan Fade"
                          value={fullName}
                          onChangeText={setFullName}
                          autoCapitalize="words"
                        />
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.inputBlock}>
                  <Text style={styles.inputLabel}>Adresse e-mail</Text>
                  <View style={styles.inputRow}>
                    <View style={styles.inputIcon}>
                      <Ionicons
                        name="mail-outline"
                        size={16}
                        color={colors.textSubtle}
                      />
                    </View>
                    <View style={styles.inputDivider} />
                    <View style={styles.inputFieldWrapper}>
                      <AppTextInput
                        label=""
                        placeholder="toi@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                      />
                    </View>
                  </View>
                </View>

                {!isLogin && (
                  <View style={styles.inputBlock}>
                    <Text style={styles.inputLabel}>Téléphone (optionnel)</Text>
                    <View style={styles.inputRow}>
                      <View style={styles.inputIcon}>
                        <Ionicons
                          name="call-outline"
                          size={16}
                          color={colors.textSubtle}
                        />
                      </View>
                      <View style={styles.inputDivider} />
                      <View style={styles.inputFieldWrapper}>
                        <AppTextInput
                          label=""
                          placeholder="514..."
                          keyboardType="phone-pad"
                          value={phone}
                          onChangeText={setPhone}
                        />
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.inputBlock}>
                  <Text style={styles.inputLabel}>Mot de passe</Text>
                  <View style={styles.inputRow}>
                    <View style={styles.inputIcon}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={16}
                        color={colors.textSubtle}
                      />
                    </View>
                    <View style={styles.inputDivider} />
                    <View style={styles.inputFieldWrapper}>
                      <AppTextInput
                        label=""
                        placeholder="••••••••"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <AppButton
                title={isLogin ? 'Se connecter' : 'Créer mon compte'}
                onPress={handleSubmit}
                loading={submitting}
                style={styles.submitButton}
              />

              <View style={styles.securityRow}>
                <View style={styles.securityPill}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={13}
                    color="#6ee7b7"
                  />
                  <Text style={styles.securityPillText}>Chiffrement actif</Text>
                </View>
                <Text style={styles.securityText}>
                  Tes infos restent côté Barber Connect. Les barbers ne voient que
                  ce qui est nécessaire pour la réservation.
                </Text>
              </View>

              {isLogin ? (
                <Text style={styles.helperText}>
                  Pas encore de compte ?{' '}
                  <Text
                    style={styles.helperLink}
                    onPress={() => handleToggleMode('register')}
                  >
                    Crée ton profil en 30 secondes.
                  </Text>
                </Text>
              ) : (
                <Text style={styles.helperText}>
                  Déjà inscrit ?{' '}
                  <Text
                    style={styles.helperLink}
                    onPress={() => handleToggleMode('login')}
                  >
                    Reviens à la connexion.
                  </Text>
                </Text>
              )}
            </View>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Barber Connect • 2025 • Barbers de quartier, expérience haut de gamme.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 40,
    paddingBottom: 32,
  },

  // BACKGROUND SHAPES (sans cercles, vibes diagonales)
  bgShapeTop: {
    position: 'absolute',
    top: -40,
    right: -100,
    width: 260,
    height: 160,
    backgroundColor: 'rgba(56,189,248,0.18)',
    transform: [{ rotate: '-14deg' }],
  },
  bgShapeBottom: {
    position: 'absolute',
    bottom: -80,
    left: -120,
    width: 280,
    height: 180,
    backgroundColor: 'rgba(129,140,248,0.18)',
    transform: [{ rotate: '11deg' }],
  },

  // BRAND / NAV
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.7)',
    marginRight: 10,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  brandSubtitle: {
    fontSize: 11,
    color: colors.textSubtle,
  },
  brandRightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#022c22',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  brandRightText: {
    marginLeft: 6,
    fontSize: 11,
    color: '#bbf7d0',
    fontWeight: '600',
  },

  // HERO
  heroWrapper: {
    marginBottom: spacing.lg,
  },
  heroAccentBar: {
    position: 'absolute',
    left: -16,
    right: -16,
    top: 18,
    height: 24,
    borderRadius: 999,
    backgroundColor: 'rgba(15,23,42,0.7)',
    borderWidth: 0.5,
    borderColor: 'rgba(148,163,184,0.35)',
    opacity: 0.8,
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(15,23,42,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
    padding: spacing.lg,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 16,
  },
  heroLeft: {
    flex: 1.4,
    paddingRight: spacing.md,
  },
  heroTagline: {
    fontSize: 11,
    color: colors.textSubtle,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  heroTitleAccent: {
    color: colors.primary,
  },
  heroText: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  heroBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.6)',
    marginRight: 6,
    marginBottom: 4,
  },
  heroBadgeText: {
    marginLeft: 6,
    fontSize: 11,
    color: colors.textSubtle,
  },
  heroRight: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  heroLottieShadow: {
    position: 'absolute',
    width: 120,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(15,23,42,0.9)',
    bottom: 10,
    alignSelf: 'center',
    opacity: 0.7,
  },
  heroLottieCard: {
    width: 130,
    height: 130,
    borderRadius: 28,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLottie: {
    width: 110,
    height: 110,
  },

  // STEPS
  stepsWrapper: {
    marginBottom: spacing.md,
  },
  stepsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  stepsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stepCard: {
    flex: 1,
    minWidth: '30%',
    borderRadius: 16,
    padding: spacing.sm,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
    marginRight: 8,
    marginBottom: 8,
  },
  stepIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.7)',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  stepText: {
    fontSize: 11,
    color: colors.textSubtle,
  },

  // FORM
  formWrapper: {
    marginTop: spacing.sm,
  },
  formCard: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    backgroundColor: 'rgba(15,23,42,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.45)',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 18 },
    elevation: 14,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#020617',
    borderRadius: radii.full,
    padding: 3,
    borderWidth: 1,
    borderColor: '#111827',
    marginBottom: spacing.lg,
  },
  modeTab: {
    flex: 1,
    borderRadius: radii.full,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTabActive: {
    backgroundColor: '#0f172a',
  },
  modeTabText: {
    fontSize: 13,
    color: colors.textSubtle,
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: colors.text,
  },
  formHeader: {
    marginBottom: spacing.md,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  formSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
  },

  inputsGroup: {
    marginTop: spacing.sm,
  },
  inputBlock: {
    marginBottom: spacing.sm,
  },
  inputLabel: {
    fontSize: 12,
    color: colors.textSubtle,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.7)',
    backgroundColor: 'rgba(15,23,42,0.97)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  inputIcon: {
    width: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(55,65,81,0.9)',
    marginHorizontal: 6,
  },
  inputFieldWrapper: {
    flex: 1,
  },

  error: {
    marginTop: 6,
    color: colors.danger,
    fontSize: 12,
  },
  submitButton: {
    marginTop: spacing.md,
  },

  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#022c22',
    marginRight: 6,
  },
  securityPillText: {
    marginLeft: 4,
    fontSize: 10,
    color: '#6ee7b7',
    fontWeight: '600',
  },
  securityText: {
    flex: 1,
    fontSize: 11,
    color: colors.textSubtle,
  },

  helperText: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.textSubtle,
    textAlign: 'center',
  },
  helperLink: {
    color: colors.primary,
    fontWeight: '600',
  },

  // FOOTER
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: colors.textSubtle,
    textAlign: 'center',
  },
});
