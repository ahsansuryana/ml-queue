import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useSocket(streamerId?: string) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!streamerId) return;
    socket = io('/', {
      query: { streamerId },
      transports: ['websocket', 'polling'],
    });
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    return () => { socket?.disconnect(); };
  }, [streamerId]);

  const emit = useCallback((event: string, data?: unknown) => {
    socket?.emit(event, data);
  }, []);

  return { socket, connected };
}
