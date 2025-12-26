import Navbar from '@/components/Navbar';
import styles from '../legal.module.css';

export const metadata = {
    title: 'Terms of Service | Side-Track',
    description: 'Terms of Service for the Side-Track app.',
};

export default function TermsOfServicePage() {
    return (
        <div className={styles.page}>
            <Navbar />
            <main className={styles.main}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Terms of Service</h1>
                    <p className={styles.subtitle}>Side-Track App</p>
                    <p className={styles.lastUpdated}>Last Updated: December 25, 2024</p>
                </header>

                <div className={styles.content}>
                    <section className={styles.section}>
                        <h2>1. Acceptance of Terms</h2>
                        <p>
                            By downloading, installing, or using the Side-Track application (&quot;App&quot;), 
                            you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not 
                            agree to these Terms, please do not use the App.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>2. Description of Service</h2>
                        <p>
                            Side-Track is a productivity application designed to help users manage 
                            tasks and stay organized. The App stores all data locally on your device.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>3. Use License</h2>
                        <p>
                            We grant you a limited, non-exclusive, non-transferable, revocable license 
                            to use the App for your personal, non-commercial purposes subject to these Terms.
                        </p>
                        <p>You agree not to:</p>
                        <ul>
                            <li>Modify, reverse engineer, or decompile the App</li>
                            <li>Use the App for any unlawful purpose</li>
                            <li>Attempt to gain unauthorized access to the App&apos;s systems</li>
                            <li>Distribute, sublicense, or transfer the App to others</li>
                            <li>Remove any copyright or proprietary notices from the App</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>4. User Data</h2>
                        <p>
                            All data you create within the App is stored locally on your device. 
                            You are responsible for maintaining backups of your data. We are not 
                            responsible for any loss of data due to device failure, app deletion, 
                            or other circumstances.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>5. Intellectual Property</h2>
                        <p>
                            The App, including its design, features, and content, is owned by 
                            Explosion.fun and is protected by intellectual property laws. You may 
                            not copy, modify, or create derivative works based on the App.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>6. Disclaimer of Warranties</h2>
                        <p>
                            The App is provided &quot;as is&quot; and &quot;as available&quot; without warranties of 
                            any kind, either express or implied. We do not guarantee that the App 
                            will be error-free, secure, or uninterrupted.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>7. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, we shall not be liable for any 
                            indirect, incidental, special, consequential, or punitive damages arising 
                            from your use of the App.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>8. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these Terms at any time. Changes will be 
                            effective immediately upon posting. Your continued use of the App after 
                            any changes constitutes acceptance of the new Terms.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>9. Termination</h2>
                        <p>
                            We may terminate or suspend your access to the App at any time, without 
                            prior notice, for conduct that we believe violates these Terms or is 
                            harmful to other users or us.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>10. Contact Information</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at:
                        </p>
                        <p className={styles.contactEmail}>
                            <a href="mailto:contact@cms.explosion.fun">contact@cms.explosion.fun</a>
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
