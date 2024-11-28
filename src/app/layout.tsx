import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import { Navigation } from '@/components/Navigation'
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { WalletConnection } from '@/components/wallet-connection'
import { WalletContextProvider } from '@/components/WalletContextProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Bunny Sol Bot',
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
          <WalletContextProvider>
            <div className="flex flex-col min-h-screen">
              <header className="border-b">
                <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                  <Navigation />
                  <WalletConnection />
                </div>
              </header>
              <main className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
            </div>
            <Toaster />
          </WalletContextProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}