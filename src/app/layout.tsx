import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Shell } from '@/components/layout/Shell'
import { Rajdhani, Space_Grotesk } from 'next/font/google'

const rajdhani = Rajdhani({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-rajdhani',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'TERRA | Disaster Intelligence',
  description: 'Modern disaster intelligence and prediction platform.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${rajdhani.variable} ${spaceGrotesk.variable} dark`}>
      <body className="font-body bg-background text-foreground overflow-hidden">
        <Shell>{children}</Shell>
        <Toaster />
      </body>
    </html>
  )
}
