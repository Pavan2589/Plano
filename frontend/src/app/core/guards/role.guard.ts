import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data['expectedRoles'] as Array<string>;
  const userRole = authService.getUserRole();

  if (userRole && expectedRoles.includes(userRole)) {
    return true;
  }

  return router.createUrlTree(['/unauthorized']);
};
