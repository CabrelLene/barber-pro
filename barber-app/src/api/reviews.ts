// src/api/reviews.ts
import { api } from './client';

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  client: {
    id: string;
    fullName: string;
  };
}

// Récupérer les avis d'un barber
export async function fetchBarberReviews(
  barberId: string,
): Promise<Review[]> {
  const res = await api.get<Review[]>(`/reviews/barber/${barberId}`);
  return res.data;
}

// Créer un avis
export async function createReview(payload: {
  barberId: string;
  rating: number;
  comment?: string;
}): Promise<Review> {
  const res = await api.post<Review>('/reviews', payload);
  return res.data;
}
