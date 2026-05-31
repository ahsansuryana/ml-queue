import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function WebhookPage() {
  const [integration, setIntegration] = useState<any>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [forwardUrl, setForwardUrl] = useState('');
  const [forwardEnabled, setForwardEnabled] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchData = async () => {
    try {
      const [int, fwd] = await Promise.all([
        api.get('/integrations/webhook'),
        api.get('/integrations/forward'),
      ]);
      setIntegration(int);
      setForwardUrl(fwd.forwardUrl || '');
      setForwardEnabled(fwd.isForwardEnabled);
    } catch {}
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveToken = async () => {
    if (!tokenInput) return;
    await api.post('/integrations/webhook/secret', { token: tokenInput });
    setTokenInput('');
    setMsg('Token saved successfully!');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleRegenerate = async () => {
    await api.post('/integrations/webhook/regenerate');
    fetchData();
    setMsg('Webhook URL regenerated!');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleSaveForward = async () => {
    await api.put('/integrations/forward', {
      isForwardEnabled: forwardEnabled,
      forwardUrl: forwardUrl || null,
    });
    setMsg('Forward config saved!');
    setTimeout(() => setMsg(''), 3000);
  };

  const webhookFullUrl = integration
    ? `${window.location.origin}/api/webhooks/sociabuzz/${integration.webhookUrl}`
    : '';

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold">Webhook Integration</h1>

      {msg && (
        <div className="bg-success/10 border border-success/30 text-success text-sm px-4 py-2 rounded-lg">{msg}</div>
      )}

      <div className="bg-bg-surface border border-border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Webhook URL</h2>
        <div className="flex gap-2">
          <input
            readOnly
            value={webhookFullUrl || 'Generating...'}
            className="flex-1 bg-bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm font-mono text-text-primary"
          />
          <button
            onClick={() => { navigator.clipboard.writeText(webhookFullUrl); setMsg('Copied!'); setTimeout(() => setMsg(''), 2000); }}
            className="px-3 py-2 rounded-lg border border-border text-text-secondary text-sm hover:bg-bg-surface-2 transition-colors"
          >
            Copy
          </button>
          <button
            onClick={handleRegenerate}
            className="px-3 py-2 rounded-lg border border-warning/30 text-warning text-sm hover:bg-warning/10 transition-colors"
          >
            Regenerate
          </button>
        </div>
        <p className="text-xs text-text-muted">
          Masukkan URL ini di dashboard SociaBuzz → Settings → Webhook
        </p>
      </div>

      <div className="bg-bg-surface border border-border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Webhook Token</h2>
        <p className="text-xs text-text-muted">
          Masukkan <code className="text-accent-fast font-mono text-xs">sb-webhook-token</code> dari dashboard SociaBuzz.
          Token akan di-hash (bcrypt) sebelum disimpan.
        </p>
        <div className="flex gap-2">
          <input
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="sbwhook-xxxxxxxxxxxxxxxxxxxxxxxx"
            className="flex-1 bg-bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-muted"
          />
          <button
            onClick={handleSaveToken}
            disabled={!tokenInput}
            className="px-4 py-2 rounded-lg bg-accent-fast text-white text-sm font-medium disabled:opacity-30 hover:bg-accent-fast/90 transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      <div className="bg-bg-surface border border-border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Forward Webhook</h2>
        <p className="text-xs text-text-muted">
          Forward incoming webhook payload ke URL eksternal. Disabled by default.
        </p>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setForwardEnabled(!forwardEnabled)}
            className={`w-10 h-5 rounded-full transition-colors relative ${forwardEnabled ? 'bg-accent-fast' : 'bg-bg-surface-3'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${forwardEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm text-text-primary">{forwardEnabled ? 'Enabled' : 'Disabled'}</span>
        </label>
        {forwardEnabled && (
          <input
            value={forwardUrl}
            onChange={(e) => setForwardUrl(e.target.value)}
            placeholder="https://your-app.com/webhook"
            className="w-full bg-bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted"
          />
        )}
        <button
          onClick={handleSaveForward}
          className="px-4 py-2 rounded-lg bg-accent-fast text-white text-sm font-medium hover:bg-accent-fast/90 transition-colors"
        >
          Save Forward Config
        </button>
      </div>
    </div>
  );
}
