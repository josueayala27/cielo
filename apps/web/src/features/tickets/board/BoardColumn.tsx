'use client'

import type { Ticket, TicketStatus } from '@cielo/contracts'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { css } from 'styled-system/css'
import { Button } from '@/components/ui'
import { STATUS_META } from '../presentation'
import { StatusIcon } from '../components/TicketGlyphs'
import { BoardCard, BoardCardSkeleton } from './BoardCard'

/** Cards rendered while a column loads. */
const SKELETON_CARDS = 3

const column = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  minW: '0',
  p: '2',
  bg: 'bg.panel',
  borderRadius: 'lg',
  scrollSnapAlign: 'start',
  transitionProperty: 'box-shadow, background',
  transitionDuration: 'fast',
  '&[data-over=true]': { bg: 'accent.soft', boxShadow: '[inset 0 0 0 1px token(colors.accent.default)]' },
})
const head = css({ display: 'flex', alignItems: 'center', gap: '2', h: 'control.lg', px: '1.5' })
const headTitle = css({ display: 'flex', alignItems: 'center', gap: '2', flex: '1', textStyle: 'ui.title' })
const count = css({
  minW: '5',
  px: '1.5',
  borderRadius: 'full',
  bg: 'bg.subtle',
  textStyle: 'ui.xs',
  color: 'fg.muted',
  textAlign: 'center',
  fontVariantNumeric: 'tabular-nums',
})
const addIcon = css({
  display: 'inline-grid',
  placeItems: 'center',
  w: 'control.md',
  h: 'control.md',
  borderRadius: 'sm',
  color: 'fg.subtle',
  _hover: { bg: 'bg.hover', color: 'fg.default' },
})
const list = css({ display: 'flex', flexDirection: 'column', gap: '2', minH: '24' })
const empty = css({
  display: 'grid',
  placeItems: 'center',
  minH: '24',
  borderRadius: 'md',
  borderWidth: '1px',
  borderStyle: 'dashed',
  borderColor: 'border.strong',
  textStyle: 'ui.md',
  color: 'fg.subtle',
  textAlign: 'center',
  px: '3',
})
const addRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1.5',
  h: 'control.lg',
  px: '2',
  borderRadius: 'sm',
  textStyle: 'ui.md',
  color: 'fg.subtle',
  textDecoration: 'none',
  _hover: { bg: 'bg.hover', color: 'fg.default' },
})
const errorBox = css({ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2', p: '2', textStyle: 'body.sm', color: 'fg.muted' })

/** Loading state of one column's query, passed down from the board. */
export interface ColumnQueryState {
  isPending: boolean
  isError: boolean
  isRefetching: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  refetch: () => void
  fetchNextPage: () => void
}

interface BoardColumnProps {
  status: TicketStatus
  /** Ordered tickets, pending moves already applied. */
  tickets: Ticket[]
  /** Count for the current filters, pending moves already applied. */
  total: number
  query: ColumnQueryState
  /** Ids of tickets whose move is being saved. */
  pendingIds: ReadonlySet<string>
  onMove: (ticket: Ticket, to: TicketStatus) => void
}

/** One status column: a drop zone and a sortable list of cards. */
export function BoardColumn({ status, tickets, total, query, pendingIds, onMove }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status, data: { type: 'column', status } })
  const { label } = STATUS_META[status]
  const newTicketHref = `/tickets/new?status=${status}`
  const headingId = `column-${status}`

  return (
    <section ref={setNodeRef} className={column} aria-labelledby={headingId} data-over={isOver && tickets.length === 0}>
      <header className={head}>
        <h3 id={headingId} className={headTitle}>
          <StatusIcon status={status} decorative />
          {label}
          <span className={count} aria-label={`${total} tickets`}>
            {query.isPending ? '–' : total}
          </span>
        </h3>
        <Link href={newTicketHref} className={addIcon} aria-label={`New ${label.toLowerCase()} ticket`} title={`New ${label.toLowerCase()} ticket`}>
          <Plus size={14} aria-hidden />
        </Link>
      </header>

      {query.isError && tickets.length === 0 ? (
        <div className={errorBox} role="alert">
          Could not load {label.toLowerCase()} tickets.
          <Button size="md" loading={query.isRefetching} onClick={query.refetch}>
            Retry
          </Button>
        </div>
      ) : (
        <SortableContext id={status} items={tickets.map((ticket) => ticket.id)} strategy={verticalListSortingStrategy}>
          <ul className={list} aria-busy={query.isPending}>
            {query.isPending ? (
              Array.from({ length: SKELETON_CARDS }, (_, i) => <BoardCardSkeleton key={i} />)
            ) : tickets.length === 0 ? (
              <li className={empty}>{isOver ? `Drop to mark as ${label.toLowerCase()}` : 'No tickets'}</li>
            ) : (
              tickets.map((ticket) => <BoardCard key={ticket.id} ticket={ticket} pending={pendingIds.has(ticket.id)} onMove={onMove} />)
            )}
          </ul>
        </SortableContext>
      )}

      {query.hasNextPage ? (
        <Button size="lg" variant="ghost" block loading={query.isFetchingNextPage} onClick={query.fetchNextPage}>
          Load more
        </Button>
      ) : (
        <Link href={newTicketHref} className={addRow}>
          <Plus size={14} aria-hidden />
          New ticket
        </Link>
      )}
    </section>
  )
}
