# Reuben Roy

Software Engineer | AI & Agentic Systems | Generalist creating web solutions

## Links

- Website: https://explosion.fun
- Projects: https://explosion.fun/projects
- LinkedIn: https://linkedin.com/in/reuben-roy
- GitHub: https://github.com/reuben-roy

## Summary

Software engineer and generalist who builds autonomous, agentic systems on top of production-grade backends. Current focus is applied AI: local-first LLM pipelines, retrieval-augmented answer resolution, and long-running unattended agents that make consequential decisions with explicit confidence gates, verification, and failover rather than optimism. Also builds interactive websites, data visualizations, mobile experiences, and backend microservices at scale. Always learning, always building.

## Education

- Arizona State University (ASU) — MS in Software Engineering (2024-2026)
- National Institute of Technology, Calicut (NITC) — B.Tech (2017-2021)

## Skills

- AI and Agentic Systems: LLM orchestration, Local inference (Ollama), Structured JSON output, RAG, Semantic retrieval and embeddings, Confidence gating, Prompt verification, Browser automation agents (Playwright, Patchright, browser-use), Tool-using agents, Autonomous task queues with retry and dead-lettering, OpenRouter, Anthropic, Gemini, Claude Code
- Backend Development: Java, Spring Boot, Python, .NET, C#, Microservices, REST APIs, Maven, JUnit5, Mockito, Unit Testing, FastAPI, Fastify, Go, Kotlin, Node.js, Prisma, GraphQL
- Frontend Development: HTML, CSS, JavaScript, TypeScript, React.js, React Native, Next.js, Three.js, D3.js, Tailwind CSS, Bootstrap, MUI, Vite
- Databases: PostgreSQL, Redis, MySQL, SQL, NoSQL, SQLite
- Cloud and Infrastructure: AWS, Google Cloud, Azure, Docker, Heroku, Vercel, Firebase
- Version Control and DevOps: Git, GitHub, BitBucket, GitHub Actions, CI/CD, SonarQube
- Data Science and Analytics: Data Visualization (D3.js, Matplotlib), Data Mining, Data Modeling, Machine Learning, NumPy, Pandas
- Project Management: Agile, Jira/Kanban, Confluence, Postman
- Soft Skills: Written Communication, Verbal Communication, Problem Solving, Technical Documentation

## Work Experience

### AI Engineer (Capstone), Aligned Rewards

- Developed production RAG features with LangChain, FastAPI, OpenAI embeddings and Pinecone; implemented dynamic routing and fallbacks between OpenRouter and local Gemma 3 models via Ollama.
- Designed the provider fallback path so a failed hosted call degrades to a local model instead of failing the request, keeping the feature available without a paid dependency.
- Built backend interfaces for model steering and reliable AI workflow generation, documenting system behavior and integration decisions for the product team.
- Skills: Python, LangChain, FastAPI, OpenAI, Pinecone, Ollama, OpenRouter, RAG, Vector Search, Agentic Workflows

### Graduate Teaching Assistant / AI Engineer, Arizona State University

- Built a privacy-focused AI Auto-Grader integrated with the Canvas API, OpenAI and OpenRouter; engineered a schema-driven rubric engine that generated consistent, detailed feedback from PDF lab results.
- Kept student work on university infrastructure by routing grading through self-hosted models, so no coursework left the institution's control.
- Supported a graduate software engineering course, reviewing student submissions and explaining design and testing feedback in office hours.
- Skills: Python, Structured Output, REST APIs, Ollama, Local LLMs, Privacy Engineering, Code Review

### Software Engineer, RCKR Software (Trubridge / CPSI client project)

- Developed secure backend services for the Unify interoperability product, following the FHIR specification so hospitals across the US could exchange patient records directly, reducing the cost of patient care.
- Engineered asynchronous C#/.NET services and custom SQL ETL pipelines to migrate 64+ TB of hospital data while supporting secure, HIPAA-compliant FHIR integrations.
- Optimized PostgreSQL data-access layers with Entity Framework, reducing execution time by 90% for mission-critical reporting and automated data exchange workflows.
- Introduced Redis caching and asynchronous processing to keep large record-exchange jobs responsive under production load; secured service-to-service access with OAuth and JWT and gated the codebase on SonarQube checks in Bitbucket Pipelines.
- Skills: .NET, C#, Entity Framework, REST APIs, Microservices, FHIR, HL7, OAuth, JWT, PostgreSQL, Redis, SQL, Azure, Docker, CI/CD, SonarQube, Agile/Scrum

### Full-Stack Developer, Tata Consultancy Services (IKEA client project)

