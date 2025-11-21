// src/api/barbers.ts
import { api } from './client';

export interface Service {
  id: string;
  name: string;
  description?: string | null;
  durationMin: number;
  priceCents: number;
  imageUrl?: string | null;
}

export interface BarberReview {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  client: {
    id: string;
    fullName: string;
  };
}

export interface Barber {
  id: string;
  shopName: string;
  description?: string | null;
  phone?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  province: string;
  postalCode: string;
  services: Service[];

  user?: {
    id: string;
    fullName: string;
  };

  ratingAverage?: number | null;
  ratingCount?: number;
  reviews?: BarberReview[];
}

// ➜ GET /barbers/nearby
export async function fetchNearbyBarbers(params: {
  postalCode?: string;
  city?: string;
}): Promise<Barber[]> {
  const res = await api.get<Barber[]>('/barbers/nearby', { params });
  return res.data;
}

// ➜ GET /barbers/:id
export async function fetchBarberById(id: string): Promise<Barber> {
  const res = await api.get<Barber>(`/barbers/${id}`);
  return res.data;
}

// ➜ GET /barbers/:id/reviews
export async function fetchBarberReviews(barberId: string): Promise<{
  reviews: BarberReview[];
  ratingAverage: number | null;
  ratingCount: number;
}> {
  const res = await api.get<{
    reviews: BarberReview[];
    ratingAverage: number | null;
    ratingCount: number;
  }>(`/barbers/${barberId}/reviews`);
  return res.data;
}

// ➜ POST /barbers/:id/reviews
export async function createBarberReview(barberId: string, payload: {
  rating: number;
  comment?: string;
}): Promise<BarberReview> {
  const res = await api.post<BarberReview>(`/barbers/${barberId}/reviews`, payload);
  return res.data;
}
