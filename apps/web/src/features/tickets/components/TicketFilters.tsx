'use client'

import { TICKET_PRIORITIES, TICKET_STATUSES, type TicketPriority, type TicketSort, type TicketStatus } from '@cielo/contracts'
import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { css } from 'styled-system/css'
import { Button, Input, Select } from '@/components/ui'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { PRIORITY_META, STATUS_META } from '../presentation'
import type { TicketFilters as Filters } from '../useTicketFilters'

const bar = css({
  display: 'grid',
  gap: '2',
  gridTemplateColumns: { base: '1fr 1fr', md: 'minmax(0, 2fr) repeat(3, minmax(0, 1fr)) auto' },
  alignItems: 'center',
})
const searchWrap = css({ position: 'relative', gridColumn: { base: '1 / -1', md: 'auto' } })
const searchIcon = css({ position: 'absolute', left: '3', top: '[50%]', translate: '[0 -50%]', color: 'fg.subtle', pointerEvents: 'none' })
const searchInput = css({ pl: '9' })
const sortSelect = css({ gridColumn: { base: '1 / -1', sm: 'auto' } })

interface TicketFiltersProps {
  filters: Filters
  onChange: (changes: Partial<Filters>) => void
  onReset: () => void
}

/** Search box plus combinable status, priority and sort controls. */
export function TicketFilters({ filters, onChange, onReset }: TicketFiltersProps) {
  // The input updates instantly; the URL (and the request) only after typing pauses.
  const [search, setSearch] = useState(filters.search)
  const debouncedSearch = useDebouncedValue(search)

  useEffect(() => {
    if (debouncedSearch !== filters.search) onChange({ search: debouncedSearch })
    // Only react to the user's typing, not to `filters` changing elsewhere.
  }, [debouncedSearch])

  // Keep the box in sync when filters are reset or restored from history.
  useEffect(() => setSearch(filters.search), [filters.search])

  const hasFilters = Boolean(filters.search || filters.status || filters.priority || filters.sort !== 'createdAt:desc')

  return (
    <div className={bar} role="search">
      <div className={searchWrap}>
        <Search size={16} className={searchIcon} aria-hidden />
        <Input
          type="search"
          className={searchInput}
          placeholder="Search by title or customer"
          aria-label="Search tickets by title or customer"
          value={search}
          maxLength={100}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <Select aria-label="Filter by status" value={filters.status} onChange={(e) => onChange({ status: e.target.value as TicketStatus | '' })}>
        <option value="">All statuses</option>
        {TICKET_STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_META[status].label}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Filter by priority"
        value={filters.priority}
        onChange={(e) => onChange({ priority: e.target.value as TicketPriority | '' })}
      >
        <option value="">All priorities</option>
        {TICKET_PRIORITIES.map((priority) => (
          <option key={priority} value={priority}>
            {PRIORITY_META[priority].label}
          </option>
        ))}
      </Select>
      <Select className={sortSelect} aria-label="Sort by creation date" value={filters.sort} onChange={(e) => onChange({ sort: e.target.value as TicketSort })}>
        <option value="createdAt:desc">Newest first</option>
        <option value="createdAt:asc">Oldest first</option>
      </Select>
      {hasFilters && (
        <Button variant="ghost" size="xl" icon={X} onClick={onReset} className={css({ gridColumn: { base: '1 / -1', md: 'auto' } })}>
          Clear
        </Button>
      )}
    </div>
  )
}
