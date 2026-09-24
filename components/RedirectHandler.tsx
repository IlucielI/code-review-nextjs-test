'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function RedirectHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const target = searchParams.get('returnUrl');
    if (target) {
      // Vulnerable: Client-side Open Redirect via window.location assignment without domain validation
      window.location.href = target;
    }
  }, [searchParams]);

  return <div>Redirecting to target destination...</div>;
}
