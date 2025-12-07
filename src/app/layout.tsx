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
  title: 'Pholio.Links - Your Link in Bio',
  description: 'Create your personalized link in bio page with Pholio.Links',
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
