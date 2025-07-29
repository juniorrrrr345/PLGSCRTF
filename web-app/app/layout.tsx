import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import ScrollIndicator from '@/components/ScrollIndicator'
import BackgroundProvider from '@/components/BackgroundProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PLUGS CRTFS - Marketplace des vendeurs certifiés',
  description: 'La plateforme exclusive pour trouver des vendeurs certifiés et de confiance',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-dark text-white min-h-screen`}>
        <BackgroundProvider>
          <Navbar />
          <main className="relative min-h-screen">
            {children}
          </main>
          <ScrollIndicator />
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
            }}
          />
        </BackgroundProvider>
      </body>
    </html>
  )
}