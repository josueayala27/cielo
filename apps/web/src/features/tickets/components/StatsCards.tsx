'use client'

import { TICKET_STATUSES, type TicketStatus } from '@cielo/contracts'
import { CircleCheck, CircleDot, Inbox, LoaderCircle, type LucideIcon } from 'lucide-react'
import { css, cx } from 'styled-system/css'
import { Button, Card, Skeleton } from '@/components/ui'
import { STATUS_META } from '../presentation'
import { useTicketStats } from '../queries'

const grid = css({ display: 'grid', gridTemplateColumns: { base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: '3' })
const tile = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
  p: '4',
  textAlign: 'left',
  cursor: 'pointer',
  transitionProperty: 'box-shadow, background',
  transitionDuration: 'fast',
  _hover: { bg: 'bg.elevated' },
  '&[aria-pressed=true]': { boxShadow: '[0 0 0 1px token(colors.accent.default)]' },
})
const tileHead = css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'fg.muted', textStyle: 'ui.md' })
const value = css({ textStyle: 'display.md', fontVariantNumeric: 'tabular-nums', color: 'fg.default' })
const iconTone: Record<'total' | TicketStatus, string> = {
  total: css({ color: 'accent.text' }),
  open: css({ color: 'info.default' }),
  in_progress: css({ color: 'warning.default' }),
  resolved: css({ color: 'success.default' }),
}
const ICONS: Record<'total' | TicketStatus, LucideIcon> = {
  total: Inbox,
  open: CircleDot,
  in_progress: LoaderCircle,
  resolved: CircleCheck,
}
const errorRow = css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3', p: '4', color: 'fg.muted' })

interface StatsCardsProps {
  /** Currently filtered status, highlighted. */
  activeStatus: TicketStatus | ''
  /** Called with the status to filter by, or `''` for all tickets. */
  onSelectStatus: (status: TicketStatus | '') => void
}

/**
 * Dashboard tiles: total tickets and one per status, computed by the API from persisted
 * data. Each tile doubles as a status filter for the list below.
 */
export function StatsCards({ activeStatus, onSelectStatus }: StatsCardsProps) {
  const { data, isPending, isError, refetch, isRefetching } = useTicketStats()

  if (isError) {
    return (
      <Card className={errorRow} role="alert">
        <span>Could not load ticket stats.</span>
        <Button size="md" loading={isRefetching} onClick={() => refetch()}>
          Retry
        </Button>
      </Card>
    )
  }

  const tiles = [
    { key: 'total' as const, label: 'Total tickets', count: data?.total, status: '' as const },
    ...TICKET_STATUSES.map((status) => ({ key: status, label: STATUS_META[status].label, count: data?.byStatus[status], status })),
  ]

  return (
    <section aria-label="Ticket statistics" className={grid}>
      {tiles.map(({ key, label, count, status }) => {
        const Icon = ICONS[key]
        return (
          <Card
            key={key}
            className={tile}
            role="button"
            tabIndex={0}
            aria-pressed={activeStatus === status}
            onClick={() => onSelectStatus(status)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelectStatus(status)
              }
            }}
          >
            <span className={tileHead}>
              {label}
              <Icon size={16} className={iconTone[key]} aria-hidden />
            </span>
            {isPending ? <Skeleton className={css({ h: '8', w: '12' })} /> : <span className={cx(value)}>{count ?? 0}</span>}
          </Card>
        )
      })}
    </section>
  )
}
