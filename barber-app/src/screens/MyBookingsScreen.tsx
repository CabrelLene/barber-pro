// src/screens/MyBookingsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Booking,
  fetchMyBookings,
  cancelBooking,
} from '../api/bookings';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppBackground } from '../components/AppBackground';
import { AppButton } from '../components/AppButton';
import { colors, spacing, radii } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MyBookings'>;

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('fr-CA', {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatStatus(status: Booking['status']) {
  switch (status) {
    case 'PENDING':
      return 'En attente';
    case 'CONFIRMED':
      return 'Confirmé';
    case 'COMPLETED':
      return 'Terminé';
    case 'CANCELED':
      return 'Annulé';
    case 'NO_SHOW':
      return 'Absent';
    default:
      return status;
  }
}

function statusColor(status: Booking['status']) {
  switch (status) {
    case 'PENDING':
      return '#fbbf24';
    case 'CONFIRMED':
      return '#22c55e';
    case 'COMPLETED':
      return '#16a34a';
    case 'CANCELED':
      return '#f97373';
    case 'NO_SHOW':
      return '#f97316';
    default:
      return '#9ca3af';
  }
}

export const MyBookingsScreen: React.FC<Props> = ({ navigation }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger tes réservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCancel = (booking: Booking) => {
    if (
      booking.status === 'CANCELED' ||
      booking.status === 'COMPLETED' ||
      booking.status === 'NO_SHOW'
    ) {
      return;
    }

    Alert.alert(
      'Annuler la réservation',
      `Tu veux vraiment annuler ce rendez-vous chez ${booking.barber.shopName} ?`,
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelingId(booking.id);
              const updated = await cancelBooking(booking.id);
              setBookings((prev) =>
                prev.map((b) => (b.id === booking.id ? updated : b)),
              );
            } catch (err) {
              console.error(err);
              Alert.alert(
                'Erreur',
                "Impossible d’annuler la réservation pour le moment.",
              );
            } finally {
              setCancelingId(null);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: Booking }) => {
    const isPast = new Date(item.scheduledAt) < new Date();
    const isCancelable =
      !isPast &&
      item.status !== 'CANCELED' &&
      item.status !== 'COMPLETED' &&
      item.status !== 'NO_SHOW';

    return (
      <View style={[styles.card, isPast && styles.cardPast]}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.barberName}>{item.barber.shopName}</Text>
            <Text style={styles.serviceName}>{item.service.name}</Text>
          </View>
          <Text style={styles.price}>
            {(item.totalPriceCents / 100).toFixed(2)} $
          </Text>
        </View>

        <Text style={styles.dateText}>{formatDate(item.scheduledAt)}</Text>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor(item.status) + '26' },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: statusColor(item.status) },
              ]}
            />
            <Text style={styles.statusText}>{formatStatus(item.status)}</Text>
          </View>
        </View>

        {isCancelable && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                cancelingId === item.id && styles.cancelDisabled,
              ]}
              disabled={cancelingId === item.id}
              onPress={() => handleCancel(item)}
            >
              {cancelingId === item.id ? (
                <ActivityIndicator color="#fecaca" />
              ) : (
                <Text style={styles.cancelText}>Annuler la réservation</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <AppBackground>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <AppButton
            title="‹"
            variant="secondary"
            onPress={handleBack}
            style={styles.backButton}
          />
          <Text style={styles.topTitle}>Mes réservations</Text>
        </View>

        {loading && (
          <View style={styles.center}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={renderItem}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Tu n’as pas encore de réservation.
              </Text>
            }
            refreshing={loading}
            onRefresh={load}
          />
        )}
      </View>
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 40,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  topTitle: {
    color: colors.text,
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
    color: colors.textMuted,
  },
  errorText: {
    color: '#fda4af',
  },
  listContent: {
    paddingBottom: 32,
  },
  card: {
    borderRadius: radii.xl,
    padding: 14,
    marginBottom: 12,
    backgroundColor: 'rgba(15,23,42,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(30,64,175,0.4)',
  },
  cardPast: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barberName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  serviceName: {
    color: colors.textMuted,
    fontSize: 13,
  },
  price: {
    color: colors.primary,
    fontWeight: '700',
  },
  dateText: {
    marginTop: 4,
    color: '#a5b4fc',
    fontSize: 13,
  },
  statusRow: {
    marginTop: 6,
    flexDirection: 'row',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: colors.text,
    fontSize: 11,
  },
  actionsRow: {
    marginTop: 10,
  },
  cancelButton: {
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fca5a5',
    backgroundColor: 'rgba(127,29,29,0.1)',
  },
  cancelText: {
    color: '#fecaca',
    fontWeight: '600',
    fontSize: 13,
  },
  cancelDisabled: {
    opacity: 0.7,
  },
  emptyText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#6b7280',
  },
});
