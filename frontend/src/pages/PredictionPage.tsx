import { useEffect, useState } from 'react';
import { api } from '../lib/api';

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
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const fetchLogs = async () => {
    const data = await api.get(`/predictions?page=${page}&limit=20`);
    setLogs(data.logs);
    setTotal(data.total);
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

  const typeBadge = (t: string | null) =>
    t === 'FASTRACK'
      ? 'bg-accent-fast/10 text-accent-fast'
      : t === 'NORMAL'
      ? 'bg-accent-normal/10 text-accent-normal'
      : 'bg-text-muted/10 text-text-muted';

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Prediction Log</h1>

      {stats && (
        <div className="flex gap-4">
          <div className="bg-bg-surface border border-border rounded-lg px-4 py-3">
            <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
            <p className="text-xs text-text-muted">Total Predictions</p>
          </div>
          <div className="bg-bg-surface border border-border rounded-lg px-4 py-3">
            <p className="text-2xl font-bold text-warning">{stats.corrected}</p>
            <p className="text-xs text-text-muted">Corrected</p>
          </div>
          <div className="bg-bg-surface border border-border rounded-lg px-4 py-3">
            <p className="text-2xl font-bold text-success">{stats.accuracy}%</p>
            <p className="text-xs text-text-muted">Accuracy</p>
          </div>
        </div>
      )}

      <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium">Message</th>
                <th className="text-left px-4 py-3 font-medium">Predicted</th>
                <th className="text-left px-4 py-3 font-medium">Corrected</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border last:border-0 hover:bg-bg-surface-2/50">
                  {editing === log.id ? (
                    <>
                      <td className="px-4 py-3 text-text-muted font-mono text-xs max-w-[200px] truncate">{log.rawMessage}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${typeBadge(log.predictedType)}`}>
                          {log.predictedType || 'SUPPORT'}
                        </span>
                        <span className="text-text-muted ml-1">×{log.predictedMatches}</span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={editForm.correctedType ?? ''}
                          onChange={(e) => setEditForm({ ...editForm, correctedType: e.target.value || null })}
                          className="bg-bg-surface-2 border border-border rounded text-xs px-2 py-1 text-text-primary"
                        >
                          <option value="">SUPPORT</option>
                          <option value="NORMAL">NORMAL</option>
                          <option value="FASTRACK">FASTRACK</option>
                        </select>
                        <input
                          type="number"
                          value={editForm.correctedMatches}
                          onChange={(e) => setEditForm({ ...editForm, correctedMatches: parseInt(e.target.value) || 0 })}
                          className="w-14 bg-bg-surface-2 border border-border rounded text-xs px-2 py-1 ml-1 text-text-primary"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-warning">EDITING</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleSave(log.id)} className="text-xs text-success hover:underline">Save</button>
                        <button onClick={() => setEditing(null)} className="text-xs text-text-muted hover:underline ml-2">Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-text-muted font-mono text-xs max-w-[200px] truncate" title={log.rawMessage}>{log.rawMessage}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${typeBadge(log.predictedType)}`}>
                            {log.predictedType || 'SUPPORT'}
                          </span>
                          {log.predictedType && <span className="text-text-muted text-xs">×{log.predictedMatches}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {log.status === 'MANUAL_FIXED' ? (
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${typeBadge(log.correctedType)}`}>
                              {log.correctedType || 'SUPPORT'}
                            </span>
                            {log.correctedType && <span className="text-text-muted text-xs">×{log.correctedMatches}</span>}
                          </div>
                        ) : (
                          <span className="text-text-muted text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs ${
                          log.status === 'MANUAL_FIXED' ? 'text-warning' : 'text-success'
                        }`}>
                          {log.status === 'MANUAL_FIXED' ? 'FIXED' : 'AUTO'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleEdit(log)} className="text-xs text-accent-fast hover:underline">Koreksi</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="text-sm px-3 py-1.5 rounded border border-border text-text-secondary disabled:opacity-30"
        >
          Previous
        </button>
        <span className="text-xs text-text-muted">Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={logs.length < 20}
          className="text-sm px-3 py-1.5 rounded border border-border text-text-secondary disabled:opacity-30"
        >
          Next
        </button>
      </div>

      <div className="text-center">
        <a
          href="/api/predictions/export"
          className="text-sm text-accent-fast hover:underline"
          download
        >
          Export Training Data (JSONL)
        </a>
      </div>
    </div>
  );
}
