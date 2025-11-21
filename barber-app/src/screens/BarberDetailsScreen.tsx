// src/screens/BarberDetailsScreen.tsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image, // 👈 nouveau
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Barber, BarberReview, fetchBarberById } from '../api/barbers';
import { AppBackground } from '../components/AppBackground';
import { AppButton } from '../components/AppButton';
import { colors, spacing, radii } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BarberDetails'>;

export const BarberDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { barberId } = route.params;

  const [barber, setBarber] = useState<Barber | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBarberById(barberId);
      setBarber(data);
      if (data.services && data.services.length > 0) {
        setSelectedServiceId(data.services[0].id);
      }
    } catch (err) {
      console.error(err);
      setError('Impossible de charger ce barber. Vérifie la connexion / backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [barberId]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleBook = () => {
    if (!barber || !selectedServiceId) return;

    const service = barber.services.find((s) => s.id === selectedServiceId);
    if (!service) return;

    navigation.navigate('Booking', {
      barberId: barber.id,
      serviceId: service.id,
      barberName: barber.shopName,
      serviceName: service.name,
    });
  };

  const handleLeaveReview = () => {
    if (!barber) return;
    navigation.navigate('Review', {
      barberId: barber.id,
      barberName: barber.shopName,
    });
  };

  // 🔥 Service card type "menu" avec image en haut
  const renderServiceItem = ({ item }: { item: Barber['services'][number] }) => {
    const isSelected = item.id === selectedServiceId;

    // on récupère l'image si le backend l'envoie (item.imageUrl)
    const imageUrl = (item as any).imageUrl as string | undefined;

    return (
      <TouchableOpacity
        onPress={() => setSelectedServiceId(item.id)}
        activeOpacity={0.9}
        style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
      >
        {/* IMAGE TOP */}
        <View style={styles.serviceImageWrapper}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.serviceImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.serviceImagePlaceholder}>
              <Ionicons name="cut-outline" size={20} color="#e5e7eb" />
              <Text style={styles.serviceImagePlaceholderText}>
                Coupe & style
              </Text>
            </View>
          )}

          {/* Overlay subtil + badge prix */}
          <View style={styles.serviceImageOverlay} />
          <View style={styles.servicePriceTag}>
            <Text style={styles.servicePriceTagLabel}>À partir de</Text>
            <Text style={styles.servicePriceTagValue}>
              {(item.priceCents / 100).toFixed(2)} $
            </Text>
          </View>
        </View>

        {/* TEXTE BAS */}
        <View style={styles.serviceInfoBlock}>
          <Text style={styles.serviceName} numberOfLines={1}>
            {item.name}
          </Text>

          {item.description ? (
            <Text style={styles.serviceDescription} numberOfLines={2}>
              {item.description}
            </Text>
          ) : (
            <Text style={styles.serviceDescriptionMuted} numberOfLines={2}>
              Service prêt à être réservé. Description à venir.
            </Text>
          )}

          <View style={styles.serviceMetaRow}>
            <View style={styles.serviceTimeBadge}>
              <Ionicons name="time-outline" size={12} color="#e5e7eb" />
              <Text style={styles.serviceTimeText}>{item.durationMin} min</Text>
            </View>

            {isSelected && (
              <View style={styles.serviceSelectedChip}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color="#bbf7d0"
                />
                <Text style={styles.serviceSelectedText}>
                  Sélectionné
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderReviewItem = ({ item }: { item: BarberReview }) => {
    const initials =
      item.client?.fullName
        ?.split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase() || 'C';

    return (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewAvatar}>
            <Text style={styles.reviewAvatarText}>{initials}</Text>
          </View>
          <View style={styles.reviewHeaderText}>
            <Text style={styles.reviewAuthor}>
              {item.client?.fullName ?? 'Client'}
            </Text>
            <Text style={styles.reviewRatingRow}>
              <Ionicons
                name="star"
                size={12}
                color="#facc15"
                style={{ marginRight: 2 }}
              />
              <Text style={styles.reviewRatingValue}>{item.rating}/5</Text>
            </Text>
          </View>
        </View>
        {item.comment ? (
          <Text style={styles.reviewComment}>{item.comment}</Text>
        ) : (
          <Text style={styles.reviewCommentMuted}>
            Pas de commentaire laissé.
          </Text>
        )}
      </View>
    );
  };

  const ratingAverage =
    barber?.ratingAverage != null
      ? Math.round(barber.ratingAverage * 10) / 10
      : null;

  const reviewsPreview = barber?.reviews ? barber.reviews.slice(0, 3) : [];

  const averagePrice = useMemo(() => {
    if (!barber || !barber.services.length) return null;
    const sum = barber.services.reduce((acc, s) => acc + s.priceCents, 0);
    return (sum / barber.services.length / 100).toFixed(2);
  }, [barber]);

  if (loading) {
    return (
      <AppBackground>
        <View style={styles.root}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.topBarCenter}>
              <Text style={styles.topTitle}>Barber</Text>
              <Text style={styles.topSubtitle}>
                Chargement des informations du salon…
              </Text>
            </View>
          </View>
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Chargement…</Text>
          </View>
        </View>
      </AppBackground>
    );
  }

  if (error || !barber) {
    return (
      <AppBackground>
        <View style={styles.root}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.topBarCenter}>
              <Text style={styles.topTitle}>Barber</Text>
              <Text style={styles.topSubtitle}>
                Impossible de charger ce profil.
              </Text>
            </View>
          </View>
          <View style={styles.center}>
            <Text style={styles.errorText}>{error ?? 'Barber introuvable.'}</Text>
            <AppButton
              title="Réessayer"
              onPress={load}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        </View>
      </AppBackground>
    );
  }

  const firstLetter = barber.shopName?.charAt(0)?.toUpperCase() || 'B';

  return (
    <AppBackground>
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
            <Text style={styles.topTitle}>{barber.shopName}</Text>
            <Text style={styles.topSubtitle}>
              Détails du salon, services et avis clients.
            </Text>
          </View>

          <View style={styles.rolePill}>
            <Ionicons name="cut-outline" size={14} color="#a5b4fc" />
            <Text style={styles.rolePillText}>Barbershop</Text>
          </View>
        </View>

        <FlatList
          ListHeaderComponent={
            <>
              {/* HERO BARBER CARD */}
              <View style={styles.heroCard}>
                <View style={styles.heroTopRow}>
                  <View style={styles.avatarWrapper}>
                    <View style={styles.avatarInner}>
                      <Text style={styles.avatarText}>{firstLetter}</Text>
                    </View>
                    <View style={styles.avatarInfo}>
                      <Text style={styles.heroName}>{barber.shopName}</Text>
                      <View style={styles.heroTagsRow}>
                        <View style={styles.heroTag}>
                          <Ionicons
                            name="location-outline"
                            size={11}
                            color="#c7d2fe"
                          />
                          <Text style={styles.heroTagText}>
                            {barber.city}, {barber.province}
                          </Text>
                        </View>
                        <View style={styles.heroTag}>
                          <Ionicons
                            name="sparkles-outline"
                            size={11}
                            color="#facc15"
                          />
                          <Text style={styles.heroTagText}>
                            Spécialiste coupe & fade
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.heroRatingCard}>
                    <Text style={styles.heroRatingLabel}>Note globale</Text>
                    <View style={styles.heroRatingRow}>
                      <Ionicons name="star" size={14} color="#facc15" />
                      <Text style={styles.heroRatingValue}>
                        {ratingAverage != null ? ratingAverage : 'N/A'}
                      </Text>
                    </View>
                    <Text style={styles.heroRatingSub}>
                      {barber.ratingCount && barber.ratingCount > 0
                        ? `${barber.ratingCount} avis`
                        : 'Aucun avis'}
                    </Text>
                  </View>
                </View>

                {/* ADRESSE + INFO TARIFS */}
                <View style={styles.heroBottomRow}>
                  <View style={styles.heroAddressRow}>
                    <Ionicons
                      name="map-outline"
                      size={14}
                      color="#93c5fd"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.heroAddressText}>
                      {barber.addressLine1}
                      {', '}
                      {barber.city}, {barber.province} {barber.postalCode}
                    </Text>
                  </View>

                  <View style={styles.heroMetaRow}>
                    <View style={styles.heroMetaBadge}>
                      <Ionicons name="cash-outline" size={12} color="#bbf7d0" />
                      <Text style={styles.heroMetaText}>
                        {averagePrice
                          ? `Prix moyen ${averagePrice} $`
                          : 'Tarifs variables'}
                      </Text>
                    </View>
                    <View style={styles.heroMetaBadge}>
                      <Ionicons name="time-outline" size={12} color="#bfdbfe" />
                      <Text style={styles.heroMetaText}>Sur réservation</Text>
                    </View>
                  </View>
                </View>

                {barber.description ? (
                  <Text style={styles.heroDescription}>{barber.description}</Text>
                ) : null}
              </View>

              {/* SECTION SERVICES */}
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>Services proposés</Text>
                  <Text style={styles.sectionSubtitle}>
                    Choisis un service pour réserver ce barber.
                  </Text>
                </View>
                {barber.services.length > 0 && (
                  <View style={styles.sectionChip}>
                    <Ionicons
                      name="cut-outline"
                      size={12}
                      color="#38bdf8"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.sectionChipText}>
                      {barber.services.length} services
                    </Text>
                  </View>
                )}
              </View>
            </>
          }
          data={barber.services}
          keyExtractor={(item) => item.id}
          renderItem={renderServiceItem}
          ListFooterComponent={
            <>
              {/* BOUTON RÉSERVER */}
              {barber.services.length > 0 && (
                <AppButton
                  title="Réserver ce barber"
                  onPress={handleBook}
                  disabled={!selectedServiceId}
                  style={styles.bookButton}
                />
              )}

              {/* SECTION AVIS */}
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>Avis clients</Text>
                  <Text style={styles.sectionSubtitle}>
                    Les retours de ceux qui sont déjà passés sur le fauteuil.
                  </Text>
                </View>
                <AppButton
                  title="Laisser un avis"
                  variant="ghost"
                  onPress={handleLeaveReview}
                  style={styles.leaveReviewButton}
                />
              </View>

              {reviewsPreview.length === 0 ? (
                <View style={styles.noReviewsCard}>
                  <Ionicons
                    name="chatbubbles-outline"
                    size={20}
                    color={colors.textSubtle}
                  />
                  <Text style={styles.noReviewsTitle}>
                    Aucun avis pour le moment
                  </Text>
                  <Text style={styles.noReviewsText}>
                    Sois le premier à laisser un avis après ta première coupe.
                  </Text>
                </View>
              ) : (
                <>
                  {reviewsPreview.map((rev) => (
                    <View key={rev.id} style={styles.reviewWrapper}>
                      {renderReviewItem({ item: rev })}
                    </View>
                  ))}
                  {barber.ratingCount &&
                    barber.ratingCount > reviewsPreview.length && (
                      <Text style={styles.moreReviewsHint}>
                        Il reste d’autres avis qui pourront être affichés dans un
                        écran dédié plus tard.
                      </Text>
                    )}
                </>
              )}

              <View style={{ height: spacing.xl }} />
            </>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 40,
    paddingBottom: spacing.lg,
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

  listContent: {
    paddingBottom: spacing.lg,
  },

  // CENTRE
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
    textAlign: 'center',
    fontSize: 13,
  },

  // HERO CARD
  heroCard: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(15,23,42,0.97)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.45)',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 16 },
    elevation: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  avatarWrapper: {
    flexDirection: 'row',
    flex: 1.4,
  },
  avatarInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '800',
  },
  avatarInfo: {
    flex: 1,
    marginLeft: spacing.sm,
    justifyContent: 'center',
  },
  heroName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  heroTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
  },
  heroTagText: {
    marginLeft: 4,
    fontSize: 11,
    color: colors.textSubtle,
  },
  heroRatingCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(129,140,248,0.7)',
    alignItems: 'flex-start',
  },
  heroRatingLabel: {
    fontSize: 10,
    color: colors.textSubtle,
    marginBottom: 4,
  },
  heroRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroRatingValue: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '800',
    color: '#facc15',
  },
  heroRatingSub: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textMuted,
  },

  heroBottomRow: {
    marginTop: spacing.sm,
  },
  heroAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroAddressText: {
    flex: 1,
    fontSize: 12,
    color: '#bfdbfe',
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  heroMetaBadge: {
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
  heroMetaText: {
    marginLeft: 4,
    fontSize: 11,
    color: colors.textSubtle,
  },
  heroDescription: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textMuted,
  },

  // SECTIONS
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  sectionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.8)',
  },
  sectionChipText: {
    fontSize: 11,
    color: '#e0f2fe',
  },

  // SERVICES – version "carte de menu"
  serviceCard: {
    borderRadius: radii.xl,
    marginBottom: spacing.sm,
    backgroundColor: 'rgba(15,23,42,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(31,41,55,0.9)',
    overflow: 'hidden',
  },
  serviceCardSelected: {
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(15,23,42,0.99)',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },

  serviceImageWrapper: {
    height: 140,
    backgroundColor: '#020617',
    position: 'relative',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  serviceImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: 'rgba(31,41,55,0.9)',
  },
  serviceImagePlaceholderText: {
    marginTop: 4,
    color: '#e5e7eb',
    fontSize: 12,
    fontWeight: '600',
  },
  serviceImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.25)',
  },
  servicePriceTag: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.7)',
    alignItems: 'flex-end',
  },
  servicePriceTagLabel: {
    fontSize: 9,
    color: colors.textSubtle,
  },
  servicePriceTagValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '700',
  },

  serviceInfoBlock: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  serviceName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  serviceDescription: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
  },
  serviceDescriptionMuted: {
    marginTop: 4,
    color: '#6b7280',
    fontSize: 12,
    fontStyle: 'italic',
  },
  serviceMetaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.6)',
  },
  serviceTimeText: {
    marginLeft: 4,
    fontSize: 11,
    color: '#e5e7eb',
  },
  serviceSelectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(22,163,74,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.7)',
  },
  serviceSelectedText: {
    marginLeft: 4,
    fontSize: 11,
    color: '#bbf7d0',
    fontWeight: '600',
  },

  bookButton: {
    marginTop: spacing.md,
  },

  // AVIS
  leaveReviewButton: {
    paddingHorizontal: 0,
  },
  noReviewsCard: {
    marginTop: 8,
    borderRadius: radii.xl,
    padding: spacing.md,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
    alignItems: 'center',
  },
  noReviewsTitle: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  noReviewsText: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSubtle,
    textAlign: 'center',
  },
  reviewWrapper: {
    marginTop: 8,
  },
  reviewCard: {
    borderRadius: radii.lg,
    padding: spacing.md,
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(31,41,55,0.9)',
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  reviewAvatarText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  reviewHeaderText: {
    flex: 1,
    justifyContent: 'center',
  },
  reviewAuthor: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  reviewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  reviewRatingValue: {
    fontSize: 12,
    color: '#facc15',
  },
  reviewComment: {
    marginTop: 4,
    fontSize: 13,
    color: colors.text,
  },
  reviewCommentMuted: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSubtle,
    fontStyle: 'italic',
  },
  moreReviewsHint: {
    marginTop: 4,
    fontSize: 11,
    color: colors.textSubtle,
  },
});
