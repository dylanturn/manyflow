import { Inter } from 'next/font/google'
import Link from "next/link"
import "./globals.css"
import { Providers } from '@/components/providers'
import { Toaster } from 'sonner'

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
          <div className="flex min-h-screen flex-col">
            <header className="border-b">
              <div className="container flex h-14 items-center">
                <nav className="flex items-center space-x-6 text-sm font-medium">
                  <Link href="/" className="transition-colors hover:text-foreground/80">
                    Home
                  </Link>
                  <Link href="/dags" className="transition-colors hover:text-foreground/80">
                    DAGs
                  </Link>
                  <Link href="/admin" className="transition-colors hover:text-foreground/80">
                    Admin
                  </Link>
                </nav>
              </div>
            </header>
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
