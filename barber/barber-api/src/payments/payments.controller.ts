import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // POST /api/payments/bookings/:id/intent
  @UseGuards(JwtAuthGuard)
  @Post('bookings/:id/intent')
  async createIntentForBooking(@Param('id') bookingId: string, @Req() req: any) {
    const userId = req.user.sub;
    return this.paymentsService.createPaymentIntentForBooking(bookingId, userId);
  }
}
