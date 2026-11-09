'use client'

import type { Ticket, TicketStatus } from '@cielo/contracts'
import { useState, type DragEvent } from 'react'
import { css } from 'styled-system/css'
import { Badge, Button } from '@/components/ui'
import { STATUS_META } from '../presentation'
import { useTicketColumn, type ColumnParams } from '../queries'
import { BoardCard, BoardCardSkeleton } from './BoardCard'

/** Cards rendered while a column loads; matches the first page's typical height. */
const SKELETON_CARDS = 3

const column = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
  minW: '0',
  p: '3',
  bg: 'bg.app',
  borderRadius: 'lg',
  borderWidth: '1px',
  borderColor: 'border.default',
  scrollSnapAlign: 'start',
  transitionProperty: 'border-color, background',
  transitionDuration: 'fast',
  '&[data-drop-target=true]': { borderColor: 'accent.default', bg: 'accent.soft' },
})
const head = css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2', px: '1' })
const count = css({ textStyle: 'ui.md', color: 'fg.subtle', fontVariantNumeric: 'tabular-nums' })
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
const errorBox = css({ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2', textStyle: 'body.sm', color: 'fg.muted' })

/** A move the board shows before the server confirms it. */
export interface PendingMove {
  ticket: Ticket
  to: TicketStatus
}

interface BoardColumnProps {
  status: TicketStatus
  params: ColumnParams
  /** Moves in flight, keyed by ticket id. */
  pending: ReadonlyMap<string, PendingMove>
  /** Ticket being dragged anywhere on the board. */
  dragging: Ticket | null
  onDragStart: (ticket: Ticket) => void
  onDragEnd: () => void
  onMove: (ticket: Ticket, to: TicketStatus) => void
}

/**
 * One status column. Loads its own tickets (with the board's search/priority/sort),
 * accepts drops from other columns and reflects pending moves optimistically.
 */
export function BoardColumn({ status, params, pending, dragging, onDragStart, onDragEnd, onMove }: BoardColumnProps) {
  const query = useTicketColumn(status, params)
  const [dropTarget, setDropTarget] = useState(false)
  const { label, tone } = STATUS_META[status]

  const loaded = query.data?.pages.flatMap((page) => page.items) ?? []
  const movedIn = [...pending.values()].filter((move) => move.to === status && move.ticket.status !== status).map((move) => move.ticket)
  const tickets = [...movedIn, ...loaded.filter((ticket) => (pending.get(ticket.id)?.to ?? status) === status)]
  const movedOut = loaded.length + movedIn.length - tickets.length
  const total = (query.data?.pages[0]?.total ?? 0) + movedIn.length - movedOut

  const canDrop = dragging !== null && (pending.get(dragging.id)?.to ?? dragging.status) !== status

  function onDragOver(event: DragEvent) {
    if (!canDrop) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDropTarget(true)
  }

  function onDrop(event: DragEvent) {
    event.preventDefault()
    setDropTarget(false)
    if (dragging && canDrop) onMove(dragging, status)
  }

  const headingId = `column-${status}`

  return (
    <section
      className={column}
      aria-labelledby={headingId}
      data-drop-target={dropTarget}
      onDragOver={onDragOver}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropTarget(false)
      }}
      onDrop={onDrop}
    >
      <header className={head}>
        <h3 id={headingId}>
          <Badge tone={tone}>{label}</Badge>
        </h3>
        <span className={count} aria-label={`${total} tickets`}>
          {query.isPending ? '–' : total}
        </span>
      </header>

      {query.isError && !query.data ? (
        <div className={errorBox} role="alert">
          Could not load {label.toLowerCase()} tickets.
          <Button size="md" loading={query.isRefetching} onClick={() => query.refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <ul className={list} aria-busy={query.isPending || query.isPlaceholderData}>
          {query.isPending ? (
            Array.from({ length: SKELETON_CARDS }, (_, i) => <BoardCardSkeleton key={i} />)
          ) : tickets.length === 0 ? (
            <li className={empty}>{canDrop ? `Drop to mark as ${label.toLowerCase()}` : 'No tickets'}</li>
          ) : (
            tickets.map((ticket) => (
              <BoardCard
                key={ticket.id}
                ticket={ticket}
                status={status}
                dragging={dragging?.id === ticket.id}
                pending={pending.has(ticket.id)}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onMove={onMove}
              />
            ))
          )}
        </ul>
      )}

      {query.hasNextPage && (
        <Button size="md" variant="ghost" block loading={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>
          Load more
        </Button>
      )}
    </section>
  )
}
