import './globals.css';
import type { Metadata } from 'next';
import { Inter, Space_Grotesk, Space_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', weight: ['400', '500', '600', '700'] });
const spaceMono = Space_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '700'] });

export const metadata: Metadata = {
  title: 'Club Stores - Tiendas para Clubes Deportivos',
  description: 'Plataforma de tiendas online para clubes deportivos con productos fabricados bajo demanda',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${spaceMono.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
