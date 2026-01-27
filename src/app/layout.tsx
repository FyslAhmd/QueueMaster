import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Smart Appointment & Queue Manager',
  description: 'Manage service appointments, staff availability, and customer queues with conflict handling.',
  keywords: ['appointment', 'queue', 'scheduling', 'staff management', 'booking'],
  authors: [{ name: 'Smart Queue Manager' }],
  openGraph: {
    title: 'Smart Appointment & Queue Manager',
    description: 'Efficient scheduling and queue management system',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
