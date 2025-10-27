import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Toxic54+ - AI-Powered Toxicity Detection for Rural Ghana',
  description: 'AI-powered toxicity detection platform that helps rural Ghana communities identify mercury poisoning and chemical toxicity from illegal mining in under 60 seconds. Bilingual support in Twi and English with CERSGIS satellite integration.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </body>
    </html>
  )
}
