import Link from 'next/link';
import Navbar from '@/components/Navbar';
import styles from './auto-apply.module.css';

export const metadata = {
  title: 'Auto-Apply — Autonomous Job-Application Agent | explosion.fun',
  description:
    'How Auto-Apply works: a local-first agent that applies to jobs unattended. Schema-first form discovery, trust-ordered answer resolution, a confidence gate, verified submissions, and failover that fails loudly instead of quietly.',
  alternates: {
    canonical: 'https://explosion.fun/projects/auto-apply',
  },
};

const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareSourceCode',
  name: 'Auto-Apply',
  alternateName: 'Autonomous Job-Application Agent',
  url: 'https://explosion.fun/projects/auto-apply',
  author: { '@type': 'Person', name: 'Reuben Roy', url: 'https://explosion.fun/cv' },
  programmingLanguage: 'Python',
  runtimePlatform: ['Python 3.11', 'Ollama', 'Playwright/Patchright', 'SQLite'],
  applicationCategory: 'Autonomous agent',
  description:
    'A local-first agentic system that applies to jobs end-to-end unattended. The model never drives the browser and never decides whether to submit — it only answers questions. Form schemas come from each ATS public API, answers resolve in trust order, Playwright fills deterministically, and a mean-confidence gate decides submit versus hand-to-human.',
  keywords:
    'agentic AI, local-first LLM, Ollama, RAG, semantic retrieval, browser automation, Playwright, Patchright, confidence gating, unattended agent, ATS, Greenhouse, Lever, Ashby, Workday',
};

const stats = [
  { value: '~21,700', label: 'lines of Python across 69 modules' },
  { value: '724', label: 'tests in 48 modules (~9,800 lines)' },
  { value: '4', label: 'supported ATS platforms' },
  { value: '0', label: 'bytes of profile data leaving the machine by default' },
];

const pipeline = `job URL ─▶ detect ATS ─▶ fetch the form SCHEMA from the ATS's public API
                                    │
              resolve each field, in order of trust:
                1. your profile        (deterministic)   confidence 1.0
                2. the answer cache    (semantic match)  confidence 0.9
                3. the LLM (structured JSON)             model-reported confidence
                                    │
              fill the real form with Playwright (deterministic, stable selectors)
                                    │
              confidence gate:  all required filled & MEAN confidence >= threshold
                                & no CAPTCHA/login wall ?
                   yes ─▶ submit ─▶ verify success ─▶ save record + cache answers
                   no  ─▶ fill, screenshot, write a review report, leave for a human
                                    │
        unknown ATS / unmapped form ─▶ fall back to a browser-use agent (no schema, no submit)`;

const trustOrder = [
  {
    source: 'Profile',
    confidence: '1.0',
    detail:
      'A label regex resolves to a canonical key you authored — name, contact, work authorisation, EEO, preferences. Sensitive fields with no value stay empty at 0.0 rather than being invented.',
  },
  {
    source: 'Answer cache',
    confidence: '0.9',
    detail:
      'An answer already approved once, matched exactly, fuzzily, or semantically (cosine ≥ 0.85). This is the store that grows into your voice over time.',
  },
  {
    source: 'Grounded model answer',
    confidence: '≤ 0.9',
    detail:
      'The model reused a retrieved past answer or a knowledge topic — and its claim was verified: the id must have been offered for that specific field, and a named topic must actually have matched it.',
  },
  {
    source: 'Model guess',
    confidence: '≤ 0.9 (capped)',
    detail:
      'A fresh answer with no grounding. Capped below what a fact you authored earns, marked as a guess, and parked for you to answer once and cache forever.',
  },
];

