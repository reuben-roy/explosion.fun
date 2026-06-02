'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/greatness/AuthProvider';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, user } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  if (user) {
    router.push('/projects/greatness/dashboard');
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await signUp(email, password, displayName);
        if (signUpError) throw signUpError;
        setCheckEmail(true);
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) throw signInError;
        router.push('/projects/greatness/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (checkEmail) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>Check your email</h1>
          <p className={styles.subtitle}>
            We sent a confirmation link to <strong>{email}</strong>.
            Click the link to activate your account, then sign in.
          </p>
          <button
            onClick={() => { setCheckEmail(false); setIsSignUp(false); }}
            className={styles.submitBtn}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/projects/greatness" className={styles.backLink}>
          ← Back to Greatness
        </Link>
        <h1 className={styles.title}>
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className={styles.subtitle}>
          {isSignUp
            ? 'Start tracking your Self-Actualization journey'
            : 'Sign in to your Greatness dashboard'
          }
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {isSignUp && (
            <div className={styles.field}>
              <label className={styles.label}>Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={styles.input}
                placeholder="How you appear on the leaderboard"
                required={isSignUp}
              />
            </div>
          )}
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Min 6 characters"
              minLength={6}
              required
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading
              ? (isSignUp ? 'Creating Account...' : 'Signing In...')
              : (isSignUp ? 'Create Account' : 'Sign In')
            }
          </button>
        </form>

        <div className={styles.toggle}>
          {isSignUp ? (
            <>Already have an account? <button onClick={() => setIsSignUp(false)} className={styles.toggleBtn}>Sign In</button></>
          ) : (
            <>New here? <button onClick={() => setIsSignUp(true)} className={styles.toggleBtn}>Create an Account</button></>
          )}
        </div>
      </div>
    </div>
  );
}
