import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // If trying to access login page and already logged in, redirect to dashboard
  if (state.url === '/login' && auth.isLoggedIn()) {
    router.navigate(['/dashboard']);
    return false;
  }

  // If not logged in and trying to access protected route, redirect to login
  if (!auth.isLoggedIn() && state.url !== '/login') {
    router.navigate(['/login']);
    return false;
  }

  return true;
}; 