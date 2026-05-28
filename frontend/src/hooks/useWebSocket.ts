'use client';

import { useEffect, useRef, useCallback } from 'react';
import { WSEvent } from '@/types';

interface UseWebSocketOptions {
  assignmentId: string | null;
  onEvent: (event: WSEvent) => void;
  onOpen?: () => void;
}

export function useWebSocket({ assignmentId, onEvent, onOpen }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!assignmentId) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', assignmentId }));
      onOpen?.();
    };

    ws.onmessage = (event) => {
      try {
        const data: WSEvent = JSON.parse(event.data);
        onEvent(data);
      } catch {
        // ignore malformed
      }
    };

    ws.onclose = () => {
      // attempt reconnect once after 2s if not intentionally closed
      reconnectTimer.current = setTimeout(connect, 2000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [assignmentId, onEvent, onOpen]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    wsRef.current?.close();
  }, []);

  return { disconnect };
}
