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
            title: "`Pro`ject Management",
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
                            <h3>Natura Bags Website</h3>
                            <iframe
                                className={styles.portfolioFrame}
                                src="https://naturabags.com/"
                                height="600"
                                width="100%"
                                title="Natura Bags Website"
                            />
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}