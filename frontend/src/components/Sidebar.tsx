import { Link, useLocation } from 'react-router-dom';

const nav = [
  { path: '/dashboard', label: 'Dashboard', icon: '▦' },
  { path: '/webhook', label: 'Webhook', icon: '⇌' },
  { path: '/predictions', label: 'Prediction Log', icon: '☰' },
  { path: '/settings', label: 'Settings', icon: '⚙' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-56 bg-bg-surface border-r border-border flex flex-col">
      <div className="p-5 border-b border-border">
        <h1 className="text-lg font-bold text-accent-fast tracking-tight">SAS</h1>
        <p className="text-xs text-text-muted mt-0.5">Server as a Service</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {nav.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-bg-surface-3 text-text-primary font-medium'
                  : 'text-text-secondary hover:bg-bg-surface-2'
              }`}
            >
              <span className="w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <button
          onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
          className="text-xs text-text-muted hover:text-danger transition-colors w-full text-left"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
