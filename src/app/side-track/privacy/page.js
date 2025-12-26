import Navbar from '@/components/Navbar';
import styles from '../legal.module.css';

export const metadata = {
    title: 'Privacy Policy | Side-Track',
    description: 'Privacy Policy for the Side-Track app.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className={styles.page}>
            <Navbar />
            <main className={styles.main}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Privacy Policy</h1>
                    <p className={styles.subtitle}>Side-Track App</p>
                    <p className={styles.lastUpdated}>Last Updated: December 25, 2025</p>
                </header>

                <div className={styles.content}>
                    <section className={styles.section}>
                        <h2>Introduction</h2>
                        <p>
                            Side-Track (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. 
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                            information when you use our mobile application Side-Track (the &quot;App&quot;).
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>Information We Collect</h2>
                        
                        <h3>Personal Information</h3>
                        <ul>
                            <li><strong>Account Information:</strong> When you create an account, we collect your email address and authentication credentials (handled securely through Apple Sign In or other authentication providers).</li>
                            <li><strong>Profile Information:</strong> You may choose to provide information such as bodyweight, height, gender (for Wilks score calculation), and username (optional, auto-generated if not provided).</li>
                        </ul>

                        <h3>Workout Data</h3>
                        <ul>
                            <li>Exercise logs (exercise type, weight, reps, sets)</li>
                            <li>Workout dates and times</li>
                            <li>Personal records and achievements</li>
                            <li>Exercise capacity limits (1RM estimates)</li>
                        </ul>

                        <h3>Health Data (Optional)</h3>
                        <p>If you enable Apple Health integration, we may read and write:</p>
                        <ul>
                            <li>Workout data</li>
                            <li>Calories burned</li>
                            <li>Fitness metrics</li>
                        </ul>
                        <p>This integration is completely optional and requires your explicit permission.</p>

                        <h3>Location Data (Optional)</h3>
                        <p>If you choose to enable location sharing for local leaderboard rankings, we collect:</p>
                        <ul>
                            <li>Country</li>
                            <li>City/Region (approximate)</li>
                        </ul>
                        <p>Location sharing is optional and can be disabled at any time in settings.</p>

                        <h3>Usage Data</h3>
                        <ul>
                            <li>App usage statistics</li>
                            <li>Crash reports and error logs</li>
                            <li>Device information (device type, OS version)</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>How We Use Your Information</h2>
                        <p>We use the information we collect to:</p>
                        
                        <h3>Provide Core Services</h3>
                        <ul>
                            <li>Track and store your workout data</li>
                            <li>Calculate statistics, streaks, and personal records</li>
                            <li>Display your progress and achievements</li>
                        </ul>

                        <h3>Leaderboard Features</h3>
                        <ul>
                            <li>Rank you on global and local leaderboards</li>
                            <li>Calculate strength scores (total weight, Wilks score)</li>
                            <li>Show your position relative to other users</li>
                        </ul>

                        <h3>Health Integration</h3>
                        <ul>
                            <li>Sync workout data to Apple Health (if enabled)</li>
                            <li>Read health metrics for enhanced tracking</li>
                        </ul>

                        <h3>Improve the App</h3>
                        <ul>
                            <li>Analyze usage patterns to improve features</li>
                            <li>Fix bugs and technical issues</li>
                            <li>Develop new features</li>
                        </ul>

                        <h3>Communication</h3>
                        <ul>
                            <li>Send important app updates and notifications</li>
                            <li>Respond to support requests</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>Data Storage and Security</h2>
                        <ul>
                            <li><strong>Cloud Storage:</strong> Your workout data is stored securely in the cloud using Supabase, which provides enterprise-grade security and encryption.</li>
                            <li><strong>Local Storage:</strong> Some data is cached locally on your device for offline access.</li>
                            <li><strong>Encryption:</strong> All data transmitted between the app and our servers is encrypted using HTTPS/TLS.</li>
                            <li><strong>Access Control:</strong> Your account is protected by secure authentication. Only you can access your personal data.</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>Data Sharing and Disclosure</h2>
                        <p>We do NOT sell your personal information. We may share data in the following limited circumstances:</p>
                        <ul>
                            <li><strong>Leaderboard Rankings:</strong> Your username (or generated username), strength scores, and location (if enabled) are displayed on public leaderboards. This is necessary for the leaderboard feature to function.</li>
                            <li><strong>Service Providers:</strong> We use third-party services including Supabase (for database and authentication services) and Apple (for authentication and Health integration). These services are bound by strict privacy agreements.</li>
                            <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety.</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>Your Rights and Choices</h2>
                        <p>You have the right to:</p>
                        <ul>
                            <li><strong>Access:</strong> View all your personal data stored in the app</li>
                            <li><strong>Modify:</strong> Update your profile information and preferences</li>
                            <li><strong>Delete:</strong> Delete your account and all associated data</li>
                            <li><strong>Export:</strong> Export your workout data (available in app settings)</li>
                            <li><strong>Opt-Out:</strong> Disable location sharing or health integration at any time</li>
                            <li><strong>Privacy Controls:</strong> Control what information appears on leaderboards</li>
                        </ul>

                        <h3>How to Exercise Your Rights</h3>
                        <ul>
                            <li><strong>Delete Account:</strong> Go to Settings → Data Management → Delete Account</li>
                            <li><strong>Export Data:</strong> Go to Settings → Data Management → Export Data</li>
                            <li><strong>Disable Location:</strong> Go to Settings → Preferences → Disable location sharing</li>
                            <li><strong>Disable Health Sync:</strong> Go to Settings → Health Integration → Disable sync</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>Children&apos;s Privacy</h2>
                        <p>
                            Side-Track is not intended for children under the age of 13. We do not knowingly 
                            collect personal information from children under 13. If you believe we have 
                            collected information from a child under 13, please contact us immediately.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>International Data Transfers</h2>
                        <p>
                            Your data may be stored and processed in servers located outside your country of 
                            residence. We ensure appropriate safeguards are in place to protect your data in 
                            accordance with this Privacy Policy.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>Data Retention</h2>
                        <ul>
                            <li><strong>Active Accounts:</strong> We retain your data as long as your account is active.</li>
                            <li><strong>Deleted Accounts:</strong> When you delete your account, we permanently delete your personal data within 30 days, except where we are required to retain it by law.</li>
                            <li><strong>Backup Data:</strong> Deleted data may remain in backups for up to 90 days before permanent deletion.</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>Third-Party Services</h2>
                        
                        <h3>Supabase</h3>
                        <ul>
                            <li><strong>Purpose:</strong> Database and authentication services</li>
                            <li><strong>Privacy Policy:</strong> <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">https://supabase.com/privacy</a></li>
                        </ul>

                        <h3>Apple Services</h3>
                        <ul>
                            <li><strong>Apple Sign In:</strong> Handled by Apple, subject to Apple&apos;s Privacy Policy</li>
                            <li><strong>Apple Health:</strong> Data syncing is controlled by you through iOS permissions</li>
                            <li><strong>Privacy Policy:</strong> <a href="https://www.apple.com/privacy/" target="_blank" rel="noopener noreferrer">https://www.apple.com/privacy/</a></li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>Changes to This Privacy Policy</h2>
                        <p>We may update this Privacy Policy from time to time. We will notify you of any changes by:</p>
                        <ul>
                            <li>Posting the new Privacy Policy in the app</li>
                            <li>Updating the &quot;Last Updated&quot; date</li>
                            <li>Sending a notification (for significant changes)</li>
                        </ul>
                        <p>Your continued use of the app after changes constitutes acceptance of the updated policy.</p>
                    </section>

                    <section className={styles.section}>
                        <h2>Contact Us</h2>
                        <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
                        <p className={styles.contactEmail}>
                            <strong>Email:</strong> <a href="mailto:contact@cms.explosion.fun">contact@cms.explosion.fun</a>
                        </p>
                        <p><strong>Website:</strong> <a href="https://explosion.fun/side-track" target="_blank" rel="noopener noreferrer">explosion.fun/side-track</a></p>
                    </section>

                    <section className={styles.section}>
                        <h2>California Privacy Rights (CCPA)</h2>
                        <p>If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):</p>
                        <ul>
                            <li>Right to know what personal information is collected</li>
                            <li>Right to delete personal information</li>
                            <li>Right to opt-out of sale of personal information (we do not sell your data)</li>
                            <li>Right to non-discrimination for exercising your privacy rights</li>
                        </ul>
                        <p>To exercise these rights, contact us using the information above.</p>
                    </section>

                    <section className={styles.section}>
                        <h2>European Privacy Rights (GDPR)</h2>
                        <p>If you are located in the European Economic Area (EEA), you have additional rights:</p>
                        <ul>
                            <li>Right to access your personal data</li>
                            <li>Right to rectification (correction)</li>
                            <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
                            <li>Right to restrict processing</li>
                            <li>Right to data portability</li>
                            <li>Right to object to processing</li>
                        </ul>
                        <p>To exercise these rights, contact us using the information above.</p>
                    </section>
                </div>
            </main>
        </div>
    );
}