- Built the Java Spring Boot microservices powering the IKEA websites on GCP, on a platform processing millions of transactions annually.
- Primary focus on the Quotation Management initiative: services to generate quotes, manage revisions and approvals, and automatically notify customers and internal stakeholders about order status updates.
- Reduced Quote Management System API latency by 70% through Redis caching and SQL index optimization, and implemented multithreaded workers and scheduled jobs for concurrent workloads.
- Redesigned ReactJS checkout components, saving 1.5 minutes per transaction; also contributed to the 3D "Planner" tool that lets customers lay out their rooms before ordering.
- Wrote unit tests with JUnit and mocking frameworks and maintained 80%+ code coverage through Maven, Git and CI/CD pipelines.
- Skills: Java, Spring Boot, Spring MVC, Microservices, REST APIs, Multithreading/Concurrency, Maven, JUnit5, Mockito, React.js, JavaScript, PostgreSQL, Redis, GCP, Docker, CI/CD, Agile/Scrum

## Internships

### ElectroBiosonics, Cochin

- Date: December 2018
- Worked under Dr Cherian on PCB design using MPLabX and fabrication, electronic equipment assembly, commercial electroplating, transformers and power systems manufacturing.

### Keltron, Thrissur, Kerala

- Date: May 2019
- Worked with Arduino to build connected devices and electronics, learning the internet of things end to end.

### Geo-Enterprises, Kerala

- Date: December 2020
- Developed comprehensive e-commerce solutions using the WordPress ecosystem, implementing payment gateways, performance optimization, and digital marketing strategies to drive business growth.
- Skills: WordPress, WooCommerce, Razorpay Integration, Payment Gateways, SEO Optimization, Google Analytics, Performance Optimization, SSL/TLS, Custom Theme Development, Responsive Design

## Certifications and Workshops

