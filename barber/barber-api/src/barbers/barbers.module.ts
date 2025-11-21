import { Module } from '@nestjs/common';
import { BarbersController } from './barbers.controller';
import { BarbersService } from './barbers.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BarbersController],
  providers: [BarbersService],
  exports: [BarbersService],
})
export class BarbersModule {}
