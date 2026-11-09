'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { IconButton } from '@/components/ui'
import { THEME_STORAGE_KEY } from '@/lib/theme'

type Theme = 'dark' | 'light'


/** Switches between dark (default) and light, persisting the choice. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Storage can be unavailable (private mode); the theme still applies for this visit.
    }
    setTheme(next)
  }

  return <IconButton icon={theme === 'dark' ? Sun : Moon} label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} onClick={toggle} />
}
