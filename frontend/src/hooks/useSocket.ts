import { useEffect, useState } from 'react';
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

  return { socket, connected };
}