- [JavaScript Algorithms and Data Structures](https://www.freecodecamp.org/certification/ReubenRoy/javascript-algorithms-and-data-structures) - freeCodeCamp.org
- [Responsive Web Design](https://www.freecodecamp.org/certification/ReubenRoy/responsive-web-design) - freeCodeCamp.org
- [Introduction to Data Science in Python](https://www.coursera.org/account/accomplishments/certificate/PP9R2W2SGRXH) - University of Michigan & Coursera
- [Google AI | Explore ML Workshop](https://drive.google.com/file/d/1-dm9rRxr2olYYuFQeU1J7owzvZSl3wUa/view?usp=sharing) - Google
- Astrophysics Workshop Conductor - NIT Calicut

## Projects

### Auto-Apply — Autonomous Job-Application Agent

- A local-first agentic system that applies to jobs end-to-end while nobody is at the keyboard. Paired with a companion scraping agent (Hermes) that pulls the day's recommended listings from Jobright, it forms a complete unattended pipeline: discover postings → resolve every form question → fill → decide whether to submit → verify → report. Runs overnight on a personal Mac against local models; no cloud inference required.
- Scale: ~21,700 lines of Python across 69 modules, backed by ~9,800 lines of tests (724 tests in 48 modules). Supports Greenhouse, Lever, Ashby, and Workday (multi-step, with per-tenant account creation).
- Core architectural decision: **the model never drives the browser and never decides whether to submit.** It only answers questions. The form's schema is fetched from the ATS's own public API/GraphQL, each field is resolved by a trust order (profile = confidence 1.0 → persistent answer cache = 0.9 → LLM structured JSON = self-reported confidence), Playwright fills it deterministically against stable selectors, and a confidence gate decides submit vs. hand-to-human. Everything except the answers themselves is deterministic code with a number attached.
- Local inference: Ollama running `qwen3.6:35b-a3b` in no-think mode, with `nomic-embed-text` for embeddings. Optional OpenRouter provider for faster/cheaper hosted inference, selectable per run.
- Local RAG / semantic recall: two-tier retrieval over the answer cache — near-duplicates (cosine ≥ 0.85) fill directly, grey-zone paraphrases (≥ 0.55) are retrieved into the prompt as previously approved answers that the model must explicitly claim before they are trusted. Retrieval supplies recall, the model supplies the precision a flat threshold cannot. Knowledge-topic grounding works the same way and requires the model to name the topic it drew from. Embeddings live as blobs in the existing SQLite cache with brute-force cosine — no vector database.
- Self-improvement loop: questions the engine could not answer confidently are parked, deduplicated across jobs with a `times_seen` counter so the highest-leverage questions surface first. Answer one by hand (or from a phone) and it enters the cache permanently, resolving that question and every future paraphrase of it. The system becomes strictly more autonomous with every batch triaged.
- Generated cover letters: two model passes (read posting → write) followed by a **deterministic verifier with no LLM involved** — every company-specific claim must trace to the posting text, any numeral absent from the profile/resume/posting is treated as an invented metric, and clichés or phrasing copied from tone exemplars fail the letter. A failed letter is not attached. Voice is expressed as two independent dials (formality, warmth) over a preset, with a three-letter warm-up that forces human review before any new voice is trusted.
- Tailored resumes: the model never writes a bullet — a resume is a record, so tailoring *selects* from a corpus of pre-written blocks and only the three-line summary is generated (and verified clause-by-clause against the corpus). Ranking is deterministic Python: posting terms weighted by position (title > requirements > body), matched against a lexicon closed to what the corpus actually claims, then greedy *coverage* selection rather than top-N. A monotone ladder drops and re-grows content until the render measures exactly one page. Every render is read back with a PDF text extractor and checked the way an ATS parser would read it — contact details round-trip, section headings present and ordered, date ranges match, every printed bullet findable in the text layer, nothing living only inside a link annotation. A resume that fails is not attached; the static PDF goes instead.
- Reliability and failover (production-quality behaviour, not a demo):
  - **Graceful degradation everywhere.** Unknown ATS falls back to a browser-use agent that fills but never submits. Missing embedding model silently reverts to regex/fuzzy matching. An unreachable or unhelpful model leaves the deterministic keyword ranking standing — tailoring degrades to "keyword-ranked", never to "no resume". A hosted model that rejects strict JSON schema is retried with a looser JSON mode.
  - **Bounded transient retries** on ATS schema fetches, scoped to the status codes where a retry can plausibly change the result.
  - **"Submitted" means verified.** After the click, the resulting page is classified: ATS confirmation → success; verification/CAPTCHA/login wall or validation errors → failed; anything unrecognisable → *unverified*, which is treated as **not submitted**. Deduplication only skips confirmed submits, so unverified work stays retryable — but a retry is forced into human review so a person clicks the final button, which is what prevents duplicate applications.
  - **Durable queue with dead-lettering.** The unattended daemon runs an on-disk SQLite task queue: 3 attempts, exponential backoff from 5 minutes, then a dead-letter queue inspectable and requeueable from the phone.
  - **Never guess a credential.** A rejected Workday password routes to the reset flow, never to a retry loop; an account created but not yet email-verified stays retryable and is never re-signed-up.
  - **Consent escalation.** Background checks, arbitration agreements, drug tests, and credit checks are never agreed to automatically — the run stops and asks, and the answer is remembered per category for every company thereafter.
  - **An issue log as the single place to look.** Every wall — CAPTCHA, email-code gate, closed posting, silent upload failure — is detected, classified blocking/warning/info, and appended with the job URL and a screenshot.
  - **Sleep is a latency cost, never a data-loss event.** The daemon holds a `caffeinate` assertion on AC power and, on battery, lets the Mac sleep while arming an RTC wake every 15 minutes to drain the backlog. The queue is on disk and inbound messages are retained upstream, so nothing is lost either way.
  - **Untrusted input is data, not instructions.** In the phone-controlled mode only one allowlisted chat is obeyed, and only a fixed set of slash commands and URLs on a supported ATS are actionable — free text claiming urgency or authority does nothing.
- Bot-detection posture: every session is driven by Patchright (Playwright with the DevTools-protocol automation leaks removed) against installed Chrome with a persistent profile. That is what allows Workday's noCaptcha-wrapped forms to accept automated submits. A challenge that is actually *shown* is never solved or bypassed — it is handed to the human, who solves it once into the persistent profile.
- Privacy: with the default local provider, resume, profile, and answers never leave the machine. Gmail access for post-submit verification codes uses the single read-only scope; message bodies, codes, and credentials are never written to the audit log.
- Observability: every run — including crashes — writes a row to a structured SQLite run log capturing the posting snapshot, every question and answer with its source and confidence, fill outcome, submit decision, confirmation state, timeline, issues, and screenshots. Searchable from the CLI and exportable to JSON/CSV.
- How it was built, and what was hard: v1 was the obvious thing — a browser-use agent on a local model clicking its way through forms. It was slow, non-reproducible, and worst of all could not tell you whether an application had actually been submitted. The rewrite inverted the design: fetch the form schema from the ATS's own API, let the model answer questions only, and make every other step deterministic. From there the hard problems were mostly about honesty and detection rather than intelligence — distinguishing "clicked submit" from "application received"; invisible reCAPTCHA v3 scoring the automation stack, which forced the move to Patchright and a real Chrome profile; CAPTCHA false-positive classification; email-verification walls appearing *after* submit, solved with read-only Gmail matching on server receive time, trusted sender domains, and the current company/role, with any ambiguity refusing to guess; and a long tail of per-ATS behaviour (Greenhouse's location typeahead, Ashby multiselects that only group by id prefix, forms that must be answered the page's own way rather than the walk's). The recurring principle: when the system is unsure, it must fail loudly into a review queue rather than quietly submit something wrong under a real person's name.
- Technology stack: Python 3.11, Playwright/Patchright, Ollama (qwen3.6, nomic-embed-text), OpenRouter, browser-use, SQLite (7 stores), Typer CLI, Gmail API (read-only OAuth), Telegram Bot API, macOS LaunchAgent, uv, pytest.
- Full technical write-up: [explosion.fun/projects/auto-apply](https://explosion.fun/projects/auto-apply)
- Status: private repository — architecture walkthrough and demo available on request.

### explosion.fun — Interactive Website and Data Lab

- A personal publishing platform and quantified-self product studio: a ranked media-review blog on a headless WordPress GraphQL CMS, interactive long-form essays, and shippable mini-products.
- Highlights: Next.js App Router, static export, GraphQL middleware, Core Web Vitals optimization, lazy loading, image optimization, CSS Modules, accessible interactions, Vercel CI/CD with preview deployments.
- Links: https://explosion.fun/, https://github.com/reuben-roy/explosion.fun

### Interactive Visualizations

- A collection of immersive 3D and data visualizations exploring complex concepts through code, demonstrating WebGL (Three.js) and data visualization (D3.js) proficiency.
- Technologies: Three.js / React Three Fiber, D3.js and TopoJSON, physics engine integration, SVG animations, render-loop performance optimization.
- Preview links: https://explosion.fun/blog/post/interactive/bird-migration, https://explosion.fun/blog/post/interactive/solar-system

### Greatness — Self-Actualization Scoring

- Define your own self-actualization metrics, upload Google Takeout browsing data, and get a composite Greatness Score with a public leaderboard.
- Technology stack: Next.js, React, Supabase (auth, Postgres, RLS), client-side ingest and scoring pipeline.
- Link: https://explosion.fun/projects/greatness

### Side-Track

- A React Native iOS weight-training app with a random workout picker, muscle-specific fatigue tracking, local leaderboard rankings, and Apple Health integration. Built a muscle-fatigue recovery engine and predictive polling that cut cloud costs by 50%.
- Technology stack: React Native, Expo, TypeScript, SQLite, Supabase, Go, PostgreSQL.
- Links: https://apps.apple.com/app/side-track/id6755348971, https://explosion.fun/side-track

### Window — On-device AI screen summarizer

- An Android app that tracks app usage and scrapes visible UI text, then runs on-device Gemini Nano to summarize digital activity without sending screen contents off the device.
- Technology stack: Kotlin, Go, Gemini Nano, SQLite, RAG.
- Link: https://github.com/reuben-roy/window

### Window Extension

- A Chrome extension that turns the browser into a calendar-aware productivity co-pilot: Google Calendar sync, event-specific site whitelisting, distraction blocking during focus sessions, and an assistant for idea capture and evaluation.
- Monorepo with a Manifest V3 extension (popup, options calendar workspace, blocked page, side panel, service worker) and a self-hosted backend (Fastify API, background worker, PostgreSQL) for auth, persistence, and async AI jobs.
- Technology stack: TypeScript, React, Vite, Chrome Manifest V3, FullCalendar, Fastify, Node.js, Prisma, PostgreSQL, Zod.
- Link: https://github.com/reuben-roy/window-extension

### Kali

- A fitness platform that treats physical progression like version control, with a Go and PostgreSQL backend modelling training history and a Next.js front end and waitlist.
- Technology stack: Go, Next.js, PostgreSQL, React, TypeScript, Tailwind CSS, Vercel.
- Links: https://github.com/reuben-roy/kali, https://github.com/reuben-roy/Kali-Platform

### Ranker

- A career exploration and ranking app that maps a user's skills, interests, and traits against a dynamic hierarchical job database to surface best-fit roles, over a Go API with OAuth sign-in.
- Technology stack: Go, React Native, PostgreSQL, OAuth, RAG, TypeScript.
- Link: https://github.com/reuben-roy/ranker

### Clackinator

- A native macOS menu bar utility that synthesizes and samples mechanical keyboard sound packs with low-latency audio scheduling.
- Technology stack: Swift, AVAudioEngine.
- Link: https://github.com/reuben-roy/clackinator

### Job Answer App

- A single-page tool that uses hosted LLMs to generate tailored job-application answers from a resume and a set of writing rules.
- Technology stack: JavaScript, Node.js, OpenRouter, Vercel.
- Link: https://github.com/reuben-roy/job-answer-app

### Freelance E-Commerce Projects

- Built responsive websites for small businesses including Natura Bags and Serah Design, focusing on product showcasing, SEO optimization, and seamless e-commerce functionality.
- Highlights: WooCommerce and WordPress, payment gateway integration, SEO optimization, product catalogs, responsive design, image optimization.
- Links: https://naturabags.com/, https://serahdesign.com/
