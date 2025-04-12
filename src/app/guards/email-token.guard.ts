import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const emailTokenGuard: CanActivateFn = (route, state) => {
  const token = route.queryParamMap.get('token');
  const router = inject(Router);

  if (!token) {
    router.navigateByUrl('/');
    return false;
  }

  return true;
};
