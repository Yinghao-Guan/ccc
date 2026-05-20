import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Spectral } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const spectral = Spectral({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-spectral',
  display: 'swap',
})

export const viewport: Viewport = { themeColor: '#7B2121' }

export const metadata: Metadata = {
  metadataBase: new URL('https://ccc.peterguan.com'),
  title: 'Chinese Culture Club — Santa Monica College',
  description:
    'Chinese Culture Club at Santa Monica College — a student society devoted to Chinese culture through tea ceremonies, calligraphy, Lunar New Year, and community open to everyone.',
  authors: [{ name: 'Chinese Culture Club at Santa Monica College' }],
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    title: 'Chinese Culture Club — Santa Monica College',
    description:
      'A student society at SMC devoted to Chinese culture — tea ceremonies, calligraphy, Lunar New Year, and a community open to everyone.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'Chinese Culture Club — Santa Monica College',
    description:
      'A student society at SMC devoted to Chinese culture — tea ceremonies, calligraphy, Lunar New Year, and a community open to everyone.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${spectral.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
