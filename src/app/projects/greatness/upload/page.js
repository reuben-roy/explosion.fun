'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/greatness/AuthProvider';
import { getSupabase } from '@/config/supabase';
import { parseAutoDetect, categorizeEntries, aggregateByDay } from '@/utils/takeoutParser';
import { computeDayScore } from '@/utils/greatnessScore';
import styles from './page.module.css';

export default function UploadPage() {
  const router = useRouter();
  const { user, goals, loading } = useAuth();
  const fileRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState({ step: '', pct: 0, detail: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/projects/greatness/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className={styles.page}><div className={styles.loader}>Loading...</div></div>;
  }

  if (goals.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyCard}>
            <h2>Set your goals first</h2>
            <p>Before uploading your data, you need to define what Self-Actualization looks like for you.</p>
            <button onClick={() => router.push('/projects/greatness/onboarding')} className={styles.primaryBtn}>
              Define Your Goals →
            </button>
          </div>
        </div>
      </div>
    );
  }

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  async function processFile(file) {
    if (!file.name.endsWith('.json')) {
      setError('Please upload a JSON file from Google Takeout.');
      return;
    }

    setFileName(file.name);
    setError('');
    setStatus('processing');
    setProgress({ step: 'Reading file...', pct: 10, detail: '' });

    try {
      const text = await file.text();
      setProgress({ step: 'Parsing data...', pct: 25, detail: '' });

      const jsonData = JSON.parse(text);
      const entries = parseAutoDetect(jsonData);
      setProgress({ step: 'Categorizing entries...', pct: 45, detail: `${entries.length.toLocaleString()} entries found` });

      const categorized = categorizeEntries(entries, goals);
      const goalEntries = categorized.filter(e => e.isGoalAligned);
      const distractionEntries = categorized.filter(e => !e.isGoalAligned);
      setProgress({ step: 'Computing daily scores...', pct: 65, detail: `${goalEntries.length} goal-aligned, ${distractionEntries.length} other` });

      const dailyData = aggregateByDay(categorized);
      const dayScores = dailyData.map(day => computeDayScore(day));
      setProgress({ step: 'Saving to database...', pct: 80, detail: `${dayScores.length} days of data` });

      const batchSize = 500;
      const sessionRows = categorized.map(e => ({
        user_id: user.id,
        url: e.url?.substring(0, 2000),
        domain: e.domain,
        title: e.title?.substring(0, 500),
        visited_at: e.visitedAt.toISOString(),
        duration_seconds: e.durationSeconds,
        is_goal_aligned: e.isGoalAligned,
        matched_goal_id: e.matchedGoalId,
      }));

      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase not configured');

      for (let i = 0; i < sessionRows.length; i += batchSize) {
        const batch = sessionRows.slice(i, i + batchSize);
        const { error: insertErr } = await supabase.from('browsing_sessions').insert(batch);
        if (insertErr) throw insertErr;
        const pct = 80 + (i / sessionRows.length) * 12;
        setProgress({ step: 'Saving sessions...', pct: Math.round(pct), detail: `${Math.min(i + batchSize, sessionRows.length)} / ${sessionRows.length}` });
      }

      setProgress({ step: 'Saving daily scores...', pct: 94, detail: '' });
      const scoreRows = dayScores.map(ds => ({
        user_id: user.id,
        date: ds.date,
        self_actualization_ratio: ds.selfActualizationRatio,
        deep_work_density: ds.deepWorkDensity,
        drift_friction: ds.driftFriction,
        composite_score: ds.compositeScore,
        goal_time_seconds: ds.goalTimeSeconds,
        distraction_time_seconds: ds.distractionTimeSeconds,
        total_sessions: ds.totalSessions,
      }));

      const { error: scoreErr } = await supabase.from('daily_scores').upsert(scoreRows, {
        onConflict: 'user_id,date',
      });
      if (scoreErr) throw scoreErr;

      const overallScore = dayScores.length > 0
        ? dayScores.reduce((s, d) => s + d.compositeScore, 0) / dayScores.length
        : 0;

      await supabase.from('profiles').update({
        composite_score: Math.round(overallScore * 10) / 10,
        total_days_tracked: dayScores.length,
      }).eq('id', user.id);

      setProgress({ step: 'Done!', pct: 100, detail: '' });
      setStatus('done');
      setResult({
        totalEntries: entries.length,
        goalAligned: goalEntries.length,
        distractions: distractionEntries.length,
        daysTracked: dayScores.length,
        avgScore: Math.round(overallScore * 10) / 10,
        dateRange: dayScores.length > 0
          ? `${dayScores[0].date} to ${dayScores[dayScores.length - 1].date}`
          : 'N/A',
      });
    } catch (err) {
      setError(err.message || 'Failed to process file');
      setStatus('idle');
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Upload Your Data</h1>
          <p className={styles.subtitle}>
            Upload your Google Takeout browsing history to see your Greatness Score.
          </p>
        </div>

        {status === 'idle' && (
          <>
            <div
              className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className={styles.fileInput}
              />
              <h3 className={styles.dropTitle}>Drop your Takeout JSON here</h3>
              <p className={styles.dropText}>
                or click to browse. Accepts Chrome History or My Activity JSON files.
              </p>
            </div>

            <div className={styles.helpSection}>
              <h3 className={styles.helpTitle}>How to get your data</h3>
              <ol className={styles.helpSteps}>
                <li>Go to <a href="https://takeout.google.com" target="_blank" rel="noopener noreferrer" className={styles.helpLink}>takeout.google.com</a></li>
                <li>Deselect all, then select <strong>Chrome</strong> (or <strong>My Activity</strong>)</li>
                <li>Choose JSON format and export</li>
                <li>Download and extract the ZIP file</li>
                <li>Upload the <code>BrowserHistory.json</code> or <code>MyActivity.json</code> file here</li>
              </ol>
            </div>
          </>
        )}

        {status === 'processing' && (
          <div className={styles.processingCard}>
            <div className={styles.progressBarOuter}>
              <div className={styles.progressBarInner} style={{ width: `${progress.pct}%` }} />
            </div>
            <div className={styles.progressInfo}>
              <span className={styles.progressStep}>{progress.step}</span>
              {progress.detail && <span className={styles.progressDetail}>{progress.detail}</span>}
            </div>
            <p className={styles.processingNote}>Processing {fileName}...</p>
          </div>
        )}

        {status === 'done' && result && (
          <div className={styles.resultCard}>
            <h2 className={styles.resultTitle}>Data Processed!</h2>
            <div className={styles.resultStats}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{result.totalEntries.toLocaleString()}</span>
                <span className={styles.statLabel}>Total Entries</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue} style={{ color: '#10b981' }}>{result.goalAligned.toLocaleString()}</span>
                <span className={styles.statLabel}>Goal-Aligned</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue} style={{ color: '#ef4444' }}>{result.distractions.toLocaleString()}</span>
                <span className={styles.statLabel}>Distractions</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{result.daysTracked}</span>
                <span className={styles.statLabel}>Days</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue} style={{ color: '#f59e0b' }}>{result.avgScore}</span>
                <span className={styles.statLabel}>Avg Score</span>
              </div>
            </div>
            <p className={styles.resultRange}>{result.dateRange}</p>
            <button onClick={() => router.push('/projects/greatness/dashboard')} className={styles.primaryBtn}>
              View Your Dashboard →
            </button>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
}
