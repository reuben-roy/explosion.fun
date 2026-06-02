'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/greatness/AuthProvider';
import { getSupabase } from '@/config/supabase';
import styles from './page.module.css';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      const supabase = getSupabase();
      if (!supabase) { setLoading(false); return; }
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, composite_score, total_days_tracked')
        .eq('is_public', true)
        .gt('total_days_tracked', 0)
        .order('composite_score', { ascending: false })
        .limit(50);

      setLeaders(data || []);

      if (user && supabase) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('composite_score, total_days_tracked, is_public')
          .eq('id', user.id)
          .single();

        if (profile && profile.total_days_tracked > 0) {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('is_public', true)
            .gt('composite_score', profile.composite_score);

          setUserRank({
            rank: (count || 0) + 1,
            score: profile.composite_score,
            isPublic: profile.is_public,
          });
        }
      }

      setLoading(false);
    }
    fetchLeaderboard();
  }, [user]);

  async function togglePublic() {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;
    const newVal = !userRank?.isPublic;
    await supabase.from('profiles').update({ is_public: newVal }).eq('id', user.id);
    setUserRank(prev => prev ? { ...prev, isPublic: newVal } : null);

    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, composite_score, total_days_tracked')
      .eq('is_public', true)
      .gt('total_days_tracked', 0)
      .order('composite_score', { ascending: false })
      .limit(50);
    setLeaders(data || []);
  }

  function getMedalEmoji(rank) {
    if (rank === 1) return '#1';
    if (rank === 2) return '#2';
    if (rank === 3) return '#3';
    return `#${rank}`;
  }

  function getScoreColor(score) {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Greatness Leaderboard</h1>
          <p className={styles.subtitle}>
            See how you stack up against others on their Self-Actualization journey.
          </p>
        </div>

        {user && userRank && (
          <div className={styles.yourRank}>
            <div className={styles.yourRankInfo}>
              <span className={styles.yourRankLabel}>Your Rank</span>
              <span className={styles.yourRankValue}>#{userRank.rank}</span>
              <span className={styles.yourRankScore} style={{ color: getScoreColor(userRank.score) }}>
                {userRank.score} pts
              </span>
            </div>
            <button onClick={togglePublic} className={styles.visibilityBtn}>
              {userRank.isPublic ? 'Public' : 'Private'}
            </button>
          </div>
        )}

        {user && !userRank && !loading && (
          <div className={styles.yourRank}>
            <p className={styles.noDataMsg}>
              Upload your browsing data to appear on the leaderboard.{' '}
              <Link href="/projects/greatness/upload" className={styles.inlineLink}>Upload now →</Link>
            </p>
          </div>
        )}

        {loading ? (
          <div className={styles.loader}>Loading leaderboard...</div>
        ) : leaders.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No public profiles yet</h2>
            <p>Be the first to make your profile public and claim the top spot!</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.rankCol}>Rank</th>
                  <th>User</th>
                  <th className={styles.numCol}>Score</th>
                  <th className={styles.numCol}>Days</th>
                  <th className={styles.barCol}>
                    <span className={styles.thLabel}>Progress</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((leader, i) => {
                  const rank = i + 1;
                  const isYou = user && leader.id === user.id;
                  return (
                    <tr key={leader.id} className={isYou ? styles.highlightRow : ''}>
                      <td className={styles.rankCell}>
                        <span className={rank <= 3 ? styles.medal : styles.rankNum}>
                          {getMedalEmoji(rank)}
                        </span>
                      </td>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatar}>
                            {leader.display_name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className={styles.displayName}>
                            {leader.display_name || 'Anonymous'}
                            {isYou && <span className={styles.youBadge}>you</span>}
                          </span>
                        </div>
                      </td>
                      <td className={styles.numCol}>
                        <span className={styles.scoreValue} style={{ color: getScoreColor(leader.composite_score) }}>
                          {leader.composite_score}
                        </span>
                      </td>
                      <td className={styles.numCol}>
                        <span className={styles.daysValue}>{leader.total_days_tracked}</span>
                      </td>
                      <td className={styles.barCol}>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{
                              width: `${Math.min(leader.composite_score, 100)}%`,
                              background: getScoreColor(leader.composite_score),
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
