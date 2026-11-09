import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import type { ReactNode } from 'react'
import { css } from 'styled-system/css'
import { AppHeader } from '@/components/layout/AppHeader'
import { THEME_STORAGE_KEY } from '@/components/layout/ThemeToggle'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'SupportDesk', template: '%s · SupportDesk' },
  description: 'Register and manage customer support tickets.',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    { media: '(prefers-color-scheme: light)', color: '#f6f6f6' },
  ],
}

// Applies the saved theme before first paint, so light-mode users never see a dark flash.
const themeScript = `try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`

const main = css({ maxW: 'content', mx: 'auto', px: '4', py: { base: '6', md: '10' }, display: 'flex', flexDirection: 'column', gap: '6' })

/**
 * Root layout. `drawer` is a parallel route slot: in-app links to a ticket, the new-ticket
 * form or the edit form are intercepted there and open as a drawer over the current page.
 */
export default function RootLayout({ children, drawer }: { children: ReactNode; drawer: ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>
          <AppHeader />
          <main className={main}>{children}</main>
          {drawer}
        </Providers>
      </body>
    </html>
  )
}
