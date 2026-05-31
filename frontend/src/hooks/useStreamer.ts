import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export function useStreamer() {
  const [streamer, setStreamer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/auth/me')
      .then(setStreamer)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  return { streamer, loading, refetch: () => api.get('/auth/me').then(setStreamer) };
}
