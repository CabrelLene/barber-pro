// src/api/bookings.ts
import { api } from './client';

export interface Booking {
  id: string;
  scheduledAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED' | 'NO_SHOW';
  totalPriceCents: number;
  service: {
    id: string;
    name: string;
    durationMin: number;
    priceCents: number;
  };
  barber: {
    id: string;
    shopName: string;
    city: string;
    province: string;
    postalCode: string;
  };
  client?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
  };
}

// ✅ création d’une réservation
export async function createBooking(payload: {
  barberId: string;
  serviceId: string;
  scheduledAt: string; // ISO
}): Promise<Booking> {
  const res = await api.post<Booking>('/bookings', payload);
  return res.data;
}

// ✅ réservations du client connecté
export async function fetchMyBookings(): Promise<Booking[]> {
  const res = await api.get<Booking[]>('/bookings/me');
  return res.data;
}

// ✅ annuler une réservation côté client
export async function cancelBooking(bookingId: string): Promise<Booking> {
  const res = await api.patch<Booking>(`/bookings/${bookingId}/cancel`, {});
  return res.data;
}

// ✅ réservations du barber connecté
export async function fetchBarberBookings(): Promise<Booking[]> {
  const res = await api.get<Booking[]>('/bookings/barber/me');
  return res.data;
}

// ✅ changer le statut d’un booking côté barber
// (route backend : PATCH /bookings/:id/status)
export async function updateBarberBookingStatus(
  bookingId: string,
  status: Booking['status'],
): Promise<Booking> {
  const res = await api.patch<Booking>(`/bookings/${bookingId}/status`, {
    status,
  });
  return res.data;
}

// ✅ créer (ou récupérer) un PaymentIntent Stripe pour une réservation
// (route backend : POST /payments/bookings/:id/intent)
export async function createPaymentIntentForBooking(bookingId: string): Promise<{
  clientSecret: string | null;
  paymentIntentId: string;
}> {
  const res = await api.post<{
    clientSecret: string | null;
    paymentIntentId: string;
  }>(`/payments/bookings/${bookingId}/intent`, {});
  return res.data;
}
