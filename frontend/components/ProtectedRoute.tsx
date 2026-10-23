'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type UserRole = 'ADMIN' | 'HR' | 'EMPLOYEE';

type ProtectedRouteOptions = {
  allowedRoles?: UserRole[];
};

export function useProtectedRoute(options: ProtectedRouteOptions = {}) {
  const router = useRouter();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const allowedRolesKey = options.allowedRoles?.join('|') || '';

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('currentUser');

    if (!token || !savedUser) {
      router.replace('/sign-in');
      return;
    }

    try {
      const user = JSON.parse(savedUser) as { role?: UserRole };
      const validRole = ['ADMIN', 'HR', 'EMPLOYEE'].includes(user.role || '');

      if (!validRole) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');
        router.replace('/sign-in');
        return;
      }

      if (allowedRolesKey && !allowedRolesKey.split('|').includes(user.role!)) {
        router.replace('/dashboard');
        return;
      }

      setCheckingAccess(false);
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('currentUser');
      router.replace('/sign-in');
    }
  }, [allowedRolesKey, router]);

  return checkingAccess;
}
