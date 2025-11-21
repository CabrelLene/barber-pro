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
import { RootStackParamList } from '../navigation/RootNavigator';
import { createPaymentIntentForBooking } from '../api/bookings';

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

  const handleBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backText}>{'‹'}</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Paiement</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Initialisation du paiement...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Paiement</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.amountLabel}>Montant à payer</Text>
        <Text style={styles.amountValue}>{amount} $</Text>

        <Text style={styles.cardLabel}>Carte bancaire</Text>
        <View style={styles.cardFieldContainer}>
          <CardField
            postalCodeEnabled={true}
            placeholders={{
              number: '4242 4242 4242 4242',
            }}
            cardStyle={{
              backgroundColor: '#020617',
              textColor: '#f9fafb',
            }}
            style={styles.cardField}
          />
        </View>

        <TouchableOpacity
          style={[styles.payButton, paying && styles.payButtonDisabled]}
          disabled={paying}
          onPress={handlePay}
        >
          {paying ? (
            <ActivityIndicator color="#0f172a" />
          ) : (
            <Text style={styles.payButtonText}>Payer {amount} $</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  backText: {
    color: '#e5e7eb',
    fontSize: 22,
    marginTop: -3,
  },
  topTitle: {
    color: '#f9fafb',
    fontSize: 18,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#9ca3af',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  amountLabel: {
    color: '#9ca3af',
    fontSize: 13,
  },
  amountValue: {
    color: '#f9fafb',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
  },
  cardLabel: {
    color: '#e5e7eb',
    fontSize: 14,
    marginBottom: 8,
  },
  cardFieldContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 8,
    backgroundColor: '#020617',
    marginBottom: 24,
  },
  cardField: {
    width: '100%',
    height: 50,
  },
  payButton: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#38bdf8',
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 16,
  },
});
