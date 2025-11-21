// src/users/users.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createClient(data: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException('Email déjà utilisé');
    }

    const hashed = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        fullName: data.fullName,
        phone: data.phone,
        role: UserRole.CLIENT,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // ✅ Version robuste : string OU objet { email: string }
  async findByEmail(emailOrUser: string | { email: string }) {
    console.log(
      '🔎 UsersService.findByEmail() appelé avec :',
      typeof emailOrUser,
      emailOrUser,
    );

    let email: string | undefined;

    if (typeof emailOrUser === 'string') {
      email = emailOrUser;
    } else if (
      emailOrUser &&
      typeof emailOrUser === 'object' &&
      'email' in emailOrUser
    ) {
      email = (emailOrUser as any).email;
    }

    if (!email || typeof email !== 'string') {
      console.warn(
        '⚠️ findByEmail: impossible d’extraire un email string. On renvoie null.',
      );
      return null;
    }

    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
      },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }
    return user;
  }
}
