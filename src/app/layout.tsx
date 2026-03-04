// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { LanguageProvider } from '@/context/language-context'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Valsys | Hyper-Kinetic Engineering',
  description:
    'We build flawless software. Elite engineering for the next generation of digital products. Full-stack, AI, and platform infrastructure.',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  other: {
    'google': 'notranslate',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" translate="no" className={`${inter.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Toaster theme="dark" position="bottom-right" richColors />
        <Analytics />
      </body>
    </html>
  )
}