import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function SettingsPage() {
  const [pricing, setPricing] = useState({
    regularPrice: 35000,
    bundlePrice: 100000,
    bundleMatchCount: 3,
    fastrackPrice: 50000,
  });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/queue/pricing').then(setPricing).catch(() => {});
  }, []);

  const handleSave = async () => {
    await api.put('/queue/pricing', pricing);
    setMsg('Pricing updated!');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold">Settings</h1>

      {msg && (
        <div className="bg-success/10 border border-success/30 text-success text-sm px-4 py-2 rounded-lg">{msg}</div>
      )}

      <div className="bg-bg-surface border border-border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Pricing</h2>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-text-muted block mb-1">Regular Price (per match)</label>
            <input
              type="number"
              value={pricing.regularPrice}
              onChange={(e) => setPricing({ ...pricing, regularPrice: parseInt(e.target.value) || 0 })}
              className="w-full bg-bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
            />
          </div>

          <div>
            <label className="text-xs text-text-muted block mb-1">Bundle Price</label>
            <input
              type="number"
              value={pricing.bundlePrice}
              onChange={(e) => setPricing({ ...pricing, bundlePrice: parseInt(e.target.value) || 0 })}
              className="w-full bg-bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
            />
          </div>

          <div>
            <label className="text-xs text-text-muted block mb-1">Matches per Bundle</label>
            <input
              type="number"
              value={pricing.bundleMatchCount}
              onChange={(e) => setPricing({ ...pricing, bundleMatchCount: parseInt(e.target.value) || 1 })}
              className="w-full bg-bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
            />
          </div>

          <div>
            <label className="text-xs text-text-muted block mb-1">Fastrack Price (per match)</label>
            <input
              type="number"
              value={pricing.fastrackPrice}
              onChange={(e) => setPricing({ ...pricing, fastrackPrice: parseInt(e.target.value) || 0 })}
              className="w-full bg-bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-accent-fast text-white text-sm font-medium hover:bg-accent-fast/90 transition-colors"
        >
          Save Pricing
        </button>
      </div>
    </div>
  );
}
