import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'AI Video Studio',
    template: '%s — AI Video Studio',
  },
  description:
    'Edita vídeos de YouTube con inteligencia artificial. Detecta momentos importantes, genera clips virales y exporta con calidad profesional.',
  keywords: ['edición de vídeo', 'inteligencia artificial', 'YouTube', 'clips virales', 'IA'],
}

export const viewport: Viewport = {
  themeColor: '#09090b',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full bg-[#09090b] text-zinc-50">{children}</body>
    </html>
  )
}
