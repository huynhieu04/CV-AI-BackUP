import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const role = auth.getCurrentUser()?.role;
    if (role === 'ADMIN') return true;

    return router.createUrlTree(['/ai-classification']);
};
