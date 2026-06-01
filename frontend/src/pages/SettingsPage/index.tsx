import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import styles from './settings.module.css';

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
    setMsg('Pricing updated');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Settings</h1>

      {msg && <div className={styles.msg}>{msg}</div>}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Queue Pricing</h2>

        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Regular (per match)</label>
            <input
              type="number"
              value={pricing.regularPrice}
              onChange={(e) => setPricing({ ...pricing, regularPrice: parseInt(e.target.value) || 0 })}
              className={styles.fieldInput}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Bundle Price</label>
            <input
              type="number"
              value={pricing.bundlePrice}
              onChange={(e) => setPricing({ ...pricing, bundlePrice: parseInt(e.target.value) || 0 })}
              className={styles.fieldInput}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Matches per Bundle</label>
            <input
              type="number"
              value={pricing.bundleMatchCount}
              onChange={(e) => setPricing({ ...pricing, bundleMatchCount: parseInt(e.target.value) || 1 })}
              className={styles.fieldInput}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Fastrack (per match)</label>
            <input
              type="number"
              value={pricing.fastrackPrice}
              onChange={(e) => setPricing({ ...pricing, fastrackPrice: parseInt(e.target.value) || 0 })}
              className={styles.fieldInput}
            />
          </div>
        </div>

        <button onClick={handleSave} className={styles.saveBtn}>
          Save Pricing
        </button>
      </div>
    </div>
  );
}
