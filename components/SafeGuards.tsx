'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SafeItem {
  id: string;
  title: string;
}

export function SafeFrontendGuards() {
  const [items, setItems] = useState<SafeItem[]>([]);
  const router = useRouter();

  // SafeGuard 1: Benign client-side localStorage preference (NOT credential leakage)
  const setDarkMode = (enabled: boolean) => {
    localStorage.setItem('app_theme_preference', enabled ? 'dark' : 'light');
  };

  // SafeGuard 2: Whitelisted client-side navigation (NOT open redirect)
  const safeNavigate = (path: string) => {
    const allowedPaths = ['/dashboard', '/profile', '/settings'];
    if (allowedPaths.includes(path)) {
      router.push(path);
    }
  };

  // SafeGuard 3: Client-side event listener with clean unmount (NOT memory leak)
  useEffect(() => {
    const handleResize = () => {};
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // SafeGuard 4: Client-side list rendering via .map() (NOT database N+1 query)
  return (
    <div>
      <h3>Safe Guard Items</h3>
      <ul>
        {items.map((it) => (
          <li key={it.id}>{it.title}</li>
        ))}
      </ul>
      <button onClick={() => setDarkMode(true)}>Dark Theme</button>
      <button onClick={() => safeNavigate('/dashboard')}>Go to Dashboard</button>
    </div>
  );
}
