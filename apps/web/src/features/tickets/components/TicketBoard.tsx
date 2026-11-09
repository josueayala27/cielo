'use client'

import { TICKET_STATUSES, type Ticket, type TicketStatus } from '@cielo/contracts'
import { useState } from 'react'
import { css } from 'styled-system/css'
import { useToast } from '@/components/ui'
import { ApiError } from '@/lib/api-client'
import { STATUS_META } from '../presentation'
import { useMoveTicket, type ColumnParams } from '../queries'
import { BoardColumn, type PendingMove } from './BoardColumn'

// Three columns from `lg`; below that the columns scroll sideways and snap.
const board = css({
  display: 'grid',
  gap: '3',
  alignItems: 'start',
  gridTemplateColumns: { base: '[repeat(3, minmax(85%, 1fr))]', sm: '[repeat(3, minmax(320px, 1fr))]', lg: 'repeat(3, minmax(0, 1fr))' },
  overflowX: { base: 'auto', lg: 'visible' },
  scrollSnapType: '[x mandatory]',
  pb: { base: '2', lg: '0' },
  mx: { base: '-4', lg: '0' },
  px: { base: '4', lg: '0' },
  scrollPaddingInline: '[16px]',
})

/**
 * Kanban view of the tickets: one column per status. Moving a card (drag and drop, or
 * the arrow buttons) PATCHes its status; the card moves immediately and snaps back with
 * an error toast if the save fails.
 */
export function TicketBoard({ params }: { params: ColumnParams }) {
  const toast = useToast()
  const moveTicket = useMoveTicket()
  const [pending, setPending] = useState<ReadonlyMap<string, PendingMove>>(new Map())
  const [dragging, setDragging] = useState<Ticket | null>(null)

  const setMove = (id: string, move?: PendingMove) =>
    setPending((current) => {
      const next = new Map(current)
      if (move) next.set(id, move)
      else next.delete(id)
      return next
    })

  async function move(ticket: Ticket, to: TicketStatus) {
    setDragging(null)
    if (pending.has(ticket.id) || ticket.status === to) return
    setMove(ticket.id, { ticket, to })
    try {
      await moveTicket.mutateAsync({ id: ticket.id, status: to })
      toast.success(`Moved to ${STATUS_META[to].label}`)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Could not move the ticket.')
    } finally {
      // Lists have refetched by now (or the move failed), so the override can go.
      setMove(ticket.id)
    }
  }

  return (
    <div className={board} aria-label="Ticket board">
      {TICKET_STATUSES.map((status) => (
        <BoardColumn
          key={status}
          status={status}
          params={params}
          pending={pending}
          dragging={dragging}
          onDragStart={setDragging}
          onDragEnd={() => setDragging(null)}
          onMove={move}
        />
      ))}
    </div>
  )
}
