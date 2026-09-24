'use client';

import React, { useEffect, useState } from 'react';

export function InfiniteLoopComponent() {
  const [data, setData] = useState<string[]>([]);

  // Vulnerable: Object reference recreated on every render cycle
  const requestConfig = { timeout: 5000, retries: 3 };

  useEffect(() => {
    // Vulnerable: Mutates state inside effect while depending on an unmemoized object reference
    // Triggers an infinite re-render loop crashing browser CPU and memory
    setData(['data-point-1', 'data-point-2']);
  }, [requestConfig]);

  return (
    <div>
      <h4>Items: {data.length}</h4>
    </div>
  );
}
