// src/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Rôles demandés par le décorateur @Roles()
    const requiredRoles =
      this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    // S’il n’y a pas de @Roles, on laisse passer (le JwtAuthGuard se charge
    // juste de vérifier que l’utilisateur est loggé)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // injecté par JwtStrategy

    if (!user || !user.role) {
      return false;
    }

    // Exemple : requiredRoles = [UserRole.BARBER]
    return requiredRoles.includes(user.role);
  }
}
