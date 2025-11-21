// src/bookings/bookings.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  // Création d'une réservation pour le client connecté
  async createBooking(clientId: string, dto: CreateBookingDto) {
    // Vérifier que le service existe bien
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
      include: { barber: true },
    });

    if (!service) {
      throw new NotFoundException('Service introuvable');
    }

    // Vérifier que le service appartient bien au barber demandé
    if (service.barberId !== dto.barberId) {
      throw new BadRequestException(
        "Ce service n'appartient pas au barber sélectionné.",
      );
    }

    const booking = await this.prisma.booking.create({
      data: {
        clientId,
        barberId: dto.barberId,
        serviceId: dto.serviceId,
        scheduledAt: dto.scheduledAt,
        totalPriceCents: service.priceCents,
      },
      include: {
        barber: {
          select: {
            id: true,
            shopName: true,
            city: true,
            province: true,
            postalCode: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            durationMin: true,
            priceCents: true,
          },
        },
      },
    });

    return booking;
  }

  // Toutes les réservations du client connecté
  async findForClient(clientId: string) {
    return this.prisma.booking.findMany({
      where: { clientId },
      orderBy: { scheduledAt: 'asc' },
      include: {
        barber: {
          select: {
            id: true,
            shopName: true,
            city: true,
            province: true,
            postalCode: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            durationMin: true,
            priceCents: true,
          },
        },
      },
    });
  }

  // 🔥 Annuler une réservation (côté client)
  async cancelBooking(bookingId: string, clientId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Réservation introuvable');
    }

    if (booking.clientId !== clientId) {
      throw new ForbiddenException(
        'Tu ne peux annuler que tes propres réservations.',
      );
    }

    if (
      booking.status === BookingStatus.CANCELED ||
      booking.status === BookingStatus.COMPLETED ||
      booking.status === BookingStatus.NO_SHOW
    ) {
      throw new ForbiddenException(
        'Cette réservation ne peut plus être annulée.',
      );
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELED,
      },
      include: {
        barber: {
          select: {
            id: true,
            shopName: true,
            city: true,
            province: true,
            postalCode: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            durationMin: true,
            priceCents: true,
          },
        },
      },
    });
  }

  // 🔥 Toutes les réservations liées au barber (via userId du barber)
 // ➜ toutes les réservations pour le barber lié à ce userId
async findForBarberUser(userId: string) {
  const barberProfile = await this.prisma.barberProfile.findUnique({
    where: { userId },
  });

  if (!barberProfile) {
    throw new ForbiddenException("Ce compte n'est pas configuré comme barber.");
  }

  return this.prisma.booking.findMany({
    where: { barberId: barberProfile.id },
    orderBy: { scheduledAt: 'asc' },
    include: {
      client: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
      service: {
        select: {
          id: true,
          name: true,
          durationMin: true,
          priceCents: true,
        },
      },
      barber: {
        select: {
          id: true,
          shopName: true,
          city: true,
          province: true,
          postalCode: true,
        },
      },
    },
  });
}


  // 🔥 Mise à jour du statut par le barber
  async updateStatusForBarber(
    barberUserId: string,
    bookingId: string,
    newStatus: BookingStatus,
  ) {
    const barberProfile = await this.prisma.barberProfile.findUnique({
      where: { userId: barberUserId },
    });

    if (!barberProfile) {
      throw new NotFoundException('Profil barber introuvable');
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Réservation introuvable');
    }

    if (booking.barberId !== barberProfile.id) {
      throw new ForbiddenException(
        'Tu ne peux modifier que tes propres rendez-vous.',
      );
    }

    // On ne peut plus toucher à une résa déjà close
    if (
      booking.status === BookingStatus.COMPLETED ||
      booking.status === BookingStatus.NO_SHOW ||
      booking.status === BookingStatus.CANCELED
    ) {
      throw new ForbiddenException(
        'Cette réservation est déjà finalisée et ne peut plus être modifiée.',
      );
    }

    // Règles métier sans includes() pour faire plaisir à TS
    if (booking.status === BookingStatus.PENDING) {
      // Depuis PENDING, on n’autorise que CONFIRMED ou CANCELED
      if (
        newStatus !== BookingStatus.CONFIRMED &&
        newStatus !== BookingStatus.CANCELED
      ) {
        throw new BadRequestException(
          'Depuis le statut "PENDING", tu peux seulement passer à CONFIRMED ou CANCELED.',
        );
      }
    } else if (booking.status === BookingStatus.CONFIRMED) {
      // Depuis CONFIRMED, on autorise COMPLETED, NO_SHOW ou CANCELED
      if (
        newStatus !== BookingStatus.COMPLETED &&
        newStatus !== BookingStatus.NO_SHOW &&
        newStatus !== BookingStatus.CANCELED
      ) {
        throw new BadRequestException(
          'Depuis le statut "CONFIRMED", tu peux seulement passer à COMPLETED, NO_SHOW ou CANCELED.',
        );
      }
    } else {
      // Au cas où on rajoute un statut plus tard
      throw new BadRequestException(
        "Ce statut de réservation ne peut pas être modifié.",
      );
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: newStatus,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            durationMin: true,
            priceCents: true,
          },
        },
      },
    });
  }
}
