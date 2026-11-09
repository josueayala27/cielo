'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { css } from 'styled-system/css'
import { Drawer } from '@/components/ui'
import { BackLink } from './BackLink'
import { PageHeader } from './PageHeader'

/**
 * How a view is shown: as a full page (direct URL, refresh) or as a drawer over the
 * dashboard (in-app navigation, through an intercepting route).
 */
export type Presentation = 'page' | 'drawer'

const description = css({ textStyle: 'body.sm', color: 'fg.muted' })

interface ViewFrameProps {
  presentation: Presentation
  /** Plain-text title: drawer header and page heading. */
  title: string
  /** Rich heading for the page variant (e.g. a skeleton); defaults to `title`. */
  heading?: ReactNode
  description?: ReactNode
  /** Where the page variant's back link goes. */
  back: { href: string; label: string }
  actions?: ReactNode
  children: ReactNode
}

/** Wraps a view in the page chrome (title, back link) or in a {@link Drawer}. */
export function ViewFrame({ presentation, title, heading, description: text, back, actions, children }: ViewFrameProps) {
  const router = useRouter()

  if (presentation === 'drawer') {
    return (
      <Drawer title={title} onClose={() => router.back()} actions={actions}>
        {text && <p className={description}>{text}</p>}
        {children}
      </Drawer>
    )
  }

  return (
    <>
      <PageHeader eyebrow={<BackLink href={back.href}>{back.label}</BackLink>} title={heading ?? title} description={text} actions={actions} />
      {children}
    </>
  )
}

/**
 * Navigation that depends on the presentation: a drawer closes by going back to
 * whatever it was opened over; a page goes to `fallback`.
 */
export function useLeaveView(presentation: Presentation) {
  const router = useRouter()
  return (fallback: string) => (presentation === 'drawer' ? router.back() : router.push(fallback))
}
