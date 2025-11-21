// src/screens/BookingScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppBackground } from '../components/AppBackground';
import { AppButton } from '../components/AppButton';
import { LoaderOverlay } from '../components/LoaderOverlay';
import { colors, radii, spacing } from '../theme';
import { createBooking } from '../api/bookings';

type Props = NativeStackScreenProps<RootStackParamList, 'Booking'>;

type Slot = {
  id: string;
  label: string;
  date: Date;
};

function buildSlots(): Slot[] {
  const now = new Date();
  const slots: Slot[] = [];

  for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
    for (let hour = 9; hour <= 18; hour++) {
      const d = new Date();
      d.setDate(now.getDate() + dayOffset);
      d.setHours(hour, 0, 0, 0);

      // on évite les créneaux déjà passés
      if (d <= now) continue;

      const label = d.toLocaleString('fr-CA', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

      slots.push({
        id: d.toISOString(),
        label,
        date: d,
      });
    }
  }

  return slots;
}

export const BookingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { barberId, serviceId, barberName, serviceName } = route.params;

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slots = useMemo(() => buildSlots(), []);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleConfirm = async () => {
    if (!selectedSlot) {
      setError('Merci de choisir un créneau horaire.');
      return;
    }
    setError(null);

    try {
      setSubmitting(true);

      const booking = await createBooking({
        barberId,
        serviceId,
        scheduledAt: selectedSlot.date.toISOString(),
      });

      // on enchaîne vers le paiement
      navigation.replace('Payment', {
        bookingId: booking.id,
        amountCents: booking.totalPriceCents,
      });
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message ??
        "Impossible de créer la réservation. Réessaie dans quelques instants.";
      Alert.alert('Erreur', typeof msg === 'string' ? msg : 'Erreur réseau.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderSlot = ({ item }: { item: Slot }) => {
    const isSelected = selectedSlot?.id === item.id;

    const dayLabel = item.date.toLocaleDateString('fr-CA', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
    });
    const timeLabel = item.date.toLocaleTimeString('fr-CA', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setSelectedSlot(item)}
        style={[
          styles.slotCard,
          isSelected && styles.slotCardSelected,
        ]}
      >
        <View style={styles.slotLeft}>
          <Text style={styles.slotDay}>{dayLabel}</Text>
          <Text style={styles.slotTime}>{timeLabel}</Text>
        </View>

        <View style={styles.slotMiddle}>
          <Text style={styles.slotLabel} numberOfLines={1}>
            {item.label}
          </Text>
          <View style={styles.slotMetaRow}>
            <Ionicons
              name="sparkles-outline"
              size={12}
              color="#a5b4fc"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.slotMetaText}>Créneau standard</Text>
          </View>
        </View>

        <View style={styles.slotRight}>
          {isSelected ? (
            <View style={styles.slotCheckBadge}>
              <Ionicons name="checkmark" size={14} color="#0f172a" />
            </View>
          ) : (
            <View style={styles.slotChevronBadge}>
              <Ionicons name="chevron-forward" size={14} color="#9ca3af" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <AppBackground>
      <LoaderOverlay
        visible={submitting}
        message="Création de ta réservation..."
      />
      <View style={styles.root}>
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.topBarCenter}>
            <Text style={styles.topTitle}>Choix du créneau</Text>
            <Text style={styles.topSubtitle}>
              Étape 2 sur 3 • Réservation → Paiement → Avis
            </Text>
          </View>

          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>2/3</Text>
          </View>
        </View>

        {/* CARTE RÉCAP BARBER + SERVICE */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeaderRow}>
            <View style={styles.summaryAvatar}>
              <Text style={styles.summaryAvatarText}>
                {barberName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.summaryBarberName} numberOfLines={1}>
                {barberName}
              </Text>
              <Text style={styles.summaryServiceName} numberOfLines={1}>
                {serviceName}
              </Text>
            </View>
          </View>

          <View style={styles.summaryMetaRow}>
            <View style={styles.summaryChip}>
              <Ionicons
                name="cut-outline"
                size={12}
                color="#e0f2fe"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.summaryChipText}>
                Salon sélectionné
              </Text>
            </View>
            <View style={styles.summaryChip}>
              <Ionicons
                name="calendar-outline"
                size={12}
                color="#bbf7d0"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.summaryChipText}>
                Créneaux sur 3 jours
              </Text>
            </View>
          </View>

          <Text style={styles.summaryHint}>
            Choisis l’heure qui t’arrange. Le paiement sécurisé se fera à l’étape
            suivante, directement dans l’app.
          </Text>
        </View>

        {/* SECTION TITRE SLOTS */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Créneaux disponibles</Text>
            <Text style={styles.sectionSubtitle}>
              Entre 9h et 18h sur les 3 prochains jours.
            </Text>
          </View>
          <View style={styles.sectionIconBadge}>
            <Ionicons name="time-outline" size={14} color="#e5e7eb" />
          </View>
        </View>

        {/* LISTE DES CRÉNEAUX */}
        <FlatList
          data={slots}
          keyExtractor={(item) => item.id}
          renderItem={renderSlot}
          contentContainerStyle={styles.slotsList}
          showsVerticalScrollIndicator={false}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* BOUTON CONFIRMATION */}
        <AppButton
          title="Confirmer la réservation"
          onPress={handleConfirm}
          disabled={!selectedSlot || submitting}
          loading={submitting}
          style={styles.confirmButton}
        />

        <Text style={styles.footerText}>
          Tu pourras ajuster ou annuler ton rendez-vous selon la politique du
          barber.
        </Text>
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
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  topSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSubtle,
  },
  stepBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.8)',
  },
  stepBadgeText: {
    fontSize: 11,
    color: '#e0f2fe',
    fontWeight: '600',
  },

  // SUMMARY CARD
  summaryCard: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    backgroundColor: 'rgba(15,23,42,0.97)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.45)',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
    marginBottom: spacing.lg,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryAvatarText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  summaryBarberName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  summaryServiceName: {
    marginTop: 2,
    color: colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  summaryMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.6)',
    marginRight: 6,
    marginTop: 4,
  },
  summaryChipText: {
    fontSize: 11,
    color: colors.textSubtle,
  },
  summaryHint: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textMuted,
  },

  // SECTION TITRE
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSubtle,
  },
  sectionIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // SLOTS
  slotsList: {
    paddingBottom: spacing.md,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(31,41,55,0.9)',
  },
  slotCardSelected: {
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(15,23,42,0.99)',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  slotLeft: {
    width: 80,
  },
  slotDay: {
    fontSize: 11,
    color: colors.textSubtle,
    textTransform: 'capitalize',
  },
  slotTime: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  slotMiddle: {
    flex: 1,
    paddingHorizontal: 8,
  },
  slotLabel: {
    fontSize: 13,
    color: colors.text,
  },
  slotMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  slotMetaText: {
    fontSize: 11,
    color: colors.textSubtle,
  },
  slotRight: {
    width: 34,
    alignItems: 'flex-end',
  },
  slotCheckBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotChevronBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020617',
  },

  // ERREUR / FOOTER
  errorText: {
    marginTop: 4,
    color: colors.danger,
    fontSize: 12,
  },
  confirmButton: {
    marginTop: spacing.md,
  },
  footerText: {
    marginTop: 8,
    fontSize: 11,
    color: colors.textSubtle,
  },
});
