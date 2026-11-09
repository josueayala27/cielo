'use client'

import { Columns3, List } from 'lucide-react'
import { css } from 'styled-system/css'
import { PageHeader } from '@/components/layout/PageHeader'
import { SegmentedControl, Spinner } from '@/components/ui'
import { Pagination } from '../components/Pagination'
import { StatsCards } from '../components/StatsCards'
import { TicketBoard } from '../components/TicketBoard'
import { TicketFilters } from '../components/TicketFilters'
import { TicketList } from '../components/TicketList'
import { useTicketList, type ColumnParams } from '../queries'
import { toListParams, useTicketFilters, type TicketFilters as Filters, type TicketView } from '../useTicketFilters'

/** Tickets per page in the list, and per "Load more" batch on the board. */
const LIST_PAGE_SIZE = 10
const BOARD_PAGE_SIZE = 20

const section = css({ display: 'flex', flexDirection: 'column', gap: '3' })
const sectionHead = css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3', flexWrap: 'wrap' })
const heading = css({ display: 'flex', alignItems: 'center', gap: '2', textStyle: 'body.title' })

const VIEW_OPTIONS = [
  { value: 'board' as const, label: 'Board', icon: Columns3 },
  { value: 'list' as const, label: 'List', icon: List },
]

/**
 * Home page: stats tiles, then the tickets as a Kanban board (default) or a paginated
 * list. View, search, filters, sort and page all live in the URL.
 */
export function TicketsDashboard() {
  const { filters, setFilters, reset } = useTicketFilters()
  const isBoard = filters.view === 'board'

  return (
    <>
      <PageHeader title="Support tickets" description="Track customer requests from open to resolved." />
      <StatsCards
        activeStatus={isBoard ? null : filters.status}
        // The board already shows every status, so picking one switches to the filtered list.
        onSelectStatus={(status) => setFilters({ status, view: status ? 'list' : filters.view })}
      />

      <section className={section} aria-labelledby="tickets-heading">
        <div className={sectionHead}>
          <h2 id="tickets-heading" className={heading}>
            Tickets
          </h2>
          <SegmentedControl<TicketView> label="Layout" value={filters.view} options={VIEW_OPTIONS} onChange={(view) => setFilters({ view })} />
        </div>
        <TicketFilters filters={filters} showStatus={!isBoard} onChange={setFilters} onReset={reset} />
        {isBoard ? <TicketBoard params={toBoardParams(filters)} /> : <TicketListSection filters={filters} setFilters={setFilters} reset={reset} />}
      </section>
    </>
  )
}

/** Board columns share every filter except status (each column is a status). */
function toBoardParams(filters: Filters): ColumnParams {
  const { status: _status, page: _page, ...rest } = toListParams(filters, BOARD_PAGE_SIZE)
  return rest
}

interface TicketListSectionProps {
  filters: Filters
  setFilters: (changes: Partial<Filters>) => void
  reset: () => void
}

/** Paginated table plus its refresh indicator and pager. */
function TicketListSection({ filters, setFilters, reset }: TicketListSectionProps) {
  const list = useTicketList(toListParams(filters, LIST_PAGE_SIZE))
  const page = list.data

  return (
    <>
      {list.isFetching && !list.isPending && (
        <span className={css({ srOnly: true })} role="status">
          <Spinner label="Updating tickets" />
        </span>
      )}
      <TicketList
        tickets={page?.items}
        isPending={list.isPending}
        isFetching={list.isPlaceholderData}
        error={list.error}
        hasFilters={Boolean(filters.search || filters.status || filters.priority)}
        onRetry={() => list.refetch()}
        onClearFilters={reset}
        skeletonRows={LIST_PAGE_SIZE}
      />
      {page && page.total > 0 && (
        <Pagination page={page.page} totalPages={page.totalPages} total={page.total} limit={page.limit} onPageChange={(next) => setFilters({ page: next })} />
      )}
    </>
  )
}
