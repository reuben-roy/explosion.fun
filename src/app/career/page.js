'use client';

import { useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import styles from './career.module.css';

export default function Career() {
    const canvasRef = useRef(null);

    useEffect(() => {
        // Add your Three.js background animation here if needed
        // This is where you'd implement the canvas background effect
    }, []);

    const skills = [
        {
            title: "Backend Development",
            description: "Java (Spring Boot), Python, .NET, Microservices, REST APIs, Maven, JUnit5, Mockito"
        },
        {
            title: "Frontend Development",
            description: "HTML, CSS, JavaScript, React.js, Three.js, Bootstrap, MUI, D3.js"
        },
        {
            title: "Databases",
            description: "PostgreSQL, Redis, MySQL, SQL and NoSQL Databases"
        },
        {
            title: "Cloud & Infrastructure",
            description: "AWS, Google Cloud, Azure, Docker, Heroku, Vercel, Firebase"
        },
        {
            title: "Version Control & DevOps",
            description: "Git, GitHub, BitBucket, GitHub Actions, SonarQube, Unit Testing"
        },
        {
            title: "Data Science & Analytics",
            description: "Data Visualization (D3.js, Matplotlib), Data Mining, Data Modeling, Machine Learning, NumPy, Pandas"
        },
        {
            title: "Project Management",
            description: "Agile, Jira/Kanban, Confluence, Postman"
        },
        {
            title: "Content Management",
            description: "WordPress, iText, Poetry"
        },
        {
            title: "Development Tools",
            description: "VS Code, Postman, SonarQube"
        },
        {
            title: "Soft Skills",
            description: "Strong Written and Verbal Communication, Problem Solving, Software Development, Web Development"
        }
    ];

    const workExperience = [
        {
            title: "Full-Stack Developer, Tata Consultancy Services (IKEA Client Project)",
            description: "Built the microservices powering the IKEA websites, processing millions of transactions annually. Worked on the \"Planner\" tool letting users built their rooms in 3D. Acquired knowledge on corporate tooling, processes and how to work in agile teams."
        },
        {
            title: "Full-Stack Developer, RCKR Software (CPSI/ Trubridge Client Project)",
            description: "Developed secure backend systems for the Unify service, following the FHIR specification, allowing hospitals USA wide to exchange information seamlessly, reducing cost of patient care significantly."
        }
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
            description: "Did digital marketing, search-engine optimisation, acquired skills related to customer and employee management."
        }
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
                            <h2><u>Skills</u></h2>
                            <p className={styles.subtitle}>
                                A person is more than the list of technologies they used to get work done
                            </p>
                            <p className={styles.subtext}>
                                But these are the technologies I am familiar with
                            </p>
                        </div>

                        <div className={styles.skillsGrid}>
                            {skills.map((skill, index) => (
                                <div key={index} className={styles.skillCard}>
                                    <h4>{skill.title}</h4>
                                    <p>{skill.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Experience Section */}
                    <section id="experience" className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2><u>Work Experience</u></h2>
                        </div>

                        <div className={styles.experienceContainer}>
                            <div className={styles.experienceSection}>
                                <h3 className={styles.sectionTitle}>Work History</h3>

                                {workExperience.map((job, index) => (
                                    <div key={index} className={styles.experienceCard}>
                                        <h4>{job.title}</h4>
                                        <p className={styles.experienceDescription}>{job.description}</p>
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
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Certifications Section */}
                    <section id="certifications" className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2><u>Certifications and Workshops</u></h2>
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

                        <div className={styles.portfolioProject}>
                            <h3>Explosion.fun Interactive Website</h3>
                            <p>A creative and interactive portfolio website featuring dynamic visual effects and engaging user experiences. Built with modern web technologies to showcase technical skills through interactive demonstrations.</p>
                            <p>This project aims to demonstrate front-end development capabilities, creative coding, and the ability to create engaging digital experiences that captivate users while maintaining performance and accessibility.</p>
                            <br />
                            <h4>Features:</h4>

                            <ul>
                                <li>Interactive particle systems and animations</li>
                                <li>Next.js framework with App Router
                                    <ul className={styles.subList}>
                                        <li>Server-side rendering (SSR)</li>
                                        <li>Static site generation (SSG)</li>
                                        <li>API routes for backend functionality</li>
                                        <li>File-based routing system</li>
                                        <li>Automatic code splitting</li>
                                    </ul>
                                </li>
                                <li>Responsive design across all devices</li>
                                <li>Dynamic visual effects and transitions</li>
                                <li>Performance optimized animations</li>
                                <li>Modern React.js architecture
                                    <ul className={styles.subList}>
                                        <li>React hooks for state management</li>
                                        <li>Component-based architecture</li>
                                        <li>Custom hooks for reusable logic</li>
                                        <li>Context API for global state</li>
                                    </ul>
                                </li>
                                <li>Creative coding demonstrations</li>
                                <li>Interactive portfolio showcase</li>
                                <li>Clean, modern UI/UX design</li>
                                <li>Mobile-first responsive layout</li>
                                <li>Accessibility considerations</li>
                                <li>Fast loading times and optimization
                                    <ul className={styles.subList}>
                                        <li>Image optimization with Next.js Image component</li>
                                        <li>Lazy loading for performance</li>
                                        <li>Bundle optimization</li>
                                        <li>Core Web Vitals optimization</li>
                                    </ul>
                                </li>
                                <li>Modern deployment and hosting
                                    <ul className={styles.subList}>
                                        <li>Vercel deployment with CI/CD</li>
                                        <li>Automatic builds on Git commits</li>
                                        <li>Edge functions for global performance</li>
                                        <li>Custom domain configuration</li>
                                    </ul>
                                </li>
                                <li>Development best practices
                                    <ul className={styles.subList}>
                                        <li>TypeScript support ready</li>
                                        <li>ESLint and Prettier configuration</li>
                                        <li>Component modularity</li>
                                        <li>CSS Modules for scoped styling</li>
                                    </ul>
                                </li>
                            </ul>

                            <iframe
                                className={styles.portfolioFrame}
                                src="https://explosion.fun/"
                                height="600"
                                width="100%"
                                title="Explosion.fun Interactive Website"
                            />
                        </div>

                        <div className={styles.portfolioProject}>
                            <h3>Natura Bags Website</h3>
                            <p>A modern, responsive website for Natura Bags showcasing their sustainable bag collection. Built with focus on user experience and mobile-first design.</p>
                            <p>This project demonstrates clean design principles and modern web development practices, creating an engaging platform for customers to explore eco-friendly bag options.</p>
                            <br />
                            <h4>Features:</h4>

                            <ul>
                                <li>Responsive design</li>
                                <li>Modern UI/UX with clean aesthetics</li>
                                <li>Product showcase and gallery
                                    <ul className={styles.subList}>
                                        <li>High-quality product imagery</li>
                                        <li>Automatic image optimization to WebP</li>
                                        <li>Product categorization</li>
                                        <li>Interactive product galleries</li>
                                        <li>Product detail pages</li>
                                    </ul>
                                </li>
                                <li>Contact and inquiry forms</li>
                                <li>About us and brand storytelling</li>
                                <li>SEO optimized content</li>
                                <li>Loading speed optimized against PageSpeed Insights</li>
                                <li>Newsletter subscription</li>
                                <li>Sustainability messaging</li>
                            </ul>

                            <iframe
                                className={styles.portfolioFrame}
                                src="https://naturabags.com/"
                                height="600"
                                width="100%"
                                title="Natura Bags Website"
                            />
                        </div>

                        <div className={styles.portfolioProject}>
                            <h3>Serah Design E-Commerce Site</h3>
                            <p>Most features a small scale business may want are already full built and ready to ship in WordPress and it&apos;s vast plugin ecosystem</p>
                            <p>I&apos;ve built this site using WordPress along with WooCommerce and the Jetpack plugin in only a couple of days and it supports functionality far beyond anything I could have build alone in that time frame.</p>
                            <br />
                            <h4>Features:</h4>

                            <ul>
                                <li>Responsive layout for mobile and desktop</li>
                                <li>E-Commerce functionalities with WooCommerce
                                    <ul className={styles.subList}>
                                        <li>Product catalog with search and filtering</li>
                                        <li>Shopping cart management</li>
                                        <li>Inventory tracking</li>
                                        <li>Features to run discount sales</li>
                                        <li>Tax management</li>
                                        <li>Shipping price management</li>
                                        <li>Shipping third party integration</li>
                                        <li>Order management system</li>
                                    </ul>
                                </li>
                                <li>Mobile App to manage inventory and sales</li>
                                <li>Featues to run promotional events</li>
                                <li>Several ways to have analytics on customers</li>
                                <li>Bloggin feature</li>
                                <li>Admin dashboard to manage all aspects of the site</li>
                                <li>User management
                                    <ul className={styles.subList}>
                                        <li>User Authentication</li>
                                        <li>User Authorization</li>
                                        <li>Different privilege structures for different types of users</li>
                                        <li>Data sharing accross applications</li>
                                    </ul>
                                </li>
                                <li>Rest api and GraphQL api support</li>
                                <li>An entire CMS</li>
                                <li>Secure payment gateway integration</li>
                                <li>User account management and order tracking</li>
                                <li>Instagram integration</li>
                                <li>Youtube integration</li>
                                <li>Promotional emails services</li>
                            </ul>

                            <iframe
                                className={styles.portfolioFrame}
                                src="https://serahdesign.com/"
                                height="600"
                                width="100%"
                                title="Serah Design E-Commerce Site"
                            />
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}