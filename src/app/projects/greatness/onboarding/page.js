'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/greatness/AuthProvider';
import { getSupabase } from '@/config/supabase';
import styles from './page.module.css';

const PRESET_CATEGORIES = [
  {
    id: 'software-engineering',
    label: 'Software Engineering',
    domains: ['github.com', 'stackoverflow.com', 'developer.mozilla.org', 'docs.python.org', 'npmjs.com', 'leetcode.com', 'hackerrank.com'],
    keywords: ['coding', 'programming', 'developer', 'javascript', 'python', 'react', 'api', 'tutorial'],
  },
  {
    id: 'data-science',
    label: 'Data Science & ML',
    domains: ['kaggle.com', 'arxiv.org', 'huggingface.co', 'tensorflow.org', 'pytorch.org', 'jupyter.org'],
    keywords: ['machine learning', 'data science', 'neural network', 'deep learning', 'statistics', 'dataset'],
  },
  {
    id: 'design',
    label: 'Design & UX',
    domains: ['figma.com', 'dribbble.com', 'behance.net', 'awwwards.com', 'uxdesign.cc', 'designsystems.com'],
    keywords: ['design', 'ux', 'ui', 'typography', 'color theory', 'wireframe', 'prototype'],
  },
  {
    id: 'writing',
    label: 'Writing & Research',
    domains: ['medium.com', 'scholar.google.com', 'docs.google.com', 'notion.so', 'substack.com', 'grammarly.com'],
    keywords: ['writing', 'essay', 'research', 'article', 'journal', 'academic', 'paper'],
  },
  {
    id: 'fitness',
    label: 'Fitness & Health',
    domains: ['myfitnesspal.com', 'strava.com', 'examine.com', 'bodybuilding.com', 'darebee.com'],
    keywords: ['workout', 'exercise', 'nutrition', 'fitness', 'running', 'strength', 'health'],
  },
  {
    id: 'music',
    label: 'Music Production',
    domains: ['splice.com', 'soundcloud.com', 'bandlab.com', 'native-instruments.com', 'ableton.com'],
    keywords: ['music production', 'daw', 'mixing', 'mastering', 'synthesizer', 'beat'],
  },
  {
    id: 'language',
    label: 'Language Learning',
    domains: ['duolingo.com', 'busuu.com', 'anki.net', 'lingq.com', 'italki.com', 'tandem.net'],
    keywords: ['language learning', 'vocabulary', 'grammar', 'fluency', 'translation'],
  },
  {
    id: 'finance',
    label: 'Finance & Investing',
    domains: ['investopedia.com', 'bloomberg.com', 'seekingalpha.com', 'morningstar.com', 'khanacademy.org'],
    keywords: ['investing', 'finance', 'stocks', 'portfolio', 'economics', 'budgeting'],
  },
  {
    id: 'art',
    label: 'Visual Art',
    domains: ['artstation.com', 'deviantart.com', 'skillshare.com', 'proko.com', 'drawinghowtodraw.com'],
    keywords: ['drawing', 'painting', 'illustration', 'digital art', 'sketching', 'art tutorial'],
  },
  {
    id: 'philosophy',
    label: 'Philosophy & Thinking',
    domains: ['plato.stanford.edu', 'philosophynow.org', 'lesswrong.com', 'aeon.co', 'brainpickings.org'],
    keywords: ['philosophy', 'stoicism', 'ethics', 'epistemology', 'logic', 'critical thinking'],
  },
  {
    id: 'entrepreneurship',
    label: 'Entrepreneurship',
    domains: ['ycombinator.com', 'producthunt.com', 'indiehackers.com', 'stripe.com', 'shopify.com'],
    keywords: ['startup', 'business', 'entrepreneurship', 'mvp', 'saas', 'marketing', 'growth'],
  },
  {
    id: 'math',
    label: 'Mathematics',
    domains: ['khanacademy.org', 'wolframalpha.com', 'brilliant.org', 'mathworld.wolfram.com', '3blue1brown.com'],
    keywords: ['math', 'calculus', 'algebra', 'geometry', 'proof', 'theorem', 'equation'],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, goals, loading, refreshGoals, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [customGoals, setCustomGoals] = useState([]);
  const [customLabel, setCustomLabel] = useState('');
  const [customDomains, setCustomDomains] = useState('');
  const [customKeywords, setCustomKeywords] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/projects/greatness/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (goals.length > 0) {
      const preselected = new Set();
      const custom = [];
      for (const goal of goals) {
        const preset = PRESET_CATEGORIES.find(p => p.id === goal.category);
        if (preset) {
          preselected.add(goal.category);
        } else {
          custom.push({
            label: goal.label,
            domains: goal.domains?.join(', ') || '',
            keywords: goal.keywords?.join(', ') || '',
          });
        }
      }
      setSelected(preselected);
      setCustomGoals(custom);
    }
  }, [goals]);

  if (loading || !user) {
    return (
      <div className={styles.page}>
        <div className={styles.loader}>Loading...</div>
      </div>
    );
  }

  function toggleCategory(id) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addCustomGoal() {
    if (!customLabel.trim()) return;
    setCustomGoals(prev => [...prev, {
      label: customLabel.trim(),
      domains: customDomains.trim(),
      keywords: customKeywords.trim(),
    }]);
    setCustomLabel('');
    setCustomDomains('');
    setCustomKeywords('');
  }

  function removeCustomGoal(index) {
    setCustomGoals(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (selected.size === 0 && customGoals.length === 0) {
      setError('Select at least one goal to continue.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase not configured');
      await supabase.from('goals').delete().eq('user_id', user.id);

      const goalsToInsert = [];

      for (const catId of selected) {
        const preset = PRESET_CATEGORIES.find(p => p.id === catId);
        if (preset) {
          goalsToInsert.push({
            user_id: user.id,
            category: preset.id,
            label: preset.label,
            domains: preset.domains,
            keywords: preset.keywords,
          });
        }
      }

      for (const custom of customGoals) {
        goalsToInsert.push({
          user_id: user.id,
          category: `custom-${custom.label.toLowerCase().replace(/\s+/g, '-')}`,
          label: custom.label,
          domains: custom.domains ? custom.domains.split(',').map(d => d.trim()).filter(Boolean) : [],
          keywords: custom.keywords ? custom.keywords.split(',').map(k => k.trim()).filter(Boolean) : [],
        });
      }

      const { error: insertError } = await supabase.from('goals').insert(goalsToInsert);
      if (insertError) throw insertError;

      await supabase.from('profiles').update({ onboarding_complete: true }).eq('id', user.id);

      await refreshGoals();
      await refreshProfile();
      router.push('/projects/greatness/upload');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.stepIndicator}>
            <div className={`${styles.stepDot} ${step >= 1 ? styles.stepActive : ''}`}>1</div>
            <div className={styles.stepLine} />
            <div className={`${styles.stepDot} ${step >= 2 ? styles.stepActive : ''}`}>2</div>
            <div className={styles.stepLine} />
            <div className={`${styles.stepDot} ${step >= 3 ? styles.stepActive : ''}`}>3</div>
          </div>
          <h1 className={styles.title}>Define Your Greatness</h1>
          <p className={styles.subtitle}>
            {step === 1 && 'What does Self-Actualization look like for you? Pick the domains that matter.'}
            {step === 2 && 'Add any custom goals with specific domains and keywords to match.'}
            {step === 3 && 'Review your choices and save. You can always come back to change these.'}
          </p>
        </div>

        {step === 1 && (
          <div className={styles.categoryGrid}>
            {PRESET_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`${styles.categoryCard} ${selected.has(cat.id) ? styles.categorySelected : ''}`}
                onClick={() => toggleCategory(cat.id)}
              >
                <span className={styles.categoryLabel}>{cat.label}</span>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className={styles.customSection}>
            <div className={styles.customForm}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Goal Name</label>
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  className={styles.input}
                  placeholder="e.g., Machine Learning Research"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Domains (comma-separated)</label>
                <input
                  type="text"
                  value={customDomains}
                  onChange={(e) => setCustomDomains(e.target.value)}
                  className={styles.input}
                  placeholder="e.g., arxiv.org, paperswithcode.com"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Keywords (comma-separated)</label>
                <input
                  type="text"
                  value={customKeywords}
                  onChange={(e) => setCustomKeywords(e.target.value)}
                  className={styles.input}
                  placeholder="e.g., transformer, attention mechanism"
                />
              </div>
              <button onClick={addCustomGoal} className={styles.addBtn} disabled={!customLabel.trim()}>
                + Add Custom Goal
              </button>
            </div>

            {customGoals.length > 0 && (
              <div className={styles.customList}>
                {customGoals.map((goal, i) => (
                  <div key={i} className={styles.customItem}>
                    <div>
                      <strong>{goal.label}</strong>
                      {goal.domains && <span className={styles.customMeta}>{goal.domains}</span>}
                    </div>
                    <button onClick={() => removeCustomGoal(i)} className={styles.removeBtn}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className={styles.reviewSection}>
            <h2 className={styles.reviewTitle}>Your Greatness Profile</h2>
            <div className={styles.reviewGrid}>
              {[...selected].map(catId => {
                const cat = PRESET_CATEGORIES.find(p => p.id === catId);
                return cat ? (
                  <div key={catId} className={styles.reviewCard}>
                    <span>{cat.label}</span>
                  </div>
                ) : null;
              })}
              {customGoals.map((goal, i) => (
                <div key={`custom-${i}`} className={styles.reviewCard}>
                  <span>{goal.label}</span>
                </div>
              ))}
            </div>
            {selected.size === 0 && customGoals.length === 0 && (
              <p className={styles.emptyState}>No goals selected yet. Go back and pick some!</p>
            )}
            <p className={styles.reviewNote}>
              Everything you browse that matches these goals counts toward your Greatness Score.
              Everything else is tracked as distraction.
            </p>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className={styles.backBtn}>
              ← Back
            </button>
          )}
          <div className={styles.spacer} />
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} className={styles.nextBtn}>
              Continue →
            </button>
          ) : (
            <button onClick={handleSave} className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving...' : 'Save & Continue to Upload'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
