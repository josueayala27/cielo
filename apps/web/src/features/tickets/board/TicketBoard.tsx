'use client'

import { TICKET_STATUSES, ticketStatusSchema, type Ticket, type TicketStatus } from '@cielo/contracts'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { css } from 'styled-system/css'
import { useToast } from '@/components/ui'
import { ApiError } from '@/lib/api-client'
import { STATUS_META } from '../presentation'
import { useMoveTicket, useTicketColumn, type ColumnParams } from '../queries'
import { BoardCardOverlay } from './BoardCard'
import { BoardColumn, type ColumnQueryState } from './BoardColumn'
import { buildColumns, positionAt, type Placement } from './board-order'

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

/** Runs a DOM update inside a View Transition when the browser supports it. */
function withViewTransition(update: () => void) {
  if (typeof document !== 'undefined' && 'startViewTransition' in document) {
    document.startViewTransition(() => flushSync(update))
  } else {
    update()
  }
}

/**
 * Kanban view: one column per status, cards in manual order. Cards can be dragged
 * within a column (reorder) or to another column (status change); the move is shown
 * immediately and saved as one PATCH of `{ status, position }`.
 */
export function TicketBoard({ params }: { params: ColumnParams }) {
  const toast = useToast()
  const moveTicket = useMoveTicket()
  const queries: Record<TicketStatus, ReturnType<typeof useTicketColumn>> = {
    open: useTicketColumn('open', params),
    in_progress: useTicketColumn('in_progress', params),
    resolved: useTicketColumn('resolved', params),
  }

  /** Placements shown before the server has them: drag previews and saves in flight. */
  const [placements, setPlacements] = useState<ReadonlyMap<string, Placement>>(new Map())
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set())
  const [activeId, setActiveId] = useState<string | null>(null)
  const beforeDrag = useRef<ReadonlyMap<string, Placement>>(new Map())

  const serverTickets = useMemo(() => {
    const byId = new Map<string, Ticket>()
    for (const status of TICKET_STATUSES) {
      for (const page of queries[status].data?.pages ?? []) for (const ticket of page.items) byId.set(ticket.id, ticket)
    }
    return byId
    // Each query's data reference changes only when its pages change.
  }, [queries.open.data, queries.in_progress.data, queries.resolved.data])

  const columns = useMemo(() => buildColumns(serverTickets.values(), placements, TICKET_STATUSES), [serverTickets, placements])

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // A short press starts a drag on touch screens, so swiping still scrolls.
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const setPlacement = (id: string, placement?: Placement) =>
    setPlacements((current) => {
      const next = new Map(current)
      if (placement) next.set(id, placement)
      else next.delete(id)
      return next
    })

  /** Column a draggable or droppable id belongs to: a column id is its status. */
  function containerOf(id: UniqueIdentifier): TicketStatus | undefined {
    const asStatus = ticketStatusSchema.safeParse(id)
    if (asStatus.success) return asStatus.data
    return TICKET_STATUSES.find((status) => columns[status].some((ticket) => ticket.id === id))
  }

  /**
   * Collision strategy for several sortable lists: whatever is under the pointer wins;
   * when that is a column with cards, the closest card inside it. Plain `closestCorners`
   * lets the tall column boxes compete with the cards and the drop index drifts.
   */
  const collisionDetection: CollisionDetection = (args) => {
    const underPointer = pointerWithin(args)
    const hits = underPointer.length > 0 ? underPointer : rectIntersection(args)
    const overId = getFirstCollision(hits, 'id')
    if (overId == null) return []
    const status = ticketStatusSchema.safeParse(overId)
    if (!status.success || columns[status.data].length === 0) return [{ id: overId }]
    const ids = new Set(columns[status.data].map((ticket) => ticket.id))
    const closest = closestCenter({ ...args, droppableContainers: args.droppableContainers.filter((c) => ids.has(String(c.id))) })
    return closest.length > 0 ? [closest[0]!] : [{ id: overId }]
  }

  /** Saves a placement; the card keeps it until lists have refetched (or snaps back on error). */
  async function save(ticket: Ticket, placement: Placement) {
    const server = serverTickets.get(ticket.id)
    if (server && server.status === placement.status && server.position === placement.position) {
      setPlacement(ticket.id)
      return
    }
    setPlacement(ticket.id, placement)
    setPendingIds((ids) => new Set(ids).add(ticket.id))
    try {
      await moveTicket.mutateAsync({ id: ticket.id, ...placement })
      if (server?.status !== placement.status) toast.success(`Moved to ${STATUS_META[placement.status].label}`)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Could not move the ticket.')
    } finally {
      setPlacement(ticket.id)
      setPendingIds((ids) => {
        const next = new Set(ids)
        next.delete(ticket.id)
        return next
      })
    }
  }

  function onDragStart({ active }: DragStartEvent) {
    beforeDrag.current = placements
    setActiveId(String(active.id))
  }

  /** Crossing into another column: preview the card there at the hovered index. */
  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const from = containerOf(active.id)
    const to = containerOf(over.id)
    if (!from || !to || from === to) return
    const target = columns[to]
    const overIndex = target.findIndex((ticket) => ticket.id === over.id)
    const translated = active.rect.current.translated
    const below = translated && overIndex >= 0 ? translated.top > over.rect.top + over.rect.height / 2 : false
    const index = overIndex >= 0 ? overIndex + (below ? 1 : 0) : target.length
    setPlacement(String(active.id), { status: to, position: positionAt(target, String(active.id), index) })
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    const id = String(active.id)
    const to = over ? containerOf(over.id) : undefined
    const ticket = to && columns[to].find((item) => item.id === id)
    if (!over || !to || !ticket) return onDragCancel()

    let placement: Placement = { status: to, position: ticket.position }
    if (over.id !== active.id && containerOf(over.id) === to && over.id !== to) {
      const newIndex = columns[to].findIndex((item) => item.id === over.id)
      placement = { status: to, position: positionAt(columns[to], id, newIndex) }
    }
    void save(serverTickets.get(id) ?? ticket, placement)
  }

  function onDragCancel() {
    setActiveId(null)
    setPlacements(beforeDrag.current)
  }

  /** Arrow buttons: move to the top of an adjacent column, animated with a view transition. */
  function onMove(ticket: Ticket, to: TicketStatus) {
    const placement = { status: to, position: positionAt(columns[to], ticket.id, 0) }
    withViewTransition(() => setPlacement(ticket.id, placement))
    void save(ticket, placement)
  }

  const activeTicket = activeId ? (columns[containerOf(activeId) ?? 'open'].find((t) => t.id === activeId) ?? null) : null

  const titleOf = (id: UniqueIdentifier) => serverTickets.get(String(id))?.title ?? 'Ticket'
  const placeOf = (id: UniqueIdentifier) => {
    const status = containerOf(id)
    if (!status) return 'outside the board'
    const index = columns[status].findIndex((t) => t.id === id)
    return `${STATUS_META[status].label}, position ${index + 1} of ${columns[status].length}`
  }
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${titleOf(active.id)}. ${placeOf(active.id)}.`,
    onDragOver: ({ active, over }) => (over ? `${titleOf(active.id)} is over ${placeOf(over.id)}.` : undefined),
    onDragEnd: ({ active, over }) => (over ? `Dropped ${titleOf(active.id)} in ${placeOf(over.id)}.` : `Dropped ${titleOf(active.id)}.`),
    onDragCancel: ({ active }) => `Cancelled. ${titleOf(active.id)} was returned.`,
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
      accessibility={{ announcements }}
    >
      <div className={board} aria-label="Ticket board">
        {TICKET_STATUSES.map((status) => {
          const query = queries[status]
          const serverTotal = query.data?.pages[0]?.total ?? 0
          const movedIn = columns[status].filter((t) => serverTickets.get(t.id)?.status !== status).length
          const movedOut = [...serverTickets.values()].filter((t) => t.status === status && (placements.get(t.id)?.status ?? status) !== status).length
          const state: ColumnQueryState = {
            isPending: query.isPending,
            isError: query.isError,
            isRefetching: query.isRefetching,
            hasNextPage: query.hasNextPage,
            isFetchingNextPage: query.isFetchingNextPage,
            refetch: () => void query.refetch(),
            fetchNextPage: () => void query.fetchNextPage(),
          }
          return (
            <BoardColumn
              key={status}
              status={status}
              tickets={columns[status]}
              total={serverTotal + movedIn - movedOut}
              query={state}
              pendingIds={pendingIds}
              onMove={onMove}
            />
          )
        })}
      </div>
      <DragOverlay>{activeTicket ? <BoardCardOverlay ticket={activeTicket} /> : null}</DragOverlay>
    </DndContext>
  )
}
