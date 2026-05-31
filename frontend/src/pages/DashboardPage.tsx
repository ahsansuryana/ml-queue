import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';

interface QueueEntry {
  id: string;
  playerId: string;
  queueType: 'NORMAL' | 'FASTRACK';
  player: { idMlPlayer: string; namaSociaBuzz: string };
  timestamp: string;
}

export default function DashboardPage() {
  const [batch, setBatch] = useState<QueueEntry[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);

  const fetchQueue = useCallback(async () => {
    try {
      const data = await api.get('/queue');
      setBatch(data.batch);
      setQueue(data.queue);
      setTotal(data.total);
    } catch {}
  }, []);

  useEffect(() => {
    fetchQueue();
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`);
    ws.onopen = () => setWsConnected(true);
    ws.onmessage = () => fetchQueue();
    ws.onclose = () => setWsConnected(false);
    const interval = setInterval(fetchQueue, 5000);
    return () => { clearInterval(interval); ws.close(); };
  }, [fetchQueue]);

  const handleSkip = async (id: string) => {
    await api.post(`/queue/skip/${id}`);
    fetchQueue();
  };

  const handlePull = async (id: string) => {
    await api.post(`/queue/pull/${id}`);
    fetchQueue();
  };

  const handleConfirm = async () => {
    const ids = batch.map((e) => e.playerId);
    if (ids.length < 4) return;
    await api.post('/queue/confirm', { playerIds: ids });
    fetchQueue();
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const typeBadge = (t: string) =>
    t === 'FASTRACK'
      ? 'bg-accent-fast/10 text-accent-fast'
      : 'bg-accent-normal/10 text-accent-normal';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <span className={`text-xs px-2 py-1 rounded-full ${wsConnected ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
          {wsConnected ? 'Live' : 'Polling'}
        </span>
      </div>

      <div className="bg-bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
          Current Batch ({batch.length}/4)
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {batch.map((entry) => (
            <div key={entry.id} className="bg-bg-surface-2 border border-border rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded ${typeBadge(entry.queueType)}`}>
                  {entry.queueType === 'FASTRACK' ? 'FAST' : 'NORM'}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{entry.player.namaSociaBuzz}</p>
                  <p className="text-xs text-text-muted font-mono">{entry.player.idMlPlayer}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs text-text-muted font-mono mr-2">{formatTime(entry.timestamp)}</span>
                <button onClick={() => handleSkip(entry.id)} className="text-xs px-2 py-1 rounded border border-danger/30 text-danger hover:bg-danger/10 transition-colors">Skip</button>
                <button onClick={() => handlePull(entry.id)} className="text-xs px-2 py-1 rounded border border-border text-text-secondary hover:bg-bg-surface-3 transition-colors">Pull</button>
              </div>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 4 - batch.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-bg-surface-2 border border-dashed border-border rounded-lg p-3 flex items-center justify-center">
              <span className="text-sm text-text-muted">⏳ Waiting...</span>
            </div>
          ))}
        </div>
        <button
          onClick={handleConfirm}
          disabled={batch.length < 4}
          className="mt-4 w-full py-2.5 rounded-lg bg-accent-fast text-white font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent-fast/90 transition-colors"
        >
          CONFIRM GROUP ({batch.length}/4)
        </button>
      </div>

      <div className="bg-bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
          Queue List ({total} menunggu)
        </h2>
        <div className="space-y-2">
          {queue.map((entry) => (
            <div key={entry.id} className="bg-bg-surface-2 border border-border rounded-lg px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded ${typeBadge(entry.queueType)}`}>
                  {entry.queueType === 'FASTRACK' ? 'FAST' : 'NORM'}
                </span>
                <div className="min-w-0">
                  <p className="text-sm truncate">{entry.player.namaSociaBuzz}</p>
                  <p className="text-xs text-text-muted font-mono">{entry.player.idMlPlayer}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-text-muted font-mono">{formatTime(entry.timestamp)}</span>
                <button onClick={() => handlePull(entry.id)} className="text-xs px-2 py-1 rounded border border-border text-text-secondary hover:bg-bg-surface-3 transition-colors">Pull</button>
              </div>
            </div>
          ))}
          {queue.length === 0 && (
            <p className="text-sm text-text-muted text-center py-6">Belum ada antrian</p>
          )}
        </div>
      </div>
    </div>
  );
}
