'use client';

import React, { useEffect, useState } from 'react';

export function CounterWidget() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      // Vulnerable: Stale closure bug - count is captured at 0 and never updates
      // setCount(count + 1) continually sets state to 0 + 1 = 1
      setCount(count + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []); // Missing count in dependency array or functional updater setCount(prev => prev + 1)

  return <div>Live Count: {count}</div>;
}
