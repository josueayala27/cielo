'use client'

import { TICKET_STATUSES, type Ticket, type TicketStatus } from '@cielo/contracts'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { css } from 'styled-system/css'
import { Avatar, IconButton, Skeleton, SkeletonText } from '@/components/ui'
import { STATUS_META, ticketRef } from '../presentation'
import { PriorityIcon } from './TicketGlyphs'

const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

const card = css({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  p: '3',
  bg: 'bg.elevated',
  borderWidth: '1px',
  borderColor: 'border.default',
  borderRadius: 'md',
  cursor: 'grab',
  transitionProperty: 'border-color, box-shadow, opacity, transform',
  transitionDuration: 'fast',
  transitionTimingFunction: 'standard',
  _hover: { borderColor: 'border.strong', boxShadow: 'popover' },
  _active: { cursor: 'grabbing' },
  '&[data-dragging=true]': { opacity: 0.35, transform: 'scale(0.98)' },
  '&[data-pending=true]': { opacity: 0.6, cursor: 'progress' },
  '&:hover [data-part=move], &:focus-within [data-part=move]': { opacity: 1 },
})
const top = css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2' })
const ref = css({ fontFamily: 'mono', textStyle: 'ui.xs', color: 'fg.subtle', letterSpacing: '[0.02em]' })
const title = css({
  textStyle: 'ui.title',
  color: 'fg.default',
  textDecoration: 'none',
  lineClamp: '2',
  overflowWrap: 'anywhere',
  _hover: { color: 'accent.text' },
  // The whole card is the link's hit area; the move buttons sit above it.
  _after: { content: '""', position: 'absolute', inset: '0', borderRadius: 'md' },
})
const description = css({ textStyle: 'ui.sm', fontWeight: 'normal', color: 'fg.muted', lineClamp: '2', overflowWrap: 'anywhere' })
const footer = css({ display: 'flex', alignItems: 'center', gap: '2', mt: '1', minH: 'control.md' })
const person = css({ display: 'flex', alignItems: 'center', gap: '1.5', minW: '0', flex: '1', textStyle: 'ui.sm', color: 'fg.muted' })
const name = css({ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })
const date = css({ display: 'inline-flex', alignItems: 'center', gap: '1', textStyle: 'ui.sm', color: 'fg.subtle', whiteSpace: 'nowrap' })
// Always visible on touch screens; revealed on hover/focus where a pointer can hover.
const move = css({
  position: 'relative',
  zIndex: '[1]',
  display: 'flex',
  gap: '0.5',
  opacity: 1,
  transitionProperty: 'opacity',
  transitionDuration: 'fast',
  '@media (hover: hover)': { opacity: 0 },
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
 * Kanban card: reference and priority, title, description preview, customer and date.
 * Drag it to another column, or use the arrow buttons (keyboard and touch) to move it.
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
      <div className={top}>
        <span className={ref}>{ticketRef(ticket.id)}</span>
        <PriorityIcon priority={ticket.priority} />
      </div>
      <Link href={`/tickets/${ticket.id}`} className={title} draggable={false}>
        {ticket.title}
      </Link>
      <p className={description}>{ticket.description}</p>
      <div className={footer}>
        <span className={person}>
          <Avatar name={ticket.customerName} />
          <span className={name}>{ticket.customerName}</span>
        </span>
        <span className={move} data-part="move">
          {previous && (
            <IconButton size="md" icon={ChevronLeft} label={`Move to ${STATUS_META[previous].label}`} disabled={pending} onClick={() => onMove(ticket, previous)} />
          )}
          {next && (
            <IconButton size="md" icon={ChevronRight} label={`Move to ${STATUS_META[next].label}`} disabled={pending} onClick={() => onMove(ticket, next)} />
          )}
        </span>
        <time className={date} dateTime={ticket.createdAt}>
          <CalendarDays size={12} aria-hidden />
          {shortDate.format(new Date(ticket.createdAt))}
        </time>
      </div>
    </li>
  )
}

/** Placeholder with the same structure (and therefore height) as {@link BoardCard}. */
export function BoardCardSkeleton() {
  return (
    <li className={card} aria-hidden>
      <div className={top}>
        <span className={ref}>
          <SkeletonText width="3.5rem" />
        </span>
        <Skeleton className={css({ w: '3.5', h: '3.5' })} />
      </div>
      <span className={title}>
        <SkeletonText width="85%" />
      </span>
      <p className={description}>
        <SkeletonText />
        <SkeletonText width="60%" />
      </p>
      <div className={footer}>
        <span className={person}>
          <Skeleton className={css({ w: '5', h: '5', borderRadius: 'full' })} />
          <SkeletonText width="6rem" />
        </span>
        <span className={date}>
          <SkeletonText width="3rem" />
        </span>
      </div>
    </li>
  )
}
