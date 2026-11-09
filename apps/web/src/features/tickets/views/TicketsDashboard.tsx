'use client'

import { css } from 'styled-system/css'
import { PageHeader } from '@/components/layout/PageHeader'
import { Spinner } from '@/components/ui'
import { Pagination } from '../components/Pagination'
import { StatsCards } from '../components/StatsCards'
import { TicketFilters } from '../components/TicketFilters'
import { TicketList } from '../components/TicketList'
import { useTicketList } from '../queries'
import { toListParams, useTicketFilters } from '../useTicketFilters'

/** Tickets shown per page. */
const PAGE_SIZE = 10

const section = css({ display: 'flex', flexDirection: 'column', gap: '3' })
const sectionHead = css({ display: 'flex', alignItems: 'center', gap: '2', textStyle: 'body.title' })

/** Home page: stats tiles, filter bar, ticket list and pagination, all driven by URL state. */
export function TicketsDashboard() {
  const { filters, setFilters, reset } = useTicketFilters()
  const list = useTicketList(toListParams(filters, PAGE_SIZE))
  const hasFilters = Boolean(filters.search || filters.status || filters.priority)
  const page = list.data

  return (
    <>
      <PageHeader title="Support tickets" description="Track customer requests from open to resolved." />
      <StatsCards activeStatus={filters.status} onSelectStatus={(status) => setFilters({ status })} />

      <section className={section} aria-labelledby="tickets-heading">
        <h2 id="tickets-heading" className={sectionHead}>
          Tickets {list.isFetching && !list.isPending && <Spinner label="Updating tickets" />}
        </h2>
        <TicketFilters filters={filters} onChange={setFilters} onReset={reset} />
        <TicketList
          tickets={page?.items}
          isPending={list.isPending}
          isFetching={list.isPlaceholderData}
          error={list.error}
          hasFilters={hasFilters}
          onRetry={() => list.refetch()}
          onClearFilters={reset}
        />
        {page && page.total > 0 && (
          <Pagination
            page={page.page}
            totalPages={page.totalPages}
            total={page.total}
            limit={page.limit}
            onPageChange={(next) => setFilters({ page: next })}
          />
        )}
      </section>
    </>
  )
}
