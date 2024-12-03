import { Inter } from 'next/font/google'
import "./globals.css"
import { Providers } from '@/components/providers'
import { Toaster } from 'sonner'
import { Navigation } from '@/components/layout/navigation'

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
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <div className="hidden border-r bg-background md:block md:w-64">
              <div className="flex h-full flex-col">
                <div className="border-b px-6 py-4">
                  <h2 className="text-lg font-semibold">ManyFlow</h2>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  <Navigation />
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex flex-1 flex-col">
              <main className="flex-1">
                {children}
              </main>
            </div>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
