import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'সাইমুম শিল্পীগোষ্ঠী — কেন্দ্রীয় একাডেমি | Saimum Cultural Academy',
  description: 'সুস্থ সংস্কৃতি চর্চা ও আদর্শ জাতি গঠনে নিবেদিত দেশের শীর্ষস্থানীয় সাংস্কৃতিক একাডেমি। অনলাইন ও অফলাইন ভর্তি কার্যক্রম চলমান।',
  keywords: 'Saimum, Saimum Academy, Cultural Academy, Music, Drama, Acting, Recitation, Admission, Bangladesh',
  openGraph: {
    title: 'সাইমুম শিল্পীগোষ্ঠী — কেন্দ্রীয় একাডেমি | Saimum Academy',
    description: 'সংগীত, অভিনয়, আবৃত্তি ও চিত্রাঙ্কনে ভবিষ্যৎ প্রজন্মের সাংস্কৃতিক বিকাশ। নতুন ভর্তি সেশন শুরু হয়েছে!',
    url: 'https://saimumacademy.org',
    siteName: 'Saimum Central Academy',
    locale: 'bn_BD',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
