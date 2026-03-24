'use client'

import * as React from 'react'

type Theme = 'light' | 'dark'

const ThemeProviderContext = React.createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
}>({
  theme: 'light',
  setTheme: () => null,
})

export function ThemeProvider({
  children,
  defaultTheme = 'light',
}: {
  children: React.ReactNode
  defaultTheme?: Theme
}) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme)

  React.useEffect(() => {
    const root = window.document.documentElement
    root.setAttribute('data-theme', theme)
  }, [theme])

  React.useEffect(() => {
    // Check local storage or system preference
    const stored = localStorage.getItem('her-quest-theme') as Theme | null
    if (stored) {
      setTheme(stored)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
    }
  }, [])

  const value = React.useMemo(
    () => ({
      theme,
      setTheme: (theme: Theme) => {
        localStorage.setItem('her-quest-theme', theme)
        setTheme(theme)
      },
    }),
    [theme]
  )

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
