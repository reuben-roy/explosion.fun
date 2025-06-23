import Navbar from '@/components/Navbar';
import styles from './about.module.css';

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <h1 className={styles.title}>About Explosion.fun</h1>
        <p style={{ color: '#ccc', textAlign: 'center', maxWidth: 700, margin: '0 auto 2rem' }}>
          Explosion.fun was a domain name I bought a long time back, and I just decided to start building a site for myself now. I intent to do creative stuff here, and showcase the work I do.
        </p>
        <section style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1.5rem', maxWidth: 600, margin: '0 auto', color: '#eee', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Who made this?</h2>
          <p style={{ margin: 0 }}>
            Explosion.fun was created by <strong>Reuben Roy</strong> to "hasn't been decided yet". Feel free to suggest ideas if you feel like.
          </p>
        </section>
        <footer style={{ marginTop: 40, textAlign: 'center', color: '#888', fontSize: '1rem' }}>
          &copy; {new Date().getFullYear()} Explosion.fun
        </footer>
      </main>
    </div>
  );
}
