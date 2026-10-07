import type { Metadata } from 'next';
import { Inter, IBM_Plex_Mono, Lora } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sign in — PayWise',
  description: 'Vendor payment requests, approvals and tracking for ImaraWorks.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable} ${ibmPlexMono.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased text-ink bg-canvas">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
