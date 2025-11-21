// src/auth/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

// @Roles(UserRole.BARBER, UserRole.ADMIN)
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
