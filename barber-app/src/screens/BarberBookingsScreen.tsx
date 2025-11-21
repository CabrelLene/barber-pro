// src/screens/BarberBookingsScreen.tsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Booking,
  fetchBarberBookings,
  updateBarberBookingStatus,
} from '../api/bookings';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppBackground } from '../components/AppBackground';
import { AppButton } from '../components/AppButton';
import { colors, spacing, radii } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BarberBookings'>;

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

function statusLabel(status: Booking['status']) {
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
      return '#facc15'; // jaune
    case 'CONFIRMED':
      return '#38bdf8'; // bleu
    case 'COMPLETED':
      return '#22c55e'; // vert
    case 'CANCELED':
      return '#f97373'; // rouge
    case 'NO_SHOW':
      return '#fb923c'; // orange
    default:
      return '#9ca3af';
  }
}

export const BarberBookingsScreen: React.FC<Props> = ({ navigation }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBarberBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger tes rendez-vous clients.");
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

  const handleChangeStatus = async (
    bookingId: string,
    newStatus: Booking['status'],
  ) => {
    try {
      setUpdatingId(bookingId);
      const updated = await updateBarberBookingStatus(bookingId, newStatus);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? updated : b)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Petites stats pour le header
  const stats = useMemo(() => {
    const now = new Date();
    let upcoming = 0;
    let pending = 0;
    let completed = 0;

    bookings.forEach((b) => {
      const date = new Date(b.scheduledAt);
      const isPast = date < now;
      if (!isPast && (b.status === 'PENDING' || b.status === 'CONFIRMED')) {
        upcoming += 1;
      }
      if (b.status === 'PENDING') pending += 1;
      if (b.status === 'COMPLETED') completed += 1;
    });

    return { upcoming, pending, completed };
  }, [bookings]);

  const renderItem = ({ item }: { item: Booking }) => {
    const now = new Date();
    const date = new Date(item.scheduledAt);
    const isPast = date < now;

    const canConfirm = item.status === 'PENDING';
    const canComplete = item.status === 'CONFIRMED';
    const canNoShow = item.status === 'CONFIRMED';

    const sColor = statusColor(item.status);

    return (
      <View style={[styles.card, isPast && styles.cardPast]}>
        {/* Bande colorée côté gauche (timeline) */}
        <View style={[styles.cardTimeline, { backgroundColor: sColor }]} />

        <View style={styles.cardContent}>
          {/* HEADER : shop + prix + status */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.shopName} numberOfLines={1}>
                {item.barber.shopName}
              </Text>
              {item.client && (
                <Text style={styles.clientName} numberOfLines={1}>
                  {item.client.fullName} • {item.client.phone || 'Tel inconnu'}
                </Text>
              )}
            </View>

            <View style={styles.cardHeaderRight}>
              <Text style={styles.price}>
                {(item.totalPriceCents / 100).toFixed(2)} $
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { borderColor: sColor, backgroundColor: sColor + '22' },
                ]}
              >
                <View
                  style={[styles.statusDot, { backgroundColor: sColor }]}
                />
                <Text style={styles.statusText}>{statusLabel(item.status)}</Text>
              </View>
            </View>
          </View>

          {/* DATE + SERVICE */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color="#e5e7eb"
                style={styles.infoIcon}
              />
              <Text style={styles.dateText}>{formatDate(item.scheduledAt)}</Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons
                name="cut-outline"
                size={14}
                color="#a5b4fc"
                style={styles.infoIcon}
              />
              <Text style={styles.serviceName} numberOfLines={1}>
                {item.service.name}
              </Text>
            </View>
          </View>

          {/* ACTIONS */}
          {(canConfirm || canComplete || canNoShow) && (
            <View style={styles.actionsRow}>
              {canConfirm && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.actionPrimary,
                    updatingId === item.id && styles.actionDisabled,
                  ]}
                  disabled={updatingId === item.id}
                  onPress={() => handleChangeStatus(item.id, 'CONFIRMED')}
                  activeOpacity={0.85}
                >
                  {updatingId === item.id ? (
                    <ActivityIndicator color="#0f172a" />
                  ) : (
                    <View style={styles.actionContentRow}>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={16}
                        color="#0f172a"
                      />
                      <Text style={styles.actionPrimaryText}>Confirmer</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}

              {canComplete && (
                <>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.actionPrimary,
                      updatingId === item.id && styles.actionDisabled,
                    ]}
                    disabled={updatingId === item.id}
                    onPress={() => handleChangeStatus(item.id, 'COMPLETED')}
                    activeOpacity={0.85}
                  >
                    {updatingId === item.id ? (
                      <ActivityIndicator color="#0f172a" />
                    ) : (
                      <View style={styles.actionContentRow}>
                        <Ionicons
                          name="cut-outline"
                          size={16}
                          color="#0f172a"
                        />
                        <Text style={styles.actionPrimaryText}>Terminé</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.actionSecondary,
                      updatingId === item.id && styles.actionDisabled,
                    ]}
                    disabled={updatingId === item.id}
                    onPress={() => handleChangeStatus(item.id, 'NO_SHOW')}
                    activeOpacity={0.85}
                  >
                    <View style={styles.actionContentRow}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={16}
                        color="#f97316"
                      />
                      <Text style={styles.actionSecondaryText}>No-show</Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <AppBackground>
      <View style={styles.root}>
        {/* TOP BAR AVEC ROLE BARBER + bouton retour */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.topBarCenter}>
            <Text style={styles.topTitle}>Agenda de tes rendez-vous</Text>
            <Text style={styles.topSubtitle}>
              Gère les confirmations, les absents et les coupes terminées.
            </Text>
          </View>

          <View style={styles.rolePill}>
            <Ionicons name="person-outline" size={14} color="#a5b4fc" />
            <Text style={styles.rolePillText}>Barber</Text>
          </View>
        </View>

        {/* STATS CARDS */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <Text style={styles.statLabel}>À venir</Text>
            <View style={styles.statValueRow}>
              <Ionicons name="time-outline" size={16} color="#0f172a" />
              <Text style={styles.statValue}>{stats.upcoming}</Text>
            </View>
            <Text style={styles.statHint}>Rdv à préparer</Text>
          </View>

          <View style={[styles.statCard, styles.statCardWarning]}>
            <Text style={styles.statLabel}>En attente</Text>
            <View style={styles.statValueRow}>
              <Ionicons name="hourglass-outline" size={16} color="#f97316" />
              <Text style={styles.statValue}>{stats.pending}</Text>
            </View>
            <Text style={styles.statHint}>À confirmer</Text>
          </View>

          <View style={[styles.statCard, styles.statCardSuccess]}>
            <Text style={styles.statLabel}>Terminés</Text>
            <View style={styles.statValueRow}>
              <Ionicons name="checkmark-done-outline" size={16} color="#bbf7d0" />
              <Text style={styles.statValue}>{stats.completed}</Text>
            </View>
            <Text style={styles.statHint}>Coupes réalisées</Text>
          </View>
        </View>

        {/* CONTENU PRINCIPAL */}
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Chargement de tes rendez-vous…</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <AppButton
              title="Réessayer"
              onPress={load}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        )}

        {!loading && !error && (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={renderItem}
            ListEmptyComponent={
              <View style={styles.emptyWrapper}>
                <View style={styles.emptyCard}>
                  <Ionicons
                    name="calendar-outline"
                    size={28}
                    color={colors.textSubtle}
                  />
                  <Text style={styles.emptyTitle}>Aucun rendez-vous pour l’instant</Text>
                  <Text style={styles.emptyText}>
                    Dès qu’un client réservera chez toi, il apparaîtra ici avec tous
                    les détails.
                  </Text>
                </View>
              </View>
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
  root: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 40,
    paddingBottom: 24,
  },

  // TOP BAR
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020617',
    marginRight: 10,
  },
  topBarCenter: {
    flex: 1,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  topSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSubtle,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(129,140,248,0.7)',
  },
  rolePillText: {
    marginLeft: 6,
    fontSize: 11,
    color: '#c7d2fe',
    fontWeight: '600',
  },

  // STATS
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  statCardPrimary: {
    backgroundColor: '#38bdf8',
  },
  statCardWarning: {
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#f97316',
  },
  statCardSuccess: {
    backgroundColor: '#022c22',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  statLabel: {
    fontSize: 11,
    color: '#e5e7eb',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statValue: {
    marginLeft: 6,
    fontSize: 18,
    fontWeight: '800',
    color: '#f9fafb',
  },
  statHint: {
    marginTop: 2,
    fontSize: 10,
    color: '#e5e7eb',
    opacity: 0.9,
  },

  // CENTRE (loading / error)
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
  errorText: {
    color: '#fda4af',
    fontSize: 13,
    textAlign: 'center',
  },

  // LISTE
  listContent: {
    paddingTop: 4,
    paddingBottom: 32,
  },

  // CARD
  card: {
    flexDirection: 'row',
    borderRadius: radii.xl,
    marginBottom: 12,
    backgroundColor: 'rgba(15,23,42,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  cardPast: {
    opacity: 0.9,
  },
  cardTimeline: {
    width: 4,
    borderTopLeftRadius: radii.xl,
    borderBottomLeftRadius: radii.xl,
  },
  cardContent: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  cardHeaderLeft: {
    flex: 1,
    paddingRight: 8,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
  },
  shopName: {
    color: '#f9fafb',
    fontWeight: '700',
    fontSize: 15,
  },
  clientName: {
    color: '#9ca3af',
    fontSize: 11,
    marginTop: 2,
  },
  price: {
    color: '#38bdf8',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  statusText: {
    color: '#e5e7eb',
    fontSize: 11,
    fontWeight: '600',
  },

  infoRow: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 8,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  infoIcon: {
    marginRight: 6,
  },
  dateText: {
    color: '#a5b4fc',
    fontSize: 12,
  },
  serviceName: {
    color: '#e5e7eb',
    fontSize: 12,
  },

  actionsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionPrimary: {
    backgroundColor: '#38bdf8',
    marginRight: 8,
  },
  actionPrimaryText: {
    marginLeft: 6,
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 13,
  },
  actionSecondary: {
    borderWidth: 1,
    borderColor: '#f97316',
    backgroundColor: 'transparent',
  },
  actionSecondaryText: {
    marginLeft: 6,
    color: '#f97316',
    fontWeight: '600',
    fontSize: 13,
  },
  actionDisabled: {
    opacity: 0.7,
  },

  // EMPTY STATE
  emptyWrapper: {
    paddingTop: 24,
    alignItems: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
    maxWidth: 320,
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSubtle,
    textAlign: 'center',
  },
});
