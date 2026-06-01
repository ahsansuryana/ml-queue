import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import styles from './webhook.module.css';

export default function WebhookPage() {
  const [integration, setIntegration] = useState<any>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [forwardUrl, setForwardUrl] = useState('');
  const [forwardEnabled, setForwardEnabled] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(''), 3000);
  };

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
    showMsg('Token saved');
  };

  const handleRegenerate = async () => {
    await api.post('/integrations/webhook/regenerate');
    fetchData();
    showMsg('Webhook URL regenerated');
  };

  const handleSaveForward = async () => {
    await api.put('/integrations/forward', {
      isForwardEnabled: forwardEnabled,
      forwardUrl: forwardUrl || null,
    });
    showMsg('Forward config saved');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showMsg('Copied to clipboard');
  };

  const webhookFullUrl = integration
    ? `${window.location.origin}/api/webhooks/sociabuzz/${integration.webhookUrl}`
    : '';

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Webhook Integration</h1>

      {msg && (
        <div className={`${styles.msg} ${msgType === 'success' ? styles.msgSuccess : ''}`}>
          {msg}
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Webhook URL</h2>
        <p className={styles.sectionDesc}>
          Masukkan URL ini di dashboard SociaBuzz → Settings → Webhook
        </p>
        <div className={styles.inputRow}>
          <input
            readOnly
            value={webhookFullUrl || 'Generating...'}
            className={styles.input}
          />
          <button
            onClick={() => copyToClipboard(webhookFullUrl)}
            className={styles.copyBtn}
          >
            Copy
          </button>
          <button
            onClick={handleRegenerate}
            className={styles.regenerateBtn}
          >
            Regenerate
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Webhook Token</h2>
        <p className={styles.sectionDesc}>
          Masukkan <code className={styles.inlineCode}>sb-webhook-token</code> dari dashboard
          SociaBuzz. Token akan di-hash (bcrypt) sebelum disimpan.
        </p>
        <div className={styles.inputRow}>
          <input
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="sbwhook-xxxxxxxxxxxxxxxxxxxxxxxx"
            className={styles.input}
          />
          <button
            onClick={handleSaveToken}
            disabled={!tokenInput}
            className={styles.saveBtn}
          >
            Save
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Forward Webhook</h2>
        <p className={styles.sectionDesc}>
          Forward incoming webhook payload ke URL eksternal. Disabled by default.
        </p>
        <div className={styles.toggle} onClick={() => setForwardEnabled(!forwardEnabled)}>
          <div className={`${styles.toggleTrack} ${forwardEnabled ? styles.toggleTrackOn : styles.toggleTrackOff}`}>
            <div className={`${styles.toggleThumb} ${forwardEnabled ? styles.toggleThumbOn : styles.toggleThumbOff}`} />
          </div>
          <span className={styles.toggleLabel}>{forwardEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
        {forwardEnabled && (
          <input
            value={forwardUrl}
            onChange={(e) => setForwardUrl(e.target.value)}
            placeholder="https://your-app.com/webhook"
            className={styles.input}
            style={{ marginBottom: '0.75rem' }}
          />
        )}
        <button onClick={handleSaveForward} className={styles.saveBtn}>
          Save Forward
        </button>
      </div>
    </div>
  );
}
