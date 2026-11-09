'use client'

import { TICKET_STATUSES, type TicketStatus } from '@cielo/contracts'
import { Inbox } from 'lucide-react'
import { css } from 'styled-system/css'
import { Button, Card, SkeletonText } from '@/components/ui'
import { STATUS_META } from '../presentation'
import { useTicketStats } from '../queries'
import { StatusIcon } from './TicketGlyphs'

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
const totalIcon = css({ color: 'accent.text' })
const errorRow = css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3', p: '4', color: 'fg.muted' })

interface StatsCardsProps {
  /** Currently filtered status (`''` = all), highlighted; `null` highlights nothing. */
  activeStatus: TicketStatus | '' | null
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
              {status ? <StatusIcon status={status} size={16} /> : <Inbox size={16} className={totalIcon} aria-hidden />}
            </span>
            <span className={value}>{isPending ? <SkeletonText width="2ch" /> : (count ?? 0)}</span>
          </Card>
        )
      })}
    </section>
  )
}
