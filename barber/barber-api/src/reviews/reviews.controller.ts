// src/reviews/reviews.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Client connecté crée un avis
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateReviewDto) {
    const clientId = req.user.sub;
    return this.reviewsService.create(clientId, dto);
  }

  // Liste des avis pour un barber
  @Get('barber/:barberId')
  async getForBarber(@Param('barberId') barberId: string) {
    return this.reviewsService.findForBarber(barberId);
  }
}
