// src/screens/PaymentScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CardField, useConfirmPayment } from '@stripe/stripe-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../navigation/RootNavigator';
import { createPaymentIntentForBooking } from '../api/bookings';
import { AppBackground } from '../components/AppBackground';
import { LoaderOverlay } from '../components/LoaderOverlay';
import { colors, spacing, radii } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

export const PaymentScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId, amountCents } = route.params;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const { confirmPayment } = useConfirmPayment();

  const amount = (amountCents / 100).toFixed(2);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await createPaymentIntentForBooking(bookingId);
        if (!res.clientSecret) {
          Alert.alert(
            'Erreur',
            'Impossible de créer un paiement pour cette réservation.',
          );
          navigation.goBack();
          return;
        }
        setClientSecret(res.clientSecret);
      } catch (err) {
        console.error(err);
        Alert.alert(
          'Erreur',
          'Erreur lors de l’initialisation du paiement. Vérifie ta connexion.',
        );
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [bookingId, navigation]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handlePay = async () => {
    if (!clientSecret) return;

    setPaying(true);
    try {
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        console.error(error);
        Alert.alert('Paiement refusé', error.message || 'Erreur de paiement');
        return;
      }

      if (paymentIntent && paymentIntent.status === 'Succeeded') {
        Alert.alert('Paiement réussi', 'Ton paiement a été accepté.', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert(
          'Paiement en cours',
          'Le paiement est en cours de traitement.',
        );
      }
    } catch (err) {
      console.error(err);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors du paiement. Réessaie.',
      );
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <AppBackground>
        {/* Glows / décor */}
        <View style={styles.glowTop} />
        <View style={styles.glowRight} />
        <View style={styles.glowBottom} />

        <View style={styles.container}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons
                name="chevron-back"
                size={20}
                color={colors.text}
              />
            </TouchableOpacity>
            <Text style={styles.topTitle}>Paiement</Text>
          </View>

          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>
              Initialisation du paiement sécurisé...
            </Text>
          </View>
        </View>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <LoaderOverlay
        visible={paying}
        message="Traitement du paiement..."
      />

      {/* Glows / décor */}
      <View style={styles.glowTop} />
      <View style={styles.glowRight} />
      <View style={styles.glowBottom} />

      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons
              name="chevron-back"
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
          <View style={styles.topTitleCol}>
            <Text style={styles.topTitle}>Paiement sécurisé</Text>
            <Text style={styles.topSubtitle}>
              Ta réservation est prête, il reste juste le paiement.
            </Text>
          </View>
        </View>

        {/* Carte récap paiement */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeaderRow}>
            <View style={styles.summaryChip}>
              <Ionicons
                name="shield-checkmark"
                size={14}
                color="#6ee7b7"
              />
              <Text style={styles.summaryChipText}>
                Paiement chiffré
              </Text>
            </View>

            <View style={styles.summaryBadge}>
              <Ionicons
                name="logo-usd"
                size={14}
                color="#38bdf8"
              />
              <Text style={styles.summaryBadgeText}>Stripe</Text>
            </View>
          </View>

          <Text style={styles.amountLabel}>Montant à payer</Text>
          <Text style={styles.amountValue}>{amount} $</Text>

          <Text style={styles.summaryText}>
            Le montant sera débité une seule fois.  
            La réservation sera automatiquement marquée comme payée.
          </Text>

          <View style={styles.summaryMetaRow}>
            <View style={styles.metaItem}>
              <View style={styles.metaDot} />
              <Text style={styles.metaText}>3D Secure supporté</Text>
            </View>
            <View style={styles.metaItem}>
              <View style={styles.metaDotAlt} />
              <Text style={styles.metaText}>Aucune donnée carte stockée</Text>
            </View>
          </View>
        </View>

        {/* Bloc carte bancaire */}
        <View style={styles.cardBlock}>
          <View style={styles.cardBlockHeader}>
            <View>
              <Text style={styles.cardTitle}>Carte bancaire</Text>
              <Text style={styles.cardSubtitle}>
                Entre les infos de ta carte pour finaliser le paiement.
              </Text>
            </View>
            <Ionicons
              name="card-outline"
              size={22}
              color={colors.textSubtle}
            />
          </View>

          <View style={styles.cardFieldContainer}>
            <CardField
              postalCodeEnabled
              placeholders={{
                number: '4242 4242 4242 4242',
              }}
              cardStyle={{
                backgroundColor: 'transparent',
                textColor: '#f9fafb',
                placeholderColor: '#6b7280',
                borderRadius: 14,
              }}
              style={styles.cardField}
            />
          </View>

          <View style={styles.securityRow}>
            <Ionicons
              name="lock-closed-outline"
              size={14}
              color="#6ee7b7"
            />
            <Text style={styles.securityText}>
              Paiement traité par Stripe. Barber Connect ne voit jamais ton numéro de carte.
            </Text>
          </View>
        </View>

        {/* Bouton payer */}
        <TouchableOpacity
          style={[
            styles.payButton,
            (paying || !clientSecret) && styles.payButtonDisabled,
          ]}
          disabled={paying || !clientSecret}
          onPress={handlePay}
        >
          {paying ? (
            <ActivityIndicator color="#0f172a" />
          ) : (
            <Text style={styles.payButtonText}>Payer {amount} $</Text>
          )}
        </TouchableOpacity>
      </View>
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 40,
    paddingBottom: spacing.lg,
  },

  // Glows / décor
  glowTop: {
    position: 'absolute',
    top: -80,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(59,130,246,0.42)',
    opacity: 0.85,
  },
  glowRight: {
    position: 'absolute',
    top: 120,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(56,189,248,0.38)',
    opacity: 0.8,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -80,
    left: -20,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(16,185,129,0.28)',
    opacity: 0.7,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.9)',
    backgroundColor: 'rgba(15,23,42,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  topTitleCol: {
    flex: 1,
  },
  topTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  topSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
  },

  // Loading
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: colors.textMuted,
    fontSize: 13,
  },

  // Summary card
  summaryCard: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.45)',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 18 },
    elevation: 14,
    marginBottom: spacing.lg,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(15,118,110,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.6)',
  },
  summaryChipText: {
    marginLeft: 6,
    fontSize: 11,
    color: '#a7f3d0',
    fontWeight: '600',
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.6)',
  },
  summaryBadgeText: {
    marginLeft: 6,
    fontSize: 11,
    color: '#bae6fd',
    fontWeight: '600',
  },
  amountLabel: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.textMuted,
  },
  amountValue: {
    marginTop: 2,
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  summaryText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textSubtle,
    lineHeight: 18,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: 8,
  } as any,
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  metaDotAlt: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38bdf8',
    marginRight: 6,
  },
  metaText: {
    fontSize: 11,
    color: colors.textSubtle,
  },

  // Card block
  cardBlock: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    backgroundColor: 'rgba(15,23,42,0.97)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
    marginBottom: spacing.md,
  },
  cardBlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  cardSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textMuted,
  },
  cardFieldContainer: {
    marginTop: spacing.sm,
    borderRadius: radii.lg,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(15,23,42,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(31,41,55,0.9)',
  },
  cardField: {
    width: '100%',
    height: 50,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  securityText: {
    marginLeft: 6,
    fontSize: 11,
    color: colors.textSubtle,
    flex: 1,
  },

  // Pay button
  payButton: {
    marginTop: spacing.md,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38bdf8',
    shadowColor: '#0ea5e9',
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.4,
  },
});
