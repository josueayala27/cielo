'use client'

import { TICKET_STATUSES, type Ticket, type TicketStatus } from '@cielo/contracts'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { css } from 'styled-system/css'
import { IconButton, Skeleton, SkeletonText } from '@/components/ui'
import { formatDate } from '@/lib/format'
import { STATUS_META } from '../presentation'
import { PriorityBadge } from './TicketBadges'

const card = css({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  p: '3',
  bg: 'bg.panel',
  borderRadius: 'md',
  boxShadow: 'card',
  cursor: 'grab',
  transitionProperty: 'box-shadow, opacity, background',
  transitionDuration: 'fast',
  _hover: { bg: 'bg.elevated' },
  '&[data-dragging=true]': { opacity: 0.4 },
  '&[data-pending=true]': { opacity: 0.6, cursor: 'progress' },
  '&:hover [data-part=move], &:focus-within [data-part=move]': { opacity: 1 },
})
const title = css({
  textStyle: 'body.sm',
  fontWeight: 'medium',
  color: 'fg.default',
  textDecoration: 'none',
  overflowWrap: 'anywhere',
  _hover: { color: 'accent.text' },
  // The whole card is the link's hit area; the move buttons sit above it.
  _after: { content: '""', position: 'absolute', inset: '0', borderRadius: 'md' },
})
const meta = css({ textStyle: 'ui.sm', color: 'fg.muted', display: 'flex', gap: '1', minW: '0' })
const customer = css({ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })
const footer = css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2' })
// Always visible on touch screens; revealed on hover/focus where a pointer can hover.
const move = css({
  position: 'relative',
  zIndex: '[1]',
  display: 'flex',
  gap: '0.5',
  opacity: 1,
  '@media (hover: hover)': { opacity: 0 },
  transitionProperty: 'opacity',
  transitionDuration: 'fast',
})

interface BoardCardProps {
  ticket: Ticket
  /** Column the card is shown in (may differ from `ticket.status` while a move is saving). */
  status: TicketStatus
  dragging: boolean
  pending: boolean
  onDragStart: (ticket: Ticket) => void
  onDragEnd: () => void
  onMove: (ticket: Ticket, to: TicketStatus) => void
}

/**
 * Kanban card. Drag it to another column, or use the arrow buttons (keyboard and touch)
 * to move it one column left or right.
 */
export function BoardCard({ ticket, status, dragging, pending, onDragStart, onDragEnd, onMove }: BoardCardProps) {
  const index = TICKET_STATUSES.indexOf(status)
  const previous = TICKET_STATUSES[index - 1]
  const next = TICKET_STATUSES[index + 1]

  return (
    <li
      className={card}
      draggable={!pending}
      data-dragging={dragging}
      data-pending={pending}
      aria-busy={pending || undefined}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', ticket.id)
        onDragStart(ticket)
      }}
      onDragEnd={onDragEnd}
    >
      <Link href={`/tickets/${ticket.id}`} className={title} draggable={false}>
        {ticket.title}
      </Link>
      <span className={meta}>
        <span className={customer}>{ticket.customerName}</span>·<time dateTime={ticket.createdAt}>{formatDate(ticket.createdAt)}</time>
      </span>
      <div className={footer}>
        <PriorityBadge priority={ticket.priority} />
        <span className={move} data-part="move">
          {previous && (
            <IconButton size="md" icon={ChevronLeft} label={`Move to ${STATUS_META[previous].label}`} disabled={pending} onClick={() => onMove(ticket, previous)} />
          )}
          {next && (
            <IconButton size="md" icon={ChevronRight} label={`Move to ${STATUS_META[next].label}`} disabled={pending} onClick={() => onMove(ticket, next)} />
          )}
        </span>
      </div>
    </li>
  )
}

/** Placeholder with the same structure (and therefore height) as {@link BoardCard}. */
export function BoardCardSkeleton() {
  return (
    <li className={card} aria-hidden>
      <span className={title}>
        <SkeletonText width="80%" />
      </span>
      <span className={meta}>
        <SkeletonText width="55%" />
      </span>
      <div className={footer}>
        <Skeleton className={css({ h: 'control.sm', w: '16', borderRadius: 'full' })} />
      </div>
    </li>
  )
}
