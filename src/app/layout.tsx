import { Inter } from 'next/font/google'
import "./globals.css"
import { Providers } from '@/components/providers'
import { Sidebar } from '@/components/layout/sidebar'
import { Flex, Box } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import { Toaster } from '@/components/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ManyFlow - Airflow Management System',
  description: 'A tool for managing multiple Airflow clusters',
}

export default function RootLayout({
  children,
}: {  
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Flex>
            <Sidebar />
            {/* Main content */}
            <Box className="flex-1">
              <main>
                {children}
              </main>
            </Box>
          </Flex>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
