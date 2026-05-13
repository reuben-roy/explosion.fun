'use client';

import { useEffect, useRef, useState } from 'react';
import Navbar from '../../components/Navbar';
import styles from './career.module.css';

export default function Career() {
    const canvasRef = useRef(null);

    useEffect(() => {
        // Add your Three.js background animation here if needed
        // This is where you'd implement the canvas background effect
    }, []);

    // New: categories with child skills
    const skillCategories = [
        {
            name: "Backend Development",
            items: ["Java", "Spring Boot", "Python", ".NET", "Microservices", "REST APIs", "Maven", "JUnit5", "Mockito", "Unit Testing",
        "Fastify",
        "Go",
        "Kotlin",
        "Node.js",
        "Prisma",
        "REST"]
        },
        {
            name: "Frontend Development",
            items: ["HTML", "CSS", "JavaScript", "React.js", "Three.js", "Bootstrap", "MUI", "D3.js",
        "Next.js",
        "React",
        "React Native",
        "Tailwind CSS",
        "TypeScript",
        "Vite"]
        },
        {
            name: "Databases",
            items: ["PostgreSQL", "Redis", "MySQL", "SQL", "NoSQL",
        "SQLite"]
        },
        {
            name: "Cloud & Infrastructure",
            items: ["AWS", "Google Cloud", "Azure", "Docker", "Heroku", "Vercel", "Firebase"]
        },
        {
            name: "Version Control & DevOps",
            items: ["Git", "GitHub", "BitBucket", "GitHub Actions"]
        },
        {
            name: "Data Science & Analytics",
            items: ["Data Visualization (D3.js, Matplotlib)", "Data Mining", "Data Modeling", "Machine Learning", "NumPy", "Pandas"]
        },
        {
            name: "Project Management",
            items: ["Agile", "Jira/Kanban", "Confluence", "Postman"]
        },
        {
            name: "Content Management",
            items: ["WordPress", "iText", "Poetry"]
        },
        {
            name: "Development Tools",
            items: ["VS Code", "Postman", "SonarQube"]
        },
        {
            name: "Soft Skills",
            items: ["Written Communication", "Verbal Communication", "Problem Solving", "Software Development", "Web Development"]
        },
    ];

    // New: which categories are expanded
    const [expanded, setExpanded] = useState([]);
    const toggleCategory = (index) => {
        setExpanded((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    const workExperience = [
        {
            title: "Full-Stack Developer, Tata Consultancy Services (IKEA Client Project)",
            description: "Built the microservices powering the IKEA websites, processing millions of transactions annually. Primary focus on the Quotation Management initiative: created services to generate quotes, manage revisions/approvals, and automatically notify customers and internal stakeholders about order status updates. Also contributed to the 3D \"Planner\" tool that lets users build their rooms in 3D. Worked closely with cross-functional teams in an agile environment, adopting corporate tooling and processes.",
            skills: [
                "Java", "Spring Boot", "Python", "REST APIs", "Microservices", "Maven", "Gradle", "JUnit5", "Mockito",
                "Node.js", "Express", "OAuth", "OIDC", "JWT", "WebSockets", "HTML", "CSS", "JavaScript", "React.js", "Bootstrap",
                "PostgreSQL", "GCP", "Docker", "CI/CD", "GitHub Actions", "ESLint", "Prettier", "SonarQube",
                "Agile/Scrum", "Jira", "Confluence", "Postman"
            ]
        },
        {
            title: "Full-Stack Developer, RCKR Software (CPSI/ Trubridge Client Project)",
            description: "Developed secure backend systems for the Unify service, following the FHIR specification, allowing hospitals USA wide to exchange information seamlessly, reducing cost of patient care significantly.",
            skills: [
                ".NET", "REST APIs", "Microservices", "FHIR", "HL7", "Mockito", "OAuth", "JWT", "HTML", "CSS", "JavaScript",
                "PostgreSQL", "Redis", "SQL", "NoSQL", "Azure", "Docker", "CI/CD", "Bitbucket Pipelines", "SonarQube",
                "Agile/Scrum", "Jira", "Confluence", "Postman", "Performance Optimization"
            ]
        },
    ];

    const internships = [
        {
            title: "ElectroBiosonics, Cochin",
            date: "December 2018",
            description: "Worked under Dr Cherian for PCB designing using MPLabX and fabrication, electronic equipment assembly, commercial electroplating, transformers and power systems manufacturing etc."
        },
        {
            title: "Keltron, Thrissur, Kerala",
            date: "May 2019",
            description: "Worked with Arduino to make connected devices and electronics to understand more about the internet of things."
        },
        {
            title: "Geo-Enterprises, Kerala",
            date: "December 2020",
            description: "Developed comprehensive e-commerce solutions using WordPress ecosystem, implementing payment gateways, performance optimization, and digital marketing strategies to drive business growth.",
            skills: [
                "WordPress", "WooCommerce", "Jetpack", "Razorpay Integration", "Payment Gateways", "HTML", "CSS",
                "SEO Optimization", "Digital Marketing", "Google Analytics", "Performance Optimization", "Security Implementation", "SSL/TLS",
                "REST API Integration", "Custom Theme Development", "Responsive Design", "User Experience Design (UX)"
            ]
        },
    ];

    const certifications = [
        {
            title: "JavaScript Algorithms and Data Structures",
            organization: "freeCodeCamp.org",
            link: "https://www.freecodecamp.org/certification/ReubenRoy/javascript-algorithms-and-data-structures"
        },
        {
            title: "Responsive Web Design",
            organization: "freeCodeCamp.org",
            link: "https://www.freecodecamp.org/certification/ReubenRoy/responsive-web-design"
        },
        {
            title: "Introduction to Data Science in Python",
            organization: "University of Michigan & Coursera",
            link: "https://www.coursera.org/account/accomplishments/certificate/PP9R2W2SGRXH"
        },
        {
            title: "Google AI|Explore ML Workshop",
            organization: "Google",
            link: "https://drive.google.com/file/d/1-dm9rRxr2olYYuFQeU1J7owzvZSl3wUa/view?usp=sharing"
        },
        {
            title: "Astrophysics Workshop Conductor",
            organization: "NIT Calicut",
            link: null
        },
        {
            title: "Kali",
            overview: [
                "Landing page and waitlist for Kali — a fitness platform that treats physical progression like version control."
            ],
            features: [{"title": "Technology Stack", "items": ["Go", "Lucide", "Next.js", "PostgreSQL", "React", "SQL", "Tailwind CSS", "TypeScript", "Vercel"]}],
            url: "https://kali-rose.vercel.app",
            urls: [{"name": "Visit Kali", "url": "https://kali-rose.vercel.app"}, {"name": "GitHub Repository", "url": "https://github.com/reuben-roy/kali"}]
        },
        {
            title: "Side-Track",
            overview: [
                "A React Native iOS weight-training app with a random workout picker, muscle-specific fatigue tracking, local leaderboard rankings, and Apple Health integration."
            ],
            features: [{"title": "Technology Stack", "items": ["Go", "PostgreSQL", "RAG", "React", "React Native", "SQL", "SQLite", "TypeScript"]}],
            url: "https://apps.apple.com/app/side-track/id6755348971",
            urls: [{"name": "Visit Side-Track", "url": "https://apps.apple.com/app/side-track/id6755348971"}, {"name": "GitHub Repository", "url": "https://github.com/reuben-roy/side-track"}]
        },
        {
            title: "Window",
            overview: [
                "An Android app that watches your screen — tracking app usage, scraping visible UI text, and running on-device Gemini Nano AI to summarize your digital activity."
            ],
            features: [{"title": "Technology Stack", "items": ["Gemini", "Go", "Gradle", "Kotlin", "RAG", "SQL", "SQLite"]}],
            urls: [{"name": "GitHub Repository", "url": "https://github.com/reuben-roy/window"}]
        },
        {
            title: "Window-Extension",
            overview: [
                "A Chrome extension that transforms your browser into an intelligent productivity co-pilot — connecting to Google Calendar and blocking distractions during focus sessions."
            ],
            features: [{"title": "Technology Stack", "items": ["Fastify", "FullCalendar", "Go", "Node.js", "OAuth", "PostgreSQL", "Prisma", "RAG", "REST", "React", "SQL", "Tailwind CSS", "TypeScript", "Vite"]}],
            urls: [{"name": "GitHub Repository", "url": "https://github.com/reuben-roy/window-extension"}]
        },
        {
            title: "blistering-barnacles",
            overview: [
                "A project built with Anthropic, FullCalendar, Go, LLMs, Lucide, Next.js."
            ],
            features: [{"title": "Technology Stack", "items": ["Anthropic", "FullCalendar", "Go", "LLMs", "Lucide", "Next.js", "OpenAI", "RAG", "React", "Tailwind CSS", "Turbopack", "TypeScript"]}],
            url: "https://blistering-barnacles.vercel.app",
            urls: [{"name": "Visit blistering-barnacles", "url": "https://blistering-barnacles.vercel.app"}, {"name": "GitHub Repository", "url": "https://github.com/reuben-roy/blistering-barnacles"}]
        },
        {
            title: "Clackinator",
            overview: [
                "A native macOS menu bar utility that plays satisfying mechanical keyboard sounds as you type."
            ],
            features: [{"title": "Technology Stack", "items": ["AVAudioEngine", "Swift"]}],
            urls: [{"name": "GitHub Repository", "url": "https://github.com/reuben-roy/clackinator"}]
        },
        {
            title: "Ranker",
            overview: [
                "A career exploration and ranking app that maps your skills, interests, and traits against a dynamic hierarchical job database to surface the best-fit roles."
            ],
            features: [{"title": "Technology Stack", "items": ["Go", "Lucide", "OAuth", "PostgreSQL", "RAG", "React", "React Native", "SQL", "Tailwind CSS", "TypeScript", "Vite"]}],
            urls: [{"name": "GitHub Repository", "url": "https://github.com/reuben-roy/ranker"}]
        },
        {
            title: "Switch-Market",
            overview: [
                "A lightweight, vanilla-JS shopping demo with D3-powered visualizations, real-time search, and CSV sales data integration — hosted on Firebase."
            ],
            features: [{"title": "Technology Stack", "items": ["D3.js", "Firebase", "Go", "Java", "JavaScript", "Python"]}],
            urls: [{"name": "GitHub Repository", "url": "https://github.com/reuben-roy/switch-market"}]
        },
    ];

    const projects = [
        {
            title: "Explosion.fun Interactive Website",
            overview: [
                "A creative and interactive portfolio website featuring dynamic visual effects and engaging user experiences.",
                "Demonstrates front-end development capabilities, creative coding, and performance-conscious interactions."
            ],
            features: [
                {
                    title: "Platform & Architecture",
                    items: [
                        "Next.js App Router", "SSR & SSG", "File-based routing", "API Routes", "Automatic code splitting"
                    ]
                },
                {
                    title: "Performance & Quality",
                    items: [
                        "Core Web Vitals optimization", "Bundle optimization", "Lazy loading", "Image optimization", "ESLint & Prettier"
                    ]
                },
                {
                    title: "UI/UX & Accessibility",
                    items: [
                        "Responsive design", "CSS Modules", "Accessible interactions", "Subtle motion/animation", "Creative coding demos"
                    ]
                },
                {
                    title: "Deployment",
                    items: [
                        "Vercel CI/CD", "Edge functions", "Custom domain", "Preview deployments"
                    ]
                }
            ],
            url: "https://explosion.fun/"
        },
        {
            title: "Interactive Visualizations",
            overview: [
                "A collection of immersive 3D and data visualizations exploring complex concepts through code.",
                "Demonstrating proficiency in WebGL (Three.js) and Data Visualization (D3.js)."
            ],
            features: [
                {
                    title: "Technologies Used",
                    items: [
                        "Three.js / React Three Fiber", "D3.js & TopoJSON", "Physics Engine Integration", "SVG Animations", "Performance Optimization"
                    ]
                }
            ],
            interactivePreviews: [
                {
                    title: "Flight of the Storks",
                    url: "/blog/post/interactive/bird-migration",
                    height: 500
                },
                {
                    title: "3D Solar System",
                    url: "/blog/post/interactive/solar-system",
                    height: 500
                }
            ]
        },
        {
            title: "Freelance E-Commerce Projects",
            overview: [
                "Built responsive websites for small businesses including Natura Bags and Serah Design, focusing on product showcasing, SEO optimization, and seamless e-commerce functionality."
            ],
            features: [
                {
                    title: "Key Features",
                    items: [
                        "WooCommerce & WordPress", "Payment gateway integration", "SEO optimization", "Product catalogs", "Responsive design", "Image optimization"
                    ]
                }
            ],
            urls: [
                { name: "Natura Bags", url: "https://naturabags.com/" },
                { name: "Serah Design", url: "https://serahdesign.com/" }
            ]
        }
    ];

    return (
        <>
            <Navbar />
            <canvas ref={canvasRef} className={styles.backgroundCanvas} />

            <div className={styles.page}>
                <main className={styles.main}>
                    {/* Skills Section */}
                    <section id="skills" className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Skills</h2>
                            <p className={styles.subtitle}>
                                A person is more than the list of technologies they used to get work done
                            </p>
                            <p className={styles.subtext}>
                                But these are the technologies I am familiar with
                            </p>
                        </div>

                        {/* New accordion-based skills UI */}
                        <div className={styles.skillsAccordion}>
                            {skillCategories.map((cat, index) => {
                                const isOpen = expanded.includes(index);
                                return (
                                    <div
                                        key={cat.name}
                                        className={`${styles.skillCategory} ${isOpen ? styles.open : ''}`}
                                    >
                                        <button
                                            type="button"
                                            className={styles.skillHeader}
                                            aria-expanded={isOpen}
                                            aria-controls={`skill-cat-${index}`}
                                            onClick={() => toggleCategory(index)}
                                        >
                                            <span>{cat.name}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                                <span className={styles.skillCount}>{cat.items.length}</span>
                                                <span className={styles.skillToggleIcon} aria-hidden="true" />
                                            </div>
                                        </button>

                                        <div
                                            id={`skill-cat-${index}`}
                                            className={styles.skillContent}
                                        >
                                            <div className={styles.pillsWrap}>
                                                {cat.items.map((item) => (
                                                    <span key={item} className={styles.skillPill}>{item}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Experience Section */}
                    <section id="experience" className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Work Experience</h2>
                        </div>

                        <div className={styles.experienceContainer}>
                            <div className={styles.experienceSection}>
                                <h3 className={styles.sectionTitle}>Work History</h3>

                                {workExperience.map((job, index) => (
                                    <div key={index} className={styles.experienceCard}>
                                        <h4>{job.title}</h4>
                                        <p className={styles.experienceDescription}>{job.description}</p>
                                        {job.skills?.length ? (
                                            <div className={styles.jobSkills}>
                                                <div className={styles.jobSkillsHeader}>Skills</div>
                                                <div className={styles.pillsWrap}>
                                                    {job.skills.map((s) => (
                                                        <span key={s} className={styles.skillPill}>{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>

                            <div className={styles.experienceSection}>
                                <h3 className={styles.sectionTitle}>Internships</h3>

                                {internships.map((internship, index) => (
                                    <div key={index} className={styles.experienceCard}>
                                        <h4>{internship.title}</h4>
                                        <p className={styles.experienceDate}>{internship.date}</p>
                                        <p className={styles.experienceDescription}>{internship.description}</p>
                                        {internship.skills?.length ? (
                                            <div className={styles.jobSkills}>
                                                <div className={styles.jobSkillsHeader}>Skills</div>
                                                <div className={styles.pillsWrap}>
                                                    {internship.skills.map((s) => (
                                                        <span key={s} className={styles.skillPill}>{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Certifications Section */}
                    <section id="certifications" className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Certifications and Workshops</h2>
                        </div>

                        <div className={styles.certificationsGrid}>
                            {certifications.map((cert, index) => (
                                <div key={index} className={styles.certCard}>
                                    {cert.link ? (
                                        <a href={cert.link} target="_blank" rel="noopener noreferrer">
                                            {cert.title}
                                        </a>
                                    ) : (
                                        <span>{cert.title}</span>
                                    )}
                                    <p>{cert.organization}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Portfolio Section */}
                    <section id="portfolio" className={styles.section}>
                        <h2>Previous Web Projects</h2>
                        <hr className={styles.divider} />

                        {projects.map((proj) => (
                            <div key={proj.title} className={styles.portfolioProject}>
                                <h3>{proj.title}</h3>
                                {proj.overview.map((p, i) => (
                                    <p key={i}>{p}</p>
                                ))}

                                <h4>Feature Highlights</h4>

                                <div className={styles.featuresGrid}>
                                    {proj.features.map((group) => (
                                        <div key={group.title} className={styles.featureGroup}>
                                            <h5>{group.title}</h5>
                                            <ul className={styles.featureList}>
                                                {group.items.map((item) => (
                                                    <li key={item} className={styles.featureItem}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>

                                {proj.url && (
                                    <iframe
                                        className={styles.portfolioFrame}
                                        src={proj.url}
                                        height="450"
                                        width="100%"
                                        title={proj.title}
                                    />
                                )}

                                {proj.interactivePreviews && (
                                    <div className={styles.interactivePreviews}>
                                        {proj.interactivePreviews.map((preview) => (
                                            <div key={preview.url} className={styles.previewItem}>
                                                <h4 className={styles.previewTitle}>
                                                    <a href={preview.url} target="_blank" rel="noopener noreferrer">
                                                        {preview.title} ↗
                                                    </a>
                                                </h4>
                                                <iframe
                                                    className={styles.portfolioFrame}
                                                    src={preview.url}
                                                    height={preview.height || 450}
                                                    width="100%"
                                                    title={preview.title}
                                                    loading="lazy"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {proj.urls && (
                                    <div className={styles.projectLinks}>
                                        {proj.urls.map((link) => (
                                            <a
                                                key={link.url}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.projectLink}
                                            >
                                                {link.name} ↗
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </section>
                </main>
            </div>
        </>
    );
}