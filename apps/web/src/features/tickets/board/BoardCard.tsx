'use client'

import { TICKET_STATUSES, type Ticket, type TicketStatus } from '@cielo/contracts'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, type CSSProperties, type MouseEvent } from 'react'
import { css, cx } from 'styled-system/css'
import { Avatar, IconButton, Skeleton, SkeletonText } from '@/components/ui'
import { STATUS_META, ticketRef } from '../presentation'
import { PriorityIcon } from '../components/TicketGlyphs'

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
  touchAction: 'manipulation',
  transitionProperty: 'border-color, box-shadow, opacity',
  transitionDuration: 'fast',
  transitionTimingFunction: 'standard',
  _hover: { borderColor: 'border.strong' },
  '&[data-pending=true]': { opacity: 0.7 },
  '&:hover [data-part=move], &:focus-within [data-part=move]': { opacity: 1 },
})
// The slot left behind while a card is dragged: a dashed outline of the same size.
const placeholder = css({
  bg: 'transparent',
  borderStyle: 'dashed',
  borderColor: 'accent.default',
  '& > *': { visibility: 'hidden' },
})
// The copy that follows the pointer.
const overlay = css({ cursor: 'grabbing', boxShadow: 'popover', rotate: '[2deg]', scale: '[1.02]' })
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

/** View-transition name per card, so button moves animate between columns. */
export const cardTransitionName = (id: string) => `ticket-${id.replace(/[^a-zA-Z0-9-]/g, '')}`

interface BoardCardProps {
  ticket: Ticket
  /** A move of this card is being saved. */
  pending: boolean
  /** Moves the card to the top of an adjacent column (keyboard and touch alternative to dragging). */
  onMove: (ticket: Ticket, to: TicketStatus) => void
}

/**
 * Sortable Kanban card: drag it within or across columns (pointer, touch or keyboard:
 * focus, Space, arrows, Space), or use the arrow buttons to move it one column over.
 */
export function BoardCard({ ticket, pending, onMove }: BoardCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ticket.id, data: { ticket } })
  const draggedRecently = useRecentDrag(isDragging)

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    viewTransitionName: isDragging ? undefined : cardTransitionName(ticket.id),
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cx(card, isDragging && placeholder)}
      data-pending={pending}
      aria-busy={pending || undefined}
      {...attributes}
      {...listeners}
      onClickCapture={draggedRecently}
    >
      <CardContent ticket={ticket} pending={pending} onMove={onMove} />
    </li>
  )
}

/** Static copy rendered in the drag overlay. */
export function BoardCardOverlay({ ticket }: { ticket: Ticket }) {
  return (
    <div className={cx(card, overlay)}>
      <CardContent ticket={ticket} pending={false} />
    </div>
  )
}

function CardContent({ ticket, pending, onMove }: { ticket: Ticket; pending: boolean; onMove?: BoardCardProps['onMove'] }) {
  const index = TICKET_STATUSES.indexOf(ticket.status)
  const previous = TICKET_STATUSES[index - 1]
  const next = TICKET_STATUSES[index + 1]

  return (
    <>
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
        {onMove && (
          // Buttons must not start a drag.
          <span className={move} data-part="move" onPointerDown={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
            {previous && (
              <IconButton size="md" icon={ChevronLeft} label={`Move to ${STATUS_META[previous].label}`} disabled={pending} onClick={() => onMove(ticket, previous)} />
            )}
            {next && (
              <IconButton size="md" icon={ChevronRight} label={`Move to ${STATUS_META[next].label}`} disabled={pending} onClick={() => onMove(ticket, next)} />
            )}
          </span>
        )}
        <time className={date} dateTime={ticket.createdAt}>
          <CalendarDays size={12} aria-hidden />
          {shortDate.format(new Date(ticket.createdAt))}
        </time>
      </div>
    </>
  )
}

/**
 * Swallows the click that ends a drag, so dropping a card does not also open it.
 * Returns an `onClickCapture` handler.
 */
function useRecentDrag(isDragging: boolean) {
  const recent = useRef(false)
  useEffect(() => {
    if (isDragging) {
      recent.current = true
      return
    }
    const timer = setTimeout(() => (recent.current = false), 0)
    return () => clearTimeout(timer)
  }, [isDragging])
  return (event: MouseEvent) => {
    if (!recent.current) return
    event.preventDefault()
    event.stopPropagation()
  }
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
