
import type { Metadata } from 'next'
import './globals.css'
import { SidebarNav } from '@/components/layout/SidebarNav'
import { Header } from '@/components/layout/Header'
import { Toaster } from '@/components/ui/toaster'
import { SidebarProvider } from '@/components/ui/sidebar'
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
        <SidebarProvider>
          <div className="flex h-screen w-full">
            <SidebarNav />
            <div className="flex-1 flex flex-col min-w-0">
              <Header />
              <main className="flex-1 overflow-auto p-6">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  )
}
