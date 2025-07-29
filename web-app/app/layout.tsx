import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Telegram Shop - Boutique',
  description: 'Boutique Telegram avec système de plugs',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: '#2c2c2e',
              color: '#fff',
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}