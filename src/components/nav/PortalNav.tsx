'use client'

import Link from 'next/link'
import { useTheme } from '@/components/theme/ThemeProvider'

export function PortalNav({ userFirstName }: { userFirstName?: string }) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="border-b border-stone-200 bg-[var(--surface)] sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/dashboard" className="font-cormorant text-2xl italic tracking-wide text-[var(--gold)]">
          Her Quest Platform
        </Link>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-stone-400 hover:text-[var(--text)] transition-colors p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
            aria-label="Toggle Dark Mode"
          >
            {theme === 'dark' ? '☼' : '☾'}
          </button>

          <Link href="/profile" className="flex items-center gap-3">
            <span className="text-sm font-jost text-stone-500 uppercase tracking-widest hidden sm:block">
              Welcome, {userFirstName || 'User'}
            </span>
            <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-jost uppercase shadow-sm">
              {(userFirstName || 'U')[0]}
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
