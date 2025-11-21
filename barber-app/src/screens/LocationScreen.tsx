// src/screens/LocationScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/RootNavigator';
import { fetchNearbyBarbers, Barber } from '../api/barbers';
import { BarberCard } from '../components/BarberCard';
import { AppBackground } from '../components/AppBackground';
import { AppButton } from '../components/AppButton';
import { AppTextInput } from '../components/AppTextInput';
import { colors, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Location'>;

export const LocationScreen: React.FC<Props> = ({ navigation }) => {
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const firstName =
    user?.fullName?.trim().split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Barber Lover';

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { postalCode?: string; city?: string } = {};
      if (postalCode.trim()) params.postalCode = postalCode.trim();
      if (city.trim()) params.city = city.trim();

      const data = await fetchNearbyBarbers(params);
      setBarbers(data);
      if (data.length === 0) {
        setError('Aucun barber trouvé pour cette zone pour le moment.');
      }
    } catch (err) {
      console.error(err);
      setError(
        'Erreur lors de la recherche. Vérifie le backend ou la connexion.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBarber = (barber: Barber) => {
    navigation.navigate('BarberDetails', { barberId: barber.id });
  };

  const handleGoToMyBookings = () => {
    navigation.navigate('MyBookings');
  };

  const hasResults = barbers.length > 0;

  const handleQuickCity = (value: string) => {
    setCity(value);
    setPostalCode('');
  };

  return (
    <AppBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        {/* NAVBAR / HEADER */}
        <View style={styles.navRow}>
          <View style={styles.navLeft}>
            <View style={styles.logoCircle}>
              <Ionicons name="cut-outline" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.navHello}>Bienvenue,</Text>
              <Text style={styles.navName}>{firstName}</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.navLocation}
            onPress={handleGoToMyBookings}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color={colors.text}
            />
            <Text style={styles.navLocationText}>Mes réservations</Text>
          </TouchableOpacity>
        </View>

        {/* HERO SUPER CARD */}
        <View style={styles.heroWrapper}>
          {/* ruban décoratif derrière */}
          <View style={styles.heroRibbon} />

          <View style={styles.heroCard}>
            <View style={styles.heroHeaderRow}>
              <View style={styles.heroChip}>
                <Ionicons
                  name="flash-outline"
                  size={14}
                  color={colors.primary}
                />
                <Text style={styles.heroChipText}>Réservation instantanée</Text>
              </View>
              <View style={styles.heroMiniLocation}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={colors.textSubtle}
                />
                <Text style={styles.heroMiniLocationText}>Québec, CA</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>
              Ta prochaine coupe,{'\n'}
              <Text style={styles.heroTitleAccent}>sans scroll inutile.</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              Tape ton code postal ou ta ville, on s’occupe du reste : barbers
              vérifiés, créneaux disponibles, avis clients.
            </Text>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons
                  name="cut-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text style={styles.statValue}>
                  {hasResults ? barbers.length : '—'}
                </Text>
                <Text style={styles.statLabel}>Barbers trouvés</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={'#fde68a'}
                />
                <Text style={styles.statValue}>Aujourd’hui</Text>
                <Text style={styles.statLabel}>Créneaux ouverts</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons
                  name="star-outline"
                  size={18}
                  color={'#facc15'}
                />
                <Text style={styles.statValue}>4.8+</Text>
                <Text style={styles.statLabel}>Top barbers</Text>
              </View>
            </View>
          </View>
        </View>

        {/* QUICK CITIES */}
        <View style={styles.quickRow}>
          <Text style={styles.quickLabel}>Villes rapides</Text>
          <View style={styles.quickChipsRow}>
            <TouchableOpacity
              style={styles.quickChip}
              onPress={() => handleQuickCity('Montréal')}
              activeOpacity={0.85}
            >
              <Ionicons
                name="location-outline"
                size={14}
                color={colors.text}
              />
              <Text style={styles.quickChipText}>Montréal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickChip}
              onPress={() => handleQuickCity('Laval')}
              activeOpacity={0.85}
            >
              <Ionicons
                name="location-outline"
                size={14}
                color={colors.text}
              />
              <Text style={styles.quickChipText}>Laval</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickChip}
              onPress={() => handleQuickCity('Québec')}
              activeOpacity={0.85}
            >
              <Ionicons
                name="location-outline"
                size={14}
                color={colors.text}
              />
              <Text style={styles.quickChipText}>Québec</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FORMULAIRE PREMIUM */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Où veux-tu te faire couper ?</Text>
          <Text style={styles.formSubtitle}>
            Utilise soit ton code postal, soit ta ville. Tu peux aussi cliquer
            sur une ville rapide juste au-dessus.
          </Text>

          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Code postal</Text>
              <AppTextInput
                placeholder="Ex : H3N 1X2"
                value={postalCode}
                onChangeText={setPostalCode}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.fieldOrWrapper}>
              <View style={styles.fieldOrLine} />
              <Text style={styles.fieldOrText}>ou</Text>
              <View style={styles.fieldOrLine} />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Ville</Text>
              <AppTextInput
                placeholder="Ex : Montréal"
                value={city}
                onChangeText={setCity}
              />
            </View>
          </View>

          <AppButton
            title="Voir les barbers proches"
            onPress={handleSearch}
            loading={loading}
            style={styles.searchButton}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.formHintRow}>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color={colors.textSubtle}
            />
            <Text style={styles.formHintText}>
              Pour l’instant, la couverture est optimisée pour le Québec. On
              étendra progressivement.
            </Text>
          </View>
        </View>

        {/* SECTION LISTE + TITRE */}
        <View style={styles.listHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.listTitle}>Barbers autour de toi</Text>
            {hasResults && (
              <View style={styles.listBadge}>
                <View style={styles.listBadgeDot} />
                <Text style={styles.listBadgeText}>Temps réel</Text>
              </View>
            )}
          </View>
          {hasResults && (
            <Text style={styles.listCount}>
              {barbers.length} résultat{barbers.length > 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {/* LISTE DES BARBERS */}
        <FlatList
          data={barbers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleOpenBarber(item)}
              style={styles.barberItemWrapper}
            >
              <BarberCard barber={item} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !loading && !error ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons
                    name="search-outline"
                    size={20}
                    color={colors.textMuted}
                  />
                </View>
                <Text style={styles.emptyTitle}>Lance ta première recherche</Text>
                <Text style={styles.emptyHint}>
                  Entre un code postal ou une ville, puis découvre les barbers
                  disponibles. Tu pourras ensuite réserver et payer en quelques
                  taps.
                </Text>

                <View style={styles.emptySteps}>
                  <View style={styles.emptyStepRow}>
                    <Text style={styles.emptyStepIndex}>1</Text>
                    <Text style={styles.emptyStepText}>
                      Saisis ton code postal ou ta ville.
                    </Text>
                  </View>
                  <View style={styles.emptyStepRow}>
                    <Text style={styles.emptyStepIndex}>2</Text>
                    <Text style={styles.emptyStepText}>
                      Parcours les barbers disponibles et leurs avis.
                    </Text>
                  </View>
                  <View style={styles.emptyStepRow}>
                    <Text style={styles.emptyStepIndex}>3</Text>
                    <Text style={styles.emptyStepText}>
                      Réserve ton créneau en quelques secondes.
                    </Text>
                  </View>
                </View>
              </View>
            ) : null
          }
        />

        {/* Loader flottant */}
        {loading && (
          <View style={styles.inlineLoader}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}
      </KeyboardAvoidingView>
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

  // NAVBAR
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
  },
  navHello: {
    fontSize: 11,
    color: colors.textSubtle,
  },
  navName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  navLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(15,23,42,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.6)',
  },
  navLocationText: {
    marginLeft: 6,
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },

  // HERO
  heroWrapper: {
    marginBottom: spacing.lg,
  },
  heroRibbon: {
    position: 'absolute',
    left: -16,
    right: -16,
    top: 18,
    height: 24,
    borderRadius: 999,
    backgroundColor: 'rgba(15,23,42,0.7)',
    borderWidth: 0.5,
    borderColor: 'rgba(148,163,184,0.3)',
    opacity: 0.7,
  },
  heroCard: {
    borderRadius: 22,
    padding: spacing.md,
    backgroundColor: 'rgba(15,23,42,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
    ...{
      shadowColor: '#000',
      shadowOpacity: 0.5,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 20 },
      elevation: 16,
    },
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.8)',
  },
  heroChipText: {
    marginLeft: 6,
    fontSize: 11,
    color: colors.text,
  },
  heroMiniLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroMiniLocationText: {
    marginLeft: 4,
    fontSize: 11,
    color: colors.textSubtle,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginTop: 6,
  },
  heroTitleAccent: {
    color: colors.primary,
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.45)',
    marginRight: 8,
  },
  statValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSubtle,
  },

  // QUICK CITIES
  quickRow: {
    marginBottom: spacing.sm,
  },
  quickLabel: {
    fontSize: 12,
    color: colors.textSubtle,
    marginBottom: 4,
  },
  quickChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
    marginRight: 8,
    marginBottom: 4,
  },
  quickChipText: {
    marginLeft: 4,
    fontSize: 11,
    color: colors.text,
  },

  // FORM CARD
  formCard: {
    borderRadius: 20,
    padding: spacing.md,
    backgroundColor: 'rgba(15,23,42,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
    marginBottom: spacing.md,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  formSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
  },
  formField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    color: colors.textSubtle,
    marginBottom: 4,
  },
  fieldOrWrapper: {
    width: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  fieldOrLine: {
    height: 12,
    width: 1,
    backgroundColor: 'rgba(55,65,81,0.8)',
  },
  fieldOrText: {
    marginVertical: 2,
    fontSize: 10,
    color: colors.textSubtle,
  },
  searchButton: {
    marginTop: spacing.sm,
  },
  error: {
    marginTop: 8,
    color: '#fda4af',
    fontSize: 13,
  },
  formHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  formHintText: {
    marginLeft: 4,
    fontSize: 11,
    color: colors.textSubtle,
  },

  // LIST HEADER
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  listBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#022c22',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  listBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginRight: 4,
  },
  listBadgeText: {
    fontSize: 10,
    color: '#bbf7d0',
  },
  listCount: {
    fontSize: 11,
    color: colors.textSubtle,
  },

  // LISTE & EMPTY
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: 40,
  },
  barberItemWrapper: {
    marginBottom: spacing.sm,
  },
  emptyContainer: {
    marginTop: 18,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  emptyHint: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
  },
  emptySteps: {
    marginTop: 10,
    alignSelf: 'stretch',
  },
  emptyStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyStepIndex: {
    width: 18,
    height: 18,
    borderRadius: 9,
    textAlign: 'center',
    textAlignVertical: 'center' as any,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.6)',
    fontSize: 11,
    color: colors.text,
    marginRight: 6,
  },
  emptyStepText: {
    flex: 1,
    fontSize: 11,
    color: colors.textSubtle,
  },

  // Loader flottant
  inlineLoader: {
    position: 'absolute',
    right: 24,
    top: 40,
  },
});
