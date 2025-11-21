// src/reviews/reviews.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  // Créer un avis pour un barber
  async create(clientId: string, dto: CreateReviewDto) {
    const barber = await this.prisma.barberProfile.findUnique({
      where: { id: dto.barberId },
    });

    if (!barber) {
      throw new NotFoundException('Barber introuvable');
    }

    // Optionnel mais plus sérieux : vérifier que le client a déjà réservé
    const hasBooking = await this.prisma.booking.findFirst({
      where: {
        clientId,
        barberId: dto.barberId,
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
        },
      },
    });

    if (!hasBooking) {
      throw new ForbiddenException(
        "Tu dois avoir eu au moins une réservation avec ce barber pour laisser un avis.",
      );
    }

    return this.prisma.review.create({
      data: {
        clientId,
        barberId: dto.barberId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        client: {
          select: { id: true, fullName: true },
        },
      },
    });
  }

  // Tous les avis pour un barber
  async findForBarber(barberId: string) {
    return this.prisma.review.findMany({
      where: { barberId },
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: { id: true, fullName: true },
        },
      },
    });
  }
}
