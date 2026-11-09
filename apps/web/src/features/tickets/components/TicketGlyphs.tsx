import type { TicketPriority, TicketStatus } from '@cielo/contracts'
import { css } from 'styled-system/css'
import { PRIORITY_META, STATUS_META } from '../presentation'

const statusColor: Record<TicketStatus, string> = {
  open: css({ color: 'info.default' }),
  in_progress: css({ color: 'warning.default' }),
  resolved: css({ color: 'success.default' }),
}

/**
 * Status glyph: an empty ring (open), a half-filled ring (in progress) or a filled
 * check (resolved), so the state reads from shape as well as colour.
 */
export function StatusIcon({ status, size = 14, decorative = false }: { status: TicketStatus; size?: number; decorative?: boolean }) {
  // Decorative when the status name is already written next to it.
  const a11y = decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': STATUS_META[status].label }
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" className={statusColor[status]} {...a11y}>
      {status === 'resolved' ? (
        <>
          <circle cx="7" cy="7" r="6.5" fill="currentColor" />
          <path d="M4.2 7.2l1.9 1.9 3.7-3.9" fill="none" stroke="var(--colors-bg-app)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <circle cx="7" cy="7" r="5.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
          {status === 'in_progress' && <path d="M7 3.5a3.5 3.5 0 0 1 0 7z" fill="currentColor" />}
        </>
      )}
    </svg>
  )
}

const LEVEL: Record<TicketPriority, number> = { low: 1, medium: 2, high: 3 }
const bars = css({ color: 'fg.subtle', '&[data-priority=high]': { color: 'danger.default' }, '&[data-priority=medium]': { color: 'fg.default' } })

/** Priority as signal bars (1–3 filled), the convention used by issue trackers. */
export function PriorityIcon({ priority, size = 14 }: { priority: TicketPriority; size?: number }) {
  const level = LEVEL[priority]
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" className={bars} data-priority={priority} role="img" aria-label={`${PRIORITY_META[priority].label} priority`}>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={1.5 + i * 4} y={9 - i * 3} width="3" height={4 + i * 3} rx="1" fill="currentColor" opacity={i < level ? 1 : 0.25} />
      ))}
    </svg>
  )
}
