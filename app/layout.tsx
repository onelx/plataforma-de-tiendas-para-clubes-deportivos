import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'IdeaForge Club Stores',
    template: '%s | IdeaForge',
  },
  description: 'Plataforma de tiendas online para clubes deportivos con productos bajo demanda',
  keywords: ['tienda', 'club deportivo', 'merchandising', 'ropa deportiva', 'personalizado'],
  authors: [{ name: 'IdeaForge' }],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'IdeaForge Club Stores',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
