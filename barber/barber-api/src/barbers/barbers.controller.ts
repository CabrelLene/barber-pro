// src/barbers/barbers.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BarbersService } from './barbers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBarberProfileDto } from './dto/create-barber-profile.dto';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('barbers')
export class BarbersController {
  constructor(private readonly barbersService: BarbersService) {}

  // ✅ Création / mise à jour du profil barber pour l'utilisateur connecté
  @UseGuards(JwtAuthGuard)
  @Post('profile')
  async createProfile(@Req() req: any, @Body() dto: CreateBarberProfileDto) {
    const userId = req.user.sub;
    return this.barbersService.createBarberProfile(userId, dto);
  }

  // ✅ Route utilisée par le mobile : /api/barbers/nearby?postalCode=H3N&city=Montreal
  @Get('nearby')
  async getNearby(
    @Query('postalCode') postalCode?: string,
    @Query('city') city?: string,
  ) {
    return this.barbersService.findNearby(postalCode, city);
  }

  // ✅ Détail d'un barber (avec stats + derniers avis)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.barbersService.findOne(id);
  }

  // ✅ Créer un avis pour un barber (client connecté)
  @UseGuards(JwtAuthGuard)
  @Post(':id/reviews')
  async createReview(
    @Param('id') barberId: string,
    @Req() req: any,
    @Body() dto: CreateReviewDto,
  ) {
    const clientId = req.user.sub;
    return this.barbersService.addReview(barberId, clientId, dto);
  }

  // ✅ Récupérer les avis d’un barber + stats
  @Get(':id/reviews')
  async getReviews(@Param('id') barberId: string) {
    return this.barbersService.getReviewsForBarber(barberId);
  }
}