const postSubmit = [
  {
    state: 'Confirmed',
    tone: 'good',
    detail: 'ATS-specific success text. Recorded, answers cached, future runs deduped.',
  },
  {
    state: 'Rejected',
    tone: 'bad',
    detail:
      'Validation errors, or a wall ate the click. No application was created, so the job stays fully retryable.',
  },
  {
    state: 'Unverified',
    tone: 'warn',
    detail:
      'Clicked, nothing recognisable came back. Treated as NOT submitted, never auto-retried — a retry is forced into human review so a person clicks the final button.',
  },
  {
    state: 'Walled',
    tone: 'bad',
    detail:
      'CAPTCHA, login, or an email-code gate. Classified, screenshotted, logged as an issue. Email codes are resolved through a read-only Gmail scope, or routed to review if ambiguous.',
  },
];

const failover = [
  {
    title: 'Graceful degradation at every layer',
    body:
      'Unknown ATS falls back to a browser-use agent that fills but is structurally incapable of submitting. No embedding model? Semantic recall silently reverts to regex and fuzzy matching. Model unreachable or unhelpful? Resume tailoring degrades to deterministic keyword ranking — never to "no resume". A hosted model that rejects a strict JSON schema is retried in a looser JSON mode.',
  },
  {
    title: 'Bounded transient retries',
    body:
      'ATS schema fetches retry on a budget, scoped to the status codes where retrying can plausibly change the answer. Everything else fails fast into the issue log instead of hammering someone else’s API.',
  },
  {
    title: '"Submitted" means verified',
    body:
      'The click is not the outcome. The resulting page is classified into four states, and three of them are not success. Deduplication only skips confirmed submits — which is exactly what stops the system quietly double-applying under a real name.',
  },
  {
    title: 'Durable queue with dead-lettering',
    body:
      'The unattended daemon runs an on-disk SQLite task queue: three attempts, exponential backoff from five minutes, then a dead-letter queue you can inspect and requeue from your phone. Failures a retry provably cannot fix (a CAPTCHA wall, a closed posting) dead-letter immediately instead of burning attempts.',
  },
  {
    title: 'Never guess a credential',
    body:
      'A rejected Workday password routes to the reset flow, never a retry loop. An account created but not yet email-verified stays retryable and is never signed up twice.',
  },
  {
    title: 'Consent escalation',
    body:
      'Background checks, arbitration agreements, drug tests and credit checks are never agreed to automatically. The run stops and explains what is being asked; your answer settles that category for every company thereafter.',
  },
  {
    title: 'Sleep costs latency, never work',
    body:
      'The daemon holds a caffeinate assertion on AC power and, on battery, lets the Mac sleep while arming an RTC wake every 15 minutes to drain the backlog. The queue is on disk and inbound messages are retained upstream, so nothing is lost either way.',
  },
  {
    title: 'Untrusted input is data, not instructions',
    body:
      'In phone-controlled mode only one allowlisted chat is obeyed, and only a closed set of slash commands and URLs on a supported ATS are actionable. Free text claiming urgency or authority does nothing at all — there is no code path from prose to an action.',
  },
];

const difficulties = [
  {
    problem: 'v1 could not tell you whether it had applied',
    solution:
      'The obvious first build was a browser-use agent on a local model clicking its way through forms. It was slow, non-reproducible, and — fatally — could not distinguish "clicked submit" from "application received". The rewrite inverted the design: fetch the schema from the ATS’s own API, let the model answer questions only, make every other step deterministic code carrying a confidence number.',
  },
  {
    problem: 'Invisible reCAPTCHA v3 was scoring the automation stack',
    solution:
      'Workday’s noCaptcha-wrapped forms rejected automated submits because the DevTools protocol leaks automation. Moving every session to Patchright — Playwright with those leaks removed — against installed Chrome with a persistent profile is what let those submits land. A challenge that is actually shown is still never solved or bypassed: it goes to the human, who solves it once into the profile.',
  },
  {
    problem: 'Email verification walls that appear after the submit',
    solution:
      'Some ATSs email a one-time code once the form is in flight. Codes are matched through a single read-only Gmail scope on server receive timestamp, trusted sender domains, verification wording, and the current company and role. If several unrelated fresh messages match, the run refuses to guess and routes to review. Codes and message bodies never reach the audit log.',
  },
  {
    problem: 'A long tail of per-ATS behaviour',
    solution:
      'Greenhouse’s location typeahead, Ashby multiselects that only group by id prefix, forms that must be answered the page’s own way rather than the walk’s, tracking junk in job URLs breaking dedupe. Each one is deterministic code in a per-ATS playbook, not a prompt asking the model to cope.',
  },
  {
    problem: 'Generated text that makes claims as you',
    solution:
      'A fabricated cover letter is worse than sending none, so verification is deterministic and has no LLM in it: company-specific claims must trace back to the posting text, a numeral appearing nowhere in your profile, resume or the posting is an invented metric, and clichés fail the letter. A failed letter is not attached. Resumes go further — the model never writes a bullet, it only selects from a corpus you wrote, and every render is read back through a PDF text extractor and checked the way an ATS parser would read it.',
  },
];

