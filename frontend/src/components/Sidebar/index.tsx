import { Link, useLocation } from 'react-router-dom';
import styles from './sidebar.module.css';

const nav = [
  { path: '/dashboard', label: 'Dashboard', icon: '▦' },
  { path: '/webhook', label: 'Webhook', icon: '⇌' },
  { path: '/predictions', label: 'Prediction Log', icon: '☰' },
  { path: '/settings', label: 'Settings', icon: '⚙' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <h1 className={styles.brandTitle}>SAS</h1>
        <p className={styles.brandSub}>Server as a Service</p>
      </div>
      <nav className={styles.nav}>
        {nav.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
            >
              <span className={styles.icon}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className={styles.footer}>
        <button
          onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
          className={styles.logoutBtn}
        >
          <span>←</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
