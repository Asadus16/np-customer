import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { StoreProvider } from '@/store/provider';
import { ConditionalLayout } from '@/components/layout';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const roobertPro = localFont({
  src: '../../public/fonts/RoobertPRO.ttf',
  variable: '--font-roobert',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NP Customer - Book Professional Services',
  description: 'Book professional services from trusted vendors in your area',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${roobertPro.variable} font-sans antialiased`} suppressHydrationWarning>
        <StoreProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </StoreProvider>
      </body>
    </html>
  );
}
