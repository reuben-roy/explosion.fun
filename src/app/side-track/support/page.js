import PageHero from '@/components/site/PageHero';
import styles from '../legal.module.css';

export const metadata = {
    title: 'Support | Side-Track',
    description: 'Get help and support for the Side-Track app.',
};

export default function SupportPage() {
    return (
        <div className="ef-page-in">
            <PageHero
                eyebrow="Side-Track"
                title="Support"
                description="Need help with the app, found a bug, or want a feature? There is a human at the other end of this address."
                art="dots"
                compact
                actions={
                    <a href="mailto:contact@cms.explosion.fun" className="ef-btn ef-btn--primary">
                        contact@cms.explosion.fun
                    </a>
                }
            />

            <section className="ef-section">
                <div className="ef-wrap">
                <div className={styles.content}>
                    <section className={styles.section}>
                        <h2>Need Help?</h2>
                        <p>
                            We&apos;re here to help you get the most out of Side-Track. Whether you have 
                            questions, feedback, or need assistance, don&apos;t hesitate to reach out.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>Contact Us</h2>
                        <p>
                            For any questions, bug reports, or feature requests, please email us at:
                        </p>
                        <p className={styles.contactEmail}>
                            <a href="mailto:contact@cms.explosion.fun">contact@cms.explosion.fun</a>
                        </p>
                        <p>
                            We typically respond within 24-48 hours.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>Frequently Asked Questions</h2>
                        
                        <div className={styles.faq}>
                            <h3>Where is my data stored?</h3>
                            <p>
                                All your data is stored locally on your device. We do not collect 
                                or store any of your personal information on external servers.
                            </p>
                        </div>

                        <div className={styles.faq}>
                            <h3>Will I lose my data if I delete the app?</h3>
                            <p>
                                Yes, since all data is stored locally on your device, deleting the 
                                app will permanently remove all your tasks and settings.
                            </p>
                        </div>

                        <div className={styles.faq}>
                            <h3>Is Side-Track free to use?</h3>
                            <p>
                                Please check the App Store or Google Play Store listing for the 
                                most up-to-date pricing information.
                            </p>
                        </div>

                        <div className={styles.faq}>
                            <h3>How do I report a bug?</h3>
                            <p>
                                Please send an email to contact@cms.explosion.fun with a description 
                                of the issue, your device model, and OS version. Screenshots are 
                                helpful too!
                            </p>
                        </div>

                        <div className={styles.faq}>
                            <h3>Can I request a new feature?</h3>
                            <p>
                                Absolutely! We love hearing from our users. Send us an email with 
                                your feature idea and we&apos;ll consider it for future updates.
                            </p>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h2>App Information</h2>
                        <p>
                            <strong>Developer:</strong> Reuben Roy
                        </p>
                        <p>
                            <strong>Website:</strong>{' '}
                            <a href="https://explosion.fun/side-track" target="_blank" rel="noopener noreferrer">
                                explosion.fun/side-track
                            </a>
                        </p>
                    </section>
                </div>
                </div>
            </section>
        </div>
    );
}
