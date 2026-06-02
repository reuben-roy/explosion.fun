import AuthProvider from '@/components/greatness/AuthProvider';
import GreatnessNav from '@/components/greatness/GreatnessNav';

export const metadata = {
  title: 'Greatness | explosion.fun',
  description: 'Define your Self-Actualization goals, upload your browsing data, and rank on the Greatness leaderboard.',
};

export default function GreatnessLayout({ children }) {
  return (
    <AuthProvider>
      <GreatnessNav />
      {children}
    </AuthProvider>
  );
}
