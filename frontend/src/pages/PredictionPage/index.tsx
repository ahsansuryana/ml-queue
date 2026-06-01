import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import styles from './prediction.module.css';

interface Prediction {
  id: string;
  transactionId: string;
  viewerName: string;
  donationAmount: number;
  rawMessage: string;
  predictedQueue: boolean;
  predictedType: string | null;
  predictedMatches: number;
  correctedQueue: boolean | null;
  correctedType: string | null;
  correctedMatches: number | null;
  status: string;
  createdAt: string;
}

export default function PredictionPage() {
  const [logs, setLogs] = useState<Prediction[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const fetchLogs = async () => {
    const data = await api.get(`/predictions?page=${page}&limit=20`);
    setLogs(data.logs);
  };

  const fetchStats = async () => {
    const data = await api.get('/predictions/stats');
    setStats(data);
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [page]);

  const handleEdit = (log: Prediction) => {
    setEditing(log.id);
    setEditForm({
      correctedQueue: log.correctedQueue ?? log.predictedQueue,
      correctedType: log.correctedType ?? log.predictedType,
      correctedMatches: log.correctedMatches ?? log.predictedMatches,
    });
  };

  const handleSave = async (id: string) => {
    await api.patch(`/predictions/${id}`, editForm);
    setEditing(null);
    fetchLogs();
    fetchStats();
  };

  const typeBadgeClass = (t: string | null) =>
    t === 'FASTRACK' ? styles.badgeFast
    : t === 'NORMAL' ? styles.badgeNormal
    : styles.badgeSupport;

  const typeLabel = (t: string | null) => t || 'SUPPORT';

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Prediction Log</h1>

      {stats && (
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <p className={`${styles.statValue} ${styles.statValueDefault}`}>{stats.total}</p>
            <p className={styles.statLabel}>Total Predictions</p>
          </div>
          <div className={styles.statCard}>
            <p className={`${styles.statValue} ${styles.statValueWarning}`}>{stats.corrected}</p>
            <p className={styles.statLabel}>Corrected</p>
          </div>
          <div className={styles.statCard}>
            <p className={`${styles.statValue} ${styles.statValueSuccess}`}>{stats.accuracy}%</p>
            <p className={styles.statLabel}>Accuracy</p>
          </div>
        </div>
      )}

      <div className={styles.panel}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Message</th>
              <th>Predicted</th>
              <th>Corrected</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className={styles.tableRow}>
                {editing === log.id ? (
                  <>
                    <td className={styles.messageCell} title={log.rawMessage}>{log.rawMessage}</td>
                    <td>
                      <span className={`${styles.badge} ${typeBadgeClass(log.predictedType)}`}>
                        {typeLabel(log.predictedType)}
                      </span>
                      <span className={styles.badgeCount}>×{log.predictedMatches}</span>
                    </td>
                    <td>
                      <div className={styles.actionRow}>
                        <select
                          value={editForm.correctedType ?? ''}
                          onChange={(e) => setEditForm({ ...editForm, correctedType: e.target.value || null })}
                          className={styles.editSelect}
                        >
                          <option value="">SUPPORT</option>
                          <option value="NORMAL">NORMAL</option>
                          <option value="FASTRACK">FASTRACK</option>
                        </select>
                        <input
                          type="number"
                          value={editForm.correctedMatches}
                          onChange={(e) => setEditForm({ ...editForm, correctedMatches: parseInt(e.target.value) || 0 })}
                          className={styles.editInput}
                        />
                      </div>
                    </td>
                    <td><span className={styles.statusEditing}>EDITING</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div className={styles.actionRow} style={{ justifyContent: 'flex-end' }}>
                        <button onClick={() => handleSave(log.id)} className={styles.saveEditBtn}>Save</button>
                        <button onClick={() => setEditing(null)} className={styles.cancelEditBtn}>Cancel</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className={styles.messageCell} title={log.rawMessage}>{log.rawMessage}</td>
                    <td>
                      <span className={`${styles.badge} ${typeBadgeClass(log.predictedType)}`}>
                        {typeLabel(log.predictedType)}
                      </span>
                      {log.predictedType && <span className={styles.badgeCount}>×{log.predictedMatches}</span>}
                    </td>
                    <td>
                      {log.status === 'MANUAL_FIXED' ? (
                        <span className={`${styles.badge} ${typeBadgeClass(log.correctedType)}`}>
                          {typeLabel(log.correctedType)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={log.status === 'MANUAL_FIXED' ? styles.statusFixed : styles.statusAuto}>
                        {log.status === 'MANUAL_FIXED' ? 'FIXED' : 'AUTO'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleEdit(log)} className={styles.actionBtn}>Koreksi</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className={styles.pageBtn}
        >
          ← Previous
        </button>
        <span className={styles.pageInfo}>Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={logs.length < 20}
          className={styles.pageBtn}
        >
          Next →
        </button>
      </div>

      <div className={styles.exportLink}>
        <a href="/api/predictions/export" download>Export Training Data (JSONL)</a>
      </div>
    </div>
  );
}
