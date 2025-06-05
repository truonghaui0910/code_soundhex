import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from "sonner"
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Next.js App with Supabase',
  description: 'A modern web application built with Next.js and Supabase',
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
      <body className={`${inter.className} dark:bg-background dark:text-foreground bg-background text-foreground`} style={{backgroundColor: 'hsl(10 10% 5%)', color: 'hsl(0 0% 95%)'}}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}