const stack = [
  'Python 3.11',
  'Playwright / Patchright',
  'Ollama (qwen3.6, nomic-embed-text)',
  'OpenRouter',
  'browser-use',
  'SQLite (7 stores)',
  'Typer CLI',
  'Gmail API (read-only OAuth)',
  'Telegram Bot API',
  'macOS LaunchAgent',
  'uv',
  'pytest',
];

export default function AutoApplyPage() {
  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <Navbar />
      <main className={styles.main}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Project · Agentic systems</p>
          <h1 className={styles.title}>Auto-Apply</h1>
          <p className={styles.subtitle}>
            A local-first agent that applies to jobs overnight — and knows when not to.
          </p>
          <p className={styles.lede}>
            Paired with a companion scraping agent (<strong>Hermes</strong>) that pulls the day&apos;s
            recommended listings from Jobright, Auto-Apply closes the loop into a complete unattended
            pipeline: discover postings → resolve every form question → fill → decide whether to
            submit → verify → report. It runs on a personal Mac against local Ollama models while I
            sleep. Nothing about the resume, profile, or answers leaves the machine.
          </p>
          <div className={styles.toolbar}>
            <Link href="/cv" className={styles.toolbarPrimary}>
              See it on my CV <span aria-hidden="true">→</span>
            </Link>
            <Link href="/projects" className={styles.toolbarLink}>
              All projects
            </Link>
            <span className={styles.badge}>Private repository — walkthrough on request</span>
          </div>
        </header>

        <section className={styles.statsRow} aria-label="Project scale">
          {stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>The one decision everything else follows from</h2>
          <p className={styles.paragraph}>
            <strong>The model never drives the browser, and never decides whether to submit.</strong>{' '}
            It only answers questions. Locating elements, filling them, and judging whether the result
            is good enough to send are all deterministic code with an explicit confidence number
            attached. That inversion is what makes an unattended run safe to leave alone: the parts
            that can be wrong in unbounded ways are confined to text generation, and every consequential
            action is gated by arithmetic you can read.
          </p>
          <p className={styles.paragraph}>
            Form questions are not scraped out of the DOM either. Greenhouse, Lever and Ashby all
            publish the application form as a schema through their own public API or GraphQL endpoint,
            and Workday exposes it through its CXS API. Reading the schema first means the agent knows
            what it is answering before a browser is even launched — and can resolve, park, or refuse a
            question without a single flaky selector in the loop.
          </p>
          <pre className={styles.diagram} aria-label="End-to-end pipeline">
            <code>{pipeline}</code>
          </pre>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Answer resolution, in order of trust</h2>
          <p className={styles.paragraph}>
            Every field gets a value <em>and a provenance</em>, and provenance sets the confidence the
            gate later averages. The rule that makes it safe: a fresh model guess is capped below what
            a fact you authored earns.
          </p>
          <div className={styles.trustList}>
            {trustOrder.map((row) => (
              <div key={row.source} className={styles.trustRow}>
                <div className={styles.trustHead}>
                  <span className={styles.trustSource}>{row.source}</span>
                  <span className={styles.trustConfidence}>{row.confidence}</span>
                </div>
                <p className={styles.trustDetail}>{row.detail}</p>
              </div>
            ))}
          </div>
          <p className={styles.paragraph}>
            Recall comes from a local RAG layer built on <code>nomic-embed-text</code> running in
            Ollama. Near-duplicate questions (cosine ≥ 0.85) fill straight from the cache; grey-zone
            paraphrases (≥ 0.55) are retrieved into the prompt as previously approved answers that the
            model must explicitly <em>claim</em> before they are trusted. Retrieval supplies the recall,
            the model supplies the precision a flat threshold cannot — so &ldquo;Why do you want to work
            here?&rdquo; answers &ldquo;What excites you about this opportunity?&rdquo;, while &ldquo;Why
            are you leaving your current job?&rdquo; stays a guess. Embeddings live as blobs in the
            existing SQLite cache and brute-force cosine over a few hundred rows is instant, so there is
            no vector database to run.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>The submit gate</h2>
          <p className={styles.paragraph}>
            A run submits only when every required field is filled, no wall was detected, no earlier
            submit is unconfirmed, and the <strong>mean</strong> confidence across required fields
            clears the threshold (0.85). The mean, not the minimum, so one shaky answer is outvoted by
            the fields the profile answered outright — and the weakest field is still named in the run
            log and review report, because a mean can hide it. Multi-step forms run the gate twice
            over: once per step to advance, once for the final submit.
          </p>
          <p className={styles.paragraph}>
            Anything that fails the gate is not abandoned. The form is still filled, screenshotted, and
            written up as a review report with the reason it stopped, so the human work left over is
            clicking one button rather than starting over.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>After the click: four states, three of them not success</h2>
          <div className={styles.stateGrid}>
            {postSubmit.map((state) => (
              <div key={state.state} className={`${styles.stateCard} ${styles[state.tone]}`}>
                <h3 className={styles.stateTitle}>{state.state}</h3>
                <p className={styles.stateDetail}>{state.detail}</p>
              </div>
            ))}
          </div>
          <p className={styles.paragraph}>
            The distinction that matters most is <em>rejected</em> versus <em>unverified</em>. A form
            that rejected the submit never created an application, so the job stays fully retryable. An
            unverified submit may or may not exist, so it is never auto-retried — the next run fills it
            and hands it to a person. That single rule is the difference between an agent you can leave
            running and one you have to supervise.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Reliability and failover</h2>
          <p className={styles.paragraph}>
            Unattended runs fail in ways a &ldquo;submitted ✓&rdquo; flag cannot express, so every
            failure mode has a defined behaviour rather than an exception trace.
          </p>
          <div className={styles.cardGrid}>
            {failover.map((item) => (
              <div key={item.title} className={styles.card}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardBody}>{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>The self-improvement loop</h2>
          <p className={styles.paragraph}>
            Questions the engine could not answer confidently are parked and deduplicated across jobs
            with a <code>times_seen</code> counter, so the questions blocking the most applications
            float to the top. Answer one — at a keyboard, or by replying to a Telegram message from a
            phone — and it enters the answer cache permanently, embedded immediately, resolving that
            question and every future paraphrase of it. The progression is:{' '}
            <em>guess → parked → answered by you → cached → auto-filled everywhere</em>. The engine
            gets strictly more autonomous with every batch triaged, and it does so without ever
            lowering the bar it submits at.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Generated documents, verified by code</h2>
          <p className={styles.paragraph}>
            <strong>Cover letters.</strong> Two model passes (read the posting, then write) are followed
            by a deterministic verifier with no LLM in it: every company-specific claim must trace back
            to the posting text or the sentence is cut, a numeral that appears nowhere in the profile,
            resume or posting is an invented metric and fails the letter, and clichés or phrasing copied
            from the tone exemplars fail it too. A failed letter is not attached — the run continues
            without one, or routes to review if the slot was required. Voice is two independent dials
            (formality, warmth) over a preset, and the first three letters in any new voice force review
            however confident the rest of the form is.
          </p>
          <p className={styles.paragraph}>
            <strong>Tailored resumes.</strong> A cover letter is a pitch; a resume is a record, so the
            model never writes a bullet. Tailoring <em>selects</em> from a corpus of pre-written blocks;
            exactly one block — the three-line summary — is generated, and it is verified clause by
            clause against the corpus before it reaches the page. Ranking is deterministic Python:
            posting terms weighted by position (title &gt; requirements &gt; body) against a lexicon
            closed to what the corpus actually claims, then greedy <em>coverage</em> selection rather
            than top-N, because an ATS only needs a term proved once. Page count is measured, not
            assumed: a monotone ladder drops the least valuable line and grows content back until the
            render is exactly one page. Then every render is read back with a PDF text extractor and
            checked the way a parser would read it — contact details round-trip, section headings
            present and ordered, date ranges match, every printed bullet findable in the text layer,
            nothing living only inside a link annotation. A resume that fails the check is not
            attached; the static PDF goes instead.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Unattended, from a phone</h2>
          <p className={styles.paragraph}>
            The daemon runs as a macOS LaunchAgent with a Telegram front end. Paste a job link and the
            Mac applies to it and reports back: ✅ applied, 👀 needs review with a screenshot, or ❌
            dead-lettered with the reason. Daily and weekly summaries come from the run log, so runs
            started at the keyboard are counted too. <strong>The gate is unchanged</strong> — the daemon
            does not lower the submit bar because nobody is watching; anything that would have paused
            for review at the keyboard still pauses, and messages you instead.
          </p>
          <p className={styles.paragraph}>
            Everything a run does is written to a structured SQLite run log — including crashes. The
            posting snapshot, every question and answer with its source and confidence, the physical
            fill outcome, the submit decision, the confirmation state, the timeline, issues, and
            screenshots. It is searchable from the CLI and exportable to JSON or CSV, which means a
            claim like &ldquo;submitted&rdquo; is always backed by a row rather than a memory.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>What was actually hard</h2>
          <p className={styles.paragraph}>
            Most of the difficulty was never intelligence. It was honesty and detection — building a
            system that would rather stop than be quietly wrong under a real person&apos;s name.
          </p>
          <div className={styles.timeline}>
            {difficulties.map((item) => (
              <div key={item.problem} className={styles.timelineItem}>
                <h3 className={styles.timelineTitle}>{item.problem}</h3>
                <p className={styles.timelineBody}>{item.solution}</p>
              </div>
            ))}
          </div>
          <p className={styles.paragraph}>
            The recurring principle across all of it: <strong>when the system is unsure, it must fail
            loudly into a review queue rather than quietly submit something wrong.</strong> Every
            architectural choice above is downstream of that one sentence.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Privacy posture</h2>
          <p className={styles.paragraph}>
            With the default local provider, the resume, profile, and every cached answer stay on the
            machine — inference runs against Ollama on localhost. Gmail access, used only to clear
            post-submit verification walls, holds the single read-only scope: the application cannot
            send, modify, mark-read, move, or delete mail, and codes, message bodies and credentials
            are never written to the audit log. Passwords are never stored in the database — it holds a
            reference into the macOS keychain, an encrypted vault, or 1Password. Switching to a hosted
            provider (OpenRouter) is a per-run flag and a trade-off you make deliberately.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Stack</h2>
          <ul className={styles.chips}>
            {stack.map((item) => (
              <li key={item} className={styles.chip}>
                {item}
              </li>
            ))}
          </ul>
          <p className={styles.footnote}>
            Auto-Apply is a private repository — the code touches personal data and live applications.
            An architecture walkthrough and a demo are available on request; the full summary lives on{' '}
            <Link href="/cv">my CV</Link>, and the raw Markdown version is at{' '}
            <a href="/cv.md">/cv.md</a> for anyone (or anything) reading this programmatically.
          </p>
        </section>
      </main>
    </div>
  );
}
