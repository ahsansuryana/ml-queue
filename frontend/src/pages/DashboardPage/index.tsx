import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api';
import styles from './dashboard.module.css';

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

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>Dashboard</h1>
        <div className={`${styles.statusBadge} ${wsConnected ? styles.statusLive : styles.statusPolling}`}>
          <span className={`${styles.statusDot} ${wsConnected ? styles.statusDotLive : styles.statusDotPolling}`} />
          {wsConnected ? 'Live' : 'Polling'}
        </div>
      </div>

      <div className={styles.batchPanel}>
        <div className={styles.batchHeader}>
          <h2 className={styles.batchTitle}>Current Batch</h2>
          <span className={styles.batchCount}>{batch.length}/4</span>
        </div>

        <div className={styles.batchGrid}>
          {batch.map((entry) => (
            <div key={entry.id} className={styles.slotCard} style={{ animationDelay: `${batch.indexOf(entry) * 0.05}s` }}>
              <div className={styles.slotInfo}>
                <span className={`${styles.slotType} ${entry.queueType === 'FASTRACK' ? styles.slotTypeFast : styles.slotTypeNormal}`}>
                  {entry.queueType === 'FASTRACK' ? 'FAST' : 'NORM'}
                </span>
                <div className={styles.slotInfo}>
                  <div>
                    <p className={styles.slotName}>{entry.player.namaSociaBuzz}</p>
                    <p className={styles.slotMlId}>{entry.player.idMlPlayer}</p>
                  </div>
                </div>
              </div>
              <div className={styles.slotActions}>
                <span className={styles.slotTime}>{formatTime(entry.timestamp)}</span>
                <button onClick={() => handleSkip(entry.id)} className={styles.btnSkip}>Skip</button>
                <button onClick={() => handlePull(entry.id)} className={styles.btnPull}>Pull</button>
              </div>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 4 - batch.length) }).map((_, i) => (
            <div key={`empty-${i}`} className={styles.slotEmpty}>
              <span>Empty Slot</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleConfirm}
          disabled={batch.length < 4}
          className={styles.confirmBtn}
        >
          Confirm Group — {batch.length}/4
        </button>
      </div>

      <div className={styles.queuePanel}>
        <div className={styles.queueHeader}>
          <h2 className={styles.queueTitle}>Queue List</h2>
          <span className={styles.queueTotal}>{total} waiting</span>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Player</th>
              <th>MLBB ID</th>
              <th>Time</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {queue.map((entry) => (
              <tr key={entry.id} className={styles.tableRow}>
                <td>
                  <span className={`${styles.slotType} ${entry.queueType === 'FASTRACK' ? styles.slotTypeFast : styles.slotTypeNormal}`}>
                    {entry.queueType === 'FASTRACK' ? 'FAST' : 'NORM'}
                  </span>
                </td>
                <td className={styles.slotName}>{entry.player.namaSociaBuzz}</td>
                <td><span className={styles.slotMlId}>{entry.player.idMlPlayer}</span></td>
                <td><span className={styles.slotTime}>{formatTime(entry.timestamp)}</span></td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => handlePull(entry.id)} className={styles.btnPull}>Pull</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {queue.length === 0 && (
          <div className={styles.queueEmpty}>No players in queue</div>
        )}
      </div>
    </div>
  );
}
