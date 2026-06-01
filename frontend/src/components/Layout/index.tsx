import styles from './layout.module.css';
import Sidebar from '../Sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
