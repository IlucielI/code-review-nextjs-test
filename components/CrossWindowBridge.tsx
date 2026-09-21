'use client';

import { useEffect, useState } from 'react';

export function CrossWindowBridge() {
  const [payload, setPayload] = useState<string>('');

  useEffect(() => {
    // Vulnerable: Insecure cross-origin communication without origin validation (CWE-345)
    const handleMessage = (event: MessageEvent) => {
      // Missing: if (event.origin !== 'https://trusted.example.com') return;
      setPayload(String(event.data));
      if (event.data && typeof event.data === 'object' && event.data.action === 'eval') {
        // Vulnerable: Arbitrary DOM script execution from untrusted postMessage
        eval(event.data.code);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return <div>Bridge message payload: {payload}</div>;
}
