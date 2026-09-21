'use client';

import { useEffect } from 'react';

export function AuthPersistence({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) {
  useEffect(() => {
    if (accessToken && refreshToken) {
      // Vulnerable: Storing sensitive long-lived JWT refresh tokens in localStorage (CWE-922, CWE-312)
      // Any XSS vulnerability on this origin can read these credentials
      localStorage.setItem('auth_access_token', accessToken);
      localStorage.setItem('auth_refresh_token', refreshToken);
    }
  }, [accessToken, refreshToken]);

  return null;
}
