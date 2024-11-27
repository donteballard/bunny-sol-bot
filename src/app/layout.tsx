import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import { Navigation } from '@/components/Navigation'
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Solana Trading Bot',
  description: 'Automated trading bot for Solana-based tokens',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Navigation />
          <main className="min-h-screen bg-background p-4">
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}