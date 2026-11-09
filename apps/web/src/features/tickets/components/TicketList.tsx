'use client'

import type { Ticket } from '@cielo/contracts'
import { Inbox, Plus, SearchX, WifiOff } from 'lucide-react'
import Link from 'next/link'
import { css } from 'styled-system/css'
import { Button, Card, EmptyState, Skeleton, SkeletonText, buttonRecipe } from '@/components/ui'
import { ApiError } from '@/lib/api-client'
import { formatDate } from '@/lib/format'
import { PriorityBadge, StatusBadge } from './TicketBadges'

const table = css({
  display: { base: 'none', md: 'table' },
  w: 'full',
  borderCollapse: 'collapse',
  '& th': {
    textAlign: 'left',
    textStyle: 'ui.sm',
    color: 'fg.subtle',
    px: '4',
    py: '3',
    borderBottomWidth: '1px',
    borderColor: 'border.default',
    whiteSpace: 'nowrap',
  },
  '& td': { px: '4', py: '3', borderBottomWidth: '1px', borderColor: 'border.default', verticalAlign: 'middle' },
  '& tbody tr': { transitionProperty: 'background', transitionDuration: 'fast', _hover: { bg: 'bg.hover' } },
  '& tbody tr:last-child td': { borderBottomWidth: '0' },
})
const titleText = css({ display: 'block', fontWeight: 'medium' })
const titleLink = css({
  color: 'fg.default',
  fontWeight: 'medium',
  textDecoration: 'none',
  _hover: { color: 'accent.text' },
  // Stretch the link over the whole row so the row is clickable but keeps one tab stop.
  _after: { content: '""', position: 'absolute', inset: '0' },
})
const row = css({ position: 'relative' })
const customer = css({ display: 'flex', flexDirection: 'column' })
const email = css({ textStyle: 'ui.sm', color: 'fg.subtle' })
const muted = css({ color: 'fg.muted', whiteSpace: 'nowrap' })
const cards = css({ display: { base: 'flex', md: 'none' }, flexDirection: 'column' })
const cardItem = css({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  p: '4',
  borderBottomWidth: '1px',
  borderColor: 'border.default',
  _last: { borderBottomWidth: '0' },
})
const cardMeta = css({ display: 'flex', alignItems: 'center', gap: '2', flexWrap: 'wrap', textStyle: 'ui.sm', color: 'fg.muted' })
const listCard = css({ overflow: 'hidden', transitionProperty: 'opacity', transitionDuration: 'fast', '&[aria-busy=true]': { opacity: 0.6 } })

interface TicketListProps {
  tickets: Ticket[] | undefined
  isPending: boolean
  /** A newer page is loading while the previous one stays visible. */
  isFetching: boolean
  error: Error | null
  hasFilters: boolean
  onRetry: () => void
  onClearFilters: () => void
  /** Placeholder rows while loading; use the page size so the height does not change. */
  skeletonRows?: number
}

/**
 * Ticket listing: a table from `md` up and stacked cards on phones. Handles the loading,
 * error and both empty states (no tickets at all vs. no match for the filters).
 */
export function TicketList({ tickets, isPending, isFetching, error, hasFilters, onRetry, onClearFilters, skeletonRows = 10 }: TicketListProps) {
  if (isPending) return <ListSkeleton rows={skeletonRows} />

  if (error && !tickets) {
    return (
      <Card>
        <EmptyState
          tone="danger"
          icon={WifiOff}
          title={error instanceof ApiError && error.isNetworkError ? 'You appear to be offline' : 'Could not load tickets'}
          description={error.message}
          actions={<Button onClick={onRetry}>Try again</Button>}
        />
      </Card>
    )
  }

  if (!tickets || tickets.length === 0) {
    return (
      <Card>
        {hasFilters ? (
          <EmptyState
            icon={SearchX}
            title="No tickets match your filters"
            description="Try a different search term or clear the filters."
            actions={<Button onClick={onClearFilters}>Clear filters</Button>}
          />
        ) : (
          <EmptyState
            icon={Inbox}
            title="No tickets yet"
            description="Create the first support ticket to start tracking it here."
            actions={
              <Link href="/tickets/new" className={buttonRecipe({ variant: 'primary' })}>
                <Plus size={14} aria-hidden /> New ticket
              </Link>
            }
          />
        )}
      </Card>
    )
  }

  return (
    <Card className={listCard} aria-busy={isFetching}>
      <table className={table}>
        <TableHead />
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id} className={row}>
              <td>
                <Link href={`/tickets/${ticket.id}`} className={titleLink}>
                  {ticket.title}
                </Link>
              </td>
              <td>
                <span className={customer}>
                  {ticket.customerName}
                  <span className={email}>{ticket.customerEmail}</span>
                </span>
              </td>
              <td>
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td>
                <StatusBadge status={ticket.status} />
              </td>
              <td className={muted}>
                <time dateTime={ticket.createdAt}>{formatDate(ticket.createdAt)}</time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className={cards}>
        {tickets.map((ticket) => (
          <li key={ticket.id} className={cardItem}>
            <Link href={`/tickets/${ticket.id}`} className={titleLink}>
              {ticket.title}
            </Link>
            <span className={cardMeta}>
              {ticket.customerName} · <time dateTime={ticket.createdAt}>{formatDate(ticket.createdAt)}</time>
            </span>
            <span className={cardMeta}>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

/** Column headers shared by the table and its skeleton. */
function TableHead() {
  return (
    <thead>
      <tr>
        <th scope="col">Title</th>
        <th scope="col">Customer</th>
        <th scope="col">Priority</th>
        <th scope="col">Status</th>
        <th scope="col">Created</th>
      </tr>
    </thead>
  )
}

const badgeSkeleton = css({ h: 'control.sm', w: '16', borderRadius: 'full' })

/**
 * First-load placeholder built from the same table and card markup as the real list,
 * with text-height bars, so rows keep their size when data arrives.
 */
function ListSkeleton({ rows }: { rows: number }) {
  const items = Array.from({ length: rows }, (_, i) => i)
  return (
    <Card className={listCard} aria-busy="true" aria-label="Loading tickets">
      <table className={table} aria-hidden>
        <TableHead />
        <tbody>
          {items.map((i) => (
            <tr key={i}>
              <td>
                <span className={titleText}>
                  <SkeletonText width={`${55 + ((i * 17) % 35)}%`} />
                </span>
              </td>
              <td>
                <span className={customer}>
                  <SkeletonText width="7rem" />
                  <span className={email}>
                    <SkeletonText width="10rem" />
                  </span>
                </span>
              </td>
              <td>
                <Skeleton className={badgeSkeleton} />
              </td>
              <td>
                <Skeleton className={badgeSkeleton} />
              </td>
              <td className={muted}>
                <SkeletonText width="6rem" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className={cards} aria-hidden>
        {items.map((i) => (
          <li key={i} className={cardItem}>
            <span className={titleText}>
              <SkeletonText width={`${55 + ((i * 17) % 35)}%`} />
            </span>
            <span className={cardMeta}>
              <SkeletonText width="12rem" />
            </span>
            <span className={cardMeta}>
              <Skeleton className={badgeSkeleton} />
              <Skeleton className={badgeSkeleton} />
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
