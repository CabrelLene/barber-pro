// src/bookings/dto/create-booking.dto.ts
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  barberId: string;

  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @IsDateString()
  scheduledAt: string; // ISO string : "2025-11-20T15:30:00.000Z" ou locale convertie côté front
}
