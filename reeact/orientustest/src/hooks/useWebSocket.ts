import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = 'http://localhost:8084/ws';
const TOKEN_KEY = 'orientus_token';

interface Subscription {
  destination: string;
  callback: (body: unknown) => void;
}

export function useWebSocket(userId: number | undefined) {
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<string, ReturnType<Client['subscribe']>>>(
    new Map()
  );
  const pendingRef = useRef<Subscription[]>([]);
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!userId) return;

    const token = localStorage.getItem(TOKEN_KEY);

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        userId: String(userId),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        connectedRef.current = true;
        // Subscribe any pending subscriptions
        pendingRef.current.forEach(({ destination, callback }) => {
          const sub = client.subscribe(destination, (message) => {
            try {
              callback(JSON.parse(message.body));
            } catch {
              callback(message.body);
            }
          });
          subscriptionsRef.current.set(destination, sub);
        });
        pendingRef.current = [];
      },
      onDisconnect: () => {
        connectedRef.current = false;
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame.headers['message']);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      connectedRef.current = false;
      subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
      subscriptionsRef.current.clear();
      pendingRef.current = [];
      client.deactivate();
      clientRef.current = null;
    };
  }, [userId]);

  const subscribe = useCallback(
    (destination: string, callback: (body: unknown) => void) => {
      // Already subscribed
      if (subscriptionsRef.current.has(destination)) return;

      if (connectedRef.current && clientRef.current) {
        const sub = clientRef.current.subscribe(destination, (message) => {
          try {
            callback(JSON.parse(message.body));
          } catch {
            callback(message.body);
          }
        });
        subscriptionsRef.current.set(destination, sub);
      } else {
        // Queue for when connected
        pendingRef.current.push({ destination, callback });
      }
    },
    []
  );

  const unsubscribe = useCallback((destination: string) => {
    const sub = subscriptionsRef.current.get(destination);
    if (sub) {
      sub.unsubscribe();
      subscriptionsRef.current.delete(destination);
    }
    pendingRef.current = pendingRef.current.filter(
      (p) => p.destination !== destination
    );
  }, []);

  return { subscribe, unsubscribe };
}
