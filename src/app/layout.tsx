import type { Metadata } from 'next';
import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { I18nProvider } from '@/components/providers/I18nProvider';
import { BackToTop } from '@/components/layout/BackToTop';
import { PwaRegister } from '@/components/layout/PwaRegister';
import './globals.css';

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display' });
const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Udaya Cricket Club — 25 Years on the Ground',
  description: 'Player profiles, match stories, gallery, sponsors — Udaya CC Chennai.',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${mono.variable}`}>
      <body>
        <I18nProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <BackToTop />
          <PwaRegister />
        </I18nProvider>
      </body>
    </html>
  );
}
