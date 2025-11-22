import Navbar from '@/components/Navbar';
import styles from './about.module.css';

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <h1 className={styles.title}>About Explosion.fun</h1>
        
        <div className={styles.textContainer}>
          <p>
            It started during the Covid-19 lockdowns. I randomly decided to rank every piece of media I consumed. There wasn&apos;t a grand plan, I just enjoyed debating why Series A was better than Series B.
          </p>
          <p>
            Over time, maintaining this list became difficult. I found myself ranking new shows based on fleeting feelings rather than consistent criteria. My memory would fade, and I couldn&apos;t recall why I had placed a series so high a year prior.
          </p>
          <p>
            I needed a better system. One that didn&apos;t rely on fickle emotions.
          </p>
          <p>
            That&apos;s why I built <strong>Explosion.fun</strong>. It&apos;s a review and ranking site where every piece of media is graded against set parameters. Once a score is set, it stays, unless a significant rewatch warrants a change. This approach allows for objective comparisons, even if the final ranking doesn&apos;t always align with my immediate gut feeling.
          </p>
          <p>
            Explosion.fun is also my creative playground, a place to build, experiment, and showcase my work on the web.
          </p>
        </div>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Who made this?</h2>
          <p className={styles.cardText}>
            Explosion.fun was created by <strong>Reuben Roy</strong> to make fun things for the web. Feel free to suggest ideas if you feel like.
          </p>
        </section>
        <footer className={styles.footer}>
          &copy; {new Date().getFullYear()} Explosion.fun
        </footer>
      </main>
    </div>
  );
}
