// src/components/BarberCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Barber } from '../api/barbers';
import { colors, radii, spacing } from '../theme';

interface Props {
  barber: Barber;
}

export const BarberCard: React.FC<Props> = ({ barber }) => {
  const mainService = barber.services[0];

  const ratingAverage =
    barber.ratingAverage != null
      ? Math.round(barber.ratingAverage * 10) / 10
      : null;

  const ratingCount = barber.ratingCount ?? 0;

  const ratingLabel =
    ratingAverage != null && ratingCount > 0
      ? `${ratingAverage} · ${ratingCount} avis`
      : 'Nouveau sur la plateforme';

  // Nom du propriétaire fallback
  const ownerName =
    barber.user?.fullName ?? 'Barber partenaire';

  // Initiales fallback (shopName > ownerName > BC)
  const initials = (
    barber.shopName?.trim().slice(0, 2) ||
    barber.user?.fullName?.trim().slice(0, 2) ||
    'BC'
  ).toUpperCase();

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        {/* Bande colorée à gauche */}
        <View style={styles.accentStrip} />

        <View style={styles.content}>
          {/* Ligne titre + note */}
          <View style={styles.headerRow}>
            <View style={styles.titleCol}>
              <Text style={styles.shopName} numberOfLines={1}>
                {barber.shopName}
              </Text>
              <Text style={styles.ownerName} numberOfLines={1}>
                par {ownerName}
              </Text>
            </View>

            <View style={styles.ratingBadge}>
              <Ionicons
                name={ratingAverage != null ? 'star' : 'sparkles-outline'}
                size={14}
                color={ratingAverage != null ? '#facc15' : '#a5b4fc'}
              />
              <Text style={styles.ratingText} numberOfLines={1}>
                {ratingLabel}
              </Text>
            </View>
          </View>

          {/* Ligne avatar + adresse */}
          <View style={styles.infoRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.infoTextCol}>
              <View style={styles.addressRow}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color="#a5b4fc"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.address} numberOfLines={1}>
                  {barber.addressLine1}
                  {barber.city ? `, ${barber.city}` : ''}{' '}
                  {barber.postalCode ? `(${barber.postalCode})` : ''}
                </Text>
              </View>

              {barber.description ? (
                <Text
                  style={styles.description}
                  numberOfLines={2}
                >
                  {barber.description}
                </Text>
              ) : (
                <Text
                  style={styles.descriptionMuted}
                  numberOfLines={1}
                >
                  Barber enregistré, services prêts à être bookés.
                </Text>
              )}
            </View>
          </View>

          {/* Service principal */}
          {mainService && (
            <View style={styles.servicePill}>
              <View style={styles.serviceLeft}>
                <View style={styles.serviceIconWrapper}>
                  <Ionicons
                    name="cut-outline"
                    size={14}
                    color="#e5e7eb"
                  />
                </View>
                <View>
                  <Text
                    style={styles.serviceName}
                    numberOfLines={1}
                  >
                    {mainService.name}
                  </Text>
                  <Text style={styles.serviceMeta}>
                    ⏱ {mainService.durationMin} min
                  </Text>
                </View>
              </View>
              <Text style={styles.servicePrice}>
                {(mainService.priceCents / 100).toFixed(2)} $
              </Text>
            </View>
          )}

          {/* Hint bas de carte */}
          <View style={styles.footerRow}>
            <View style={styles.dot} />
            <Text style={styles.footerText} numberOfLines={1}>
              Touchez la carte pour voir les créneaux et réserver.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 6,
  },
  card: {
    flexDirection: 'row',
    borderRadius: radii.xl,
    backgroundColor: 'rgba(15,23,42,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  accentStrip: {
    width: 4,
    backgroundColor: 'rgba(56,189,248,0.95)',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  titleCol: {
    flex: 1,
    paddingRight: 8,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  ownerName: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSubtle,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.6)',
    maxWidth: 130,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 11,
    color: colors.textMuted,
  },

  // Info row
  infoRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#e0f2fe',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  infoTextCol: {
    flex: 1,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    fontSize: 12,
    color: '#c7d2fe',
    flexShrink: 1,
  },
  description: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
  },
  descriptionMuted: {
    marginTop: 4,
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },

  // Service pill
  servicePill: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(15,23,42,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.45)',
    justifyContent: 'space-between',
  },
  serviceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  serviceIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(30,64,175,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  serviceMeta: {
    fontSize: 11,
    color: colors.textSubtle,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#38bdf8',
  },

  // Footer hint
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 6,
  },
  footerText: {
    fontSize: 11,
    color: colors.textSubtle,
    flex: 1,
  },
});
