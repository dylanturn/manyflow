"use client"

import * as React from "react"
import { Theme } from "@radix-ui/themes"
import "@radix-ui/themes/styles.css"

type ThemeMode = 'light' | 'dark'

interface ThemeContextType {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export function ThemeProvider({ 
  children 
}: { 
  children: React.ReactNode
}) {
  const [mounted, setMounted] = React.useState(false)
  const [theme, setTheme] = React.useState<ThemeMode>('light') // Start with light theme

  React.useEffect(() => {
    // Only run this after component is mounted to avoid hydration mismatch
    const savedTheme = localStorage.getItem('theme') as ThemeMode
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (mounted) {
      localStorage.setItem('theme', theme)
      // Update document attributes if needed
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [theme, mounted])

  const value = React.useMemo(() => ({
    theme,
    setTheme,
  }), [theme])

  // Render a blank div until mounted to avoid hydration mismatch
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>
  }

  return (
    <ThemeContext.Provider value={value}>
      <Theme appearance={theme} accentColor="violet" grayColor="slate" scaling="100%">
        {children}
      </Theme>
    </ThemeContext.Provider>
  )
}
