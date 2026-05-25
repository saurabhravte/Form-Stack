import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

import { ThemeProvider } from '@/lib/theme-provider';
import { TRPCProvider } from '@/lib/trpc-provider';

import '../styles/globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'FormStack — Build forms people love',
    template: '%s · FormStack',
  },
  description:
    'FormStack is a Typeform-style form builder for surveys, polls, quizzes and registration. ' +
    'Themed forms, real-time analytics, and a public submission flow that works without an account.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'FormStack',
    description: 'Build forms people love.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <TRPCProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'hsl(var(--surface))',
                  color: 'hsl(var(--fg))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius, 0.75rem)',
                },
              }}
            />
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
