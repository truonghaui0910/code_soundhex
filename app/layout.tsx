import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from "sonner"
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SoundHex - Music Platform',
  description: 'Discover, stream, and upload music for free on SoundHex',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={`${inter.className} dark:bg-background dark:text-foreground bg-background text-foreground`} style={{backgroundColor: 'hsl(220 15% 12%)', color: 'hsl(0 0% 85%)'}}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}