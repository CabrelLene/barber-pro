// src/components/BarberCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Barber } from '../api/barbers';

interface Props {
  barber: Barber;
}

export const BarberCard: React.FC<Props> = ({ barber }) => {
  const mainService = barber.services[0];

  return (
    <View style={styles.card}>
      <Text style={styles.shopName}>{barber.shopName}</Text>
      <Text style={styles.ownerName}>{barber.user.fullName}</Text>
      <Text style={styles.address}>
        {barber.addressLine1}
        {barber.city ? `, ${barber.city}` : ''} ({barber.postalCode})
      </Text>
      {barber.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {barber.description}
        </Text>
      ) : null}
      {mainService && (
        <Text style={styles.service}>
          ⭐ {mainService.name} • {mainService.durationMin} min •{' '}
          {(mainService.priceCents / 100).toFixed(2)} $
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  shopName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f9fafb',
  },
  ownerName: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    color: '#d1d5db',
  },
  description: {
    fontSize: 13,
    color: '#e5e7eb',
    marginTop: 6,
  },
  service: {
    fontSize: 13,
    color: '#a5b4fc',
    marginTop: 8,
    fontWeight: '500',
  },
});
