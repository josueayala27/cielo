import type { ReactNode } from 'react'
import { cva } from 'styled-system/css'

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent'

// Text stays `fg.default` for contrast in both themes; the tone shows in the tint and the dot.
const badge = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1.5',
    flexShrink: 0,
    maxW: 'full',
    h: 'control.sm',
    px: '2',
    borderRadius: 'full',
    color: 'fg.default',
    whiteSpace: 'nowrap',
    textStyle: 'ui.sm',
    '& [data-part=dot]': { w: '1.5', h: '1.5', borderRadius: 'full', flexShrink: 0 },
  },
  variants: {
    tone: {
      neutral: { bg: 'bg.subtle', '& [data-part=dot]': { bg: 'fg.subtle' } },
      success: { bg: 'success.muted', '& [data-part=dot]': { bg: 'success.default' } },
      warning: { bg: 'warning.muted', '& [data-part=dot]': { bg: 'warning.default' } },
      danger: { bg: 'danger.muted', '& [data-part=dot]': { bg: 'danger.default' } },
      info: { bg: 'info.muted', '& [data-part=dot]': { bg: 'info.default' } },
      accent: { bg: 'accent.soft', '& [data-part=dot]': { bg: 'accent.default' } },
    },
  },
  defaultVariants: { tone: 'neutral' },
})

/** Compact pill with a tone-coloured dot, for statuses and priorities. */
export function Badge({ tone, children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={badge({ tone })} data-tone={tone}>
      <span data-part="dot" aria-hidden />
      {children}
    </span>
  )
}
