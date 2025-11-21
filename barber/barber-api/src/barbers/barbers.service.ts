// src/barbers/barbers.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBarberProfileDto } from './dto/create-barber-profile.dto';
import { UserRole } from '@prisma/client';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class BarbersService {
  constructor(private prisma: PrismaService) {}

  async createBarberProfile(userId: string, dto: CreateBarberProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    // s’assurer que le user est bien BARBER
    if (user.role !== UserRole.BARBER) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { role: UserRole.BARBER },
      });
    }

    const existingProfile = await this.prisma.barberProfile.findUnique({
      where: { userId },
    });

    const commonData = {
      shopName: dto.shopName,
      addressLine1: dto.addressLine1,
      addressLine2: dto.addressLine2,
      city: dto.city,
      province: dto.province,
      postalCode: dto.postalCode.toUpperCase(),
      description: dto.description,
      phone: dto.phone,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
    };

    if (existingProfile) {
      return this.prisma.barberProfile.update({
        where: { id: existingProfile.id },
        data: commonData,
        include: {
          user: { select: { id: true, email: true, fullName: true } },
          services: true,
        },
      });
    }

    return this.prisma.barberProfile.create({
      data: {
        userId,
        ...commonData,
      },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        services: true,
      },
    });
  }

  // ➜ Liste de barbers proches + stats de notes
  async findNearby(postalCode?: string, city?: string) {
    const whereClauses: any[] = [];

    if (postalCode) {
      whereClauses.push({
        postalCode: { startsWith: postalCode.toUpperCase() },
      });
    }

    if (city) {
      whereClauses.push({
        city: { equals: city, mode: 'insensitive' },
      });
    }

    const where = whereClauses.length ? { OR: whereClauses } : {};

    const barbers = await this.prisma.barberProfile.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true } },
        services: true,
        reviews: {
          select: { rating: true },
        },
      },
      take: whereClauses.length === 0 ? 20 : 50,
    });

    // calcul ratingAverage / ratingCount
    return barbers.map((b) => {
      const ratings = b.reviews.map((r) => r.rating);
      const ratingCount = ratings.length;
      const ratingAverage =
        ratingCount > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratingCount
          : null;

      // on ne renvoie pas la liste brute des reviews ici
      const { reviews, ...rest } = b;

      return {
        ...rest,
        ratingAverage,
        ratingCount,
      };
    });
  }

  // ➜ Détail d’un barber + services + avis récents + stats
  async findOne(id: string) {
    const barber = await this.prisma.barberProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true } },
        services: true,
        reviews: {
          include: {
            client: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!barber) throw new NotFoundException('Barber introuvable');

    const ratings = barber.reviews.map((r) => r.rating);
    const ratingCount = ratings.length;
    const ratingAverage =
      ratingCount > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratingCount
        : null;

    return {
      ...barber,
      ratingAverage,
      ratingCount,
    };
  }

  // ➜ Créer un avis pour un barber
  async addReview(barberId: string, clientId: string, dto: CreateReviewDto) {
    const barber = await this.prisma.barberProfile.findUnique({
      where: { id: barberId },
    });
    if (!barber) {
      throw new NotFoundException('Barber introuvable');
    }

    // bonus : empêcher un barber de se noter lui-même
    if (barber.userId === clientId) {
      throw new ForbiddenException('Tu ne peux pas noter ton propre profil.');
    }

    const review = await this.prisma.review.create({
      data: {
        barberId,
        clientId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    return review;
  }

  // ➜ Récupérer les avis d’un barber + stats
  async getReviewsForBarber(barberId: string) {
    const barber = await this.prisma.barberProfile.findUnique({
      where: { id: barberId },
    });
    if (!barber) {
      throw new NotFoundException('Barber introuvable');
    }

    const reviews = await this.prisma.review.findMany({
      where: { barberId },
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    const ratings = reviews.map((r) => r.rating);
    const ratingCount = ratings.length;
    const ratingAverage =
      ratingCount > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratingCount
        : null;

    return {
      reviews,
      ratingAverage,
      ratingCount,
    };
  }
}
