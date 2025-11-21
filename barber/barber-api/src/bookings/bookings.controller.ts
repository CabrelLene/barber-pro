// src/bookings/bookings.controller.ts
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // ✅ Créer une réservation (client connecté)
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateBookingDto) {
    const clientId = req.user.sub; // id du user dans le JWT
    return this.bookingsService.createBooking(clientId, dto);
  }

  // ✅ Réservations du client connecté
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyBookings(@Req() req: any) {
    const clientId = req.user.sub;
    return this.bookingsService.findForClient(clientId);
  }

  // ✅ Réservations pour le barber lié à ce user
  @UseGuards(JwtAuthGuard)
  @Get('barber/me')
  async getBarberBookings(@Req() req: any) {
    const userId = req.user.sub;
    return this.bookingsService.findForBarberUser(userId);
  }

  // ✅ Annuler une réservation (client)
  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  async cancelBooking(@Param('id') id: string, @Req() req: any) {
    const clientId = req.user.sub;
    return this.bookingsService.cancelBooking(id, clientId);
  }

  // ✅ Changer le statut côté barber
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    return this.bookingsService.updateStatusForBarber(id, status, userId);
  }
}
