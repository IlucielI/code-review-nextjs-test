// Memory leak via EventEmitter without cleanup
'use client';

import { useEffect, useState } from 'react';
import { EventEmitter } from 'events';

// Global emitter - shared across all instances
const globalEmitter = new EventEmitter();

export default function NotificationComponent() {
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    // Vulnerable: Listener added but never removed
    globalEmitter.on('notification', (message: string) => {
      setNotifications(prev => [...prev, message]);
    });

    // Missing cleanup - memory leak!
    // Component unmounts but listener persists
  }, []);

  return (
    <div>
      {notifications.map((n, i) => <div key={i}>{n}</div>)}
    </div>
  );
}

// Vulnerable: WebSocket without cleanup
export function ChatComponent() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const ws = new WebSocket('wss://example.com/chat');

    ws.onmessage = (event) => {
      setMessages(prev => [...prev, event.data]);
    };

    // No cleanup - connection remains open after unmount
  }, []);

  return <div>{messages.join(', ')}</div>;
}

// Vulnerable: setInterval without cleanup
export function TimerComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setInterval(() => {
      setCount(c => c + 1);
    }, 1000);

    // Missing clearInterval - timer continues after unmount
  }, []);

  return <div>Count: {count}</div>;
}

// Vulnerable: Multiple listeners accumulate
export function SubscriptionComponent({ userId }: { userId: string }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    // New listener added on every userId change
    globalEmitter.on(`user:${userId}`, setData);

    // Old listeners never removed - accumulates on prop changes
  }, [userId]);

  return <div>{JSON.stringify(data)}</div>;
}
