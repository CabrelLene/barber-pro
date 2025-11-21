// src/payments/payments.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY manquant dans le .env');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-06-20' as any,
    });
  }

  /**
   * Crée (ou réutilise) un PaymentIntent pour une réservation existante.
   * Le montant vient de booking.totalPriceCents (sécurité).
   */
  async createPaymentIntentForBooking(bookingId: string, userId: string) {
    // 🔥 on cast en any pour ne plus avoir l'erreur TS sur stripePaymentIntentId
    const booking: any = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: true,
        barber: true,
      },
    });

    if (!booking) {
      throw new BadRequestException('Réservation introuvable.');
    }

    // sécurité : seul le client concerné peut payer sa réservation
    if (booking.clientId !== userId) {
      throw new ForbiddenException(
        'Tu ne peux créer un paiement que pour tes propres réservations.',
      );
    }

    if (booking.totalPriceCents <= 0) {
      throw new BadRequestException('Montant invalide pour cette réservation.');
    }

    const currency = process.env.STRIPE_CURRENCY || 'cad';

    // si on a déjà un PaymentIntent, on peut le réutiliser
    if (booking.stripePaymentIntentId) {
      const existing = await this.stripe.paymentIntents.retrieve(
        booking.stripePaymentIntentId,
      );

      // si déjà succeeded/canceled, on force un nouveau
      if (
        existing.status === 'succeeded' ||
        existing.status === 'canceled'
      ) {
        // on laisse continuer pour créer un nouveau PaymentIntent
      } else {
        return {
          clientSecret: existing.client_secret,
          paymentIntentId: existing.id,
        };
      }
    }

    // création d’un nouveau PaymentIntent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: booking.totalPriceCents,
      currency,
      metadata: {
        bookingId: booking.id,
        clientId: booking.clientId,
      },
    });

    // on sauvegarde l’id du PaymentIntent sur le booking
    await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
      } as any, // 🔥 on force le type ici aussi
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }
}
