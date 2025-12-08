import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from '@/components/providers';
import { cookies } from 'next/headers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'Pholio.Links | The Ultimate Link in Bio & Digital Business Card',
    template: '%s | Pholio.Links'
  },
  description: 'Create a stunning link in bio, digital business card, and portfolio in minutes. The best Linktree alternative for creators, professionals, and businesses.',
  keywords: ['link in bio', 'digital business card', 'portfolio builder', 'creator tools', 'social media links', 'linktree alternative', 'beacons alternative'],
  authors: [{ name: 'CritterCodes' }],
  creator: 'CritterCodes',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pholio.links',
    title: 'Pholio.Links | The Ultimate Link in Bio & Digital Business Card',
    description: 'One link for everything. Share your profile, business card, and portfolio with a single URL.',
    siteName: 'Pholio.Links',
    images: [
      {
        url: '/og-image.png', // We should ensure this exists or use a placeholder
        width: 1200,
        height: 630,
        alt: 'Pholio.Links Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pholio.Links | The Ultimate Link in Bio',
    description: 'One link for everything. Share your profile, business card, and portfolio with a single URL.',
    images: ['/og-image.png'],
    creator: '@CritterCodes',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Force dynamic rendering so middleware can execute on all requests
export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const debugCookie = cookieStore.get('debug-custom-domain');
  const hostnameCookie = cookieStore.get('debug-hostname');

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {(debugCookie || hostnameCookie) && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                console.group("%c[Middleware Debug]", "background: #222; color: #bada55; font-size: 12px; padding: 2px; border-radius: 2px;");
                console.log("Hostname:", "${hostnameCookie?.value || 'unknown'}");
                console.log("Status:", "${debugCookie?.value || 'no status'}");
                console.groupEnd();
              `
            }}
          />
        )}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
