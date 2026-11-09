'use client'

import {
  TICKET_PRIORITIES,
  TICKET_SORTS,
  TICKET_STATUSES,
  type ListTicketsParams,
  type TicketPriority,
  type TicketSort,
  type TicketStatus,
} from '@cielo/contracts'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

/** Dashboard layouts: Kanban columns by status, or the paginated table. */
export type TicketView = 'board' | 'list'

/** Filter state as the UI sees it. Empty string means "any". */
export interface TicketFilters {
  view: TicketView
  search: string
  status: TicketStatus | ''
  priority: TicketPriority | ''
  sort: TicketSort
  page: number
}

const pick = <T extends string>(value: string | null, allowed: readonly T[]): T | '' =>
  allowed.includes(value as T) ? (value as T) : ''

/** Reads filters from the URL, ignoring unknown values instead of failing. */
export function parseFilters(params: URLSearchParams): TicketFilters {
  const page = Number.parseInt(params.get('page') ?? '', 10)
  return {
    view: params.get('view') === 'list' ? 'list' : 'board',
    search: params.get('search') ?? '',
    status: pick(params.get('status'), TICKET_STATUSES),
    priority: pick(params.get('priority'), TICKET_PRIORITIES),
    sort: pick(params.get('sort'), TICKET_SORTS) || 'createdAt:desc',
    page: Number.isFinite(page) && page > 0 ? page : 1,
  }
}

/** Converts UI filters to API params, dropping defaults. */
export function toListParams(filters: TicketFilters, limit: number): ListTicketsParams {
  return {
    search: filters.search.trim() || undefined,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    sort: filters.sort,
    page: filters.page,
    limit,
  }
}

/**
 * Filter state stored in the URL query string, so a filtered view can be bookmarked,
 * shared and restored with the back button. Changing any filter resets to page 1.
 * The board is the default view; `?view=list` switches to the table.
 */
export function useTicketFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const filters = useMemo(() => parseFilters(new URLSearchParams(searchParams.toString())), [searchParams])

  const setFilters = useCallback(
    (changes: Partial<TicketFilters>) => {
      const next: TicketFilters = { ...filters, ...changes, page: changes.page ?? 1 }
      const params = new URLSearchParams()
      if (next.view === 'list') params.set('view', 'list')
      if (next.search) params.set('search', next.search)
      if (next.status) params.set('status', next.status)
      if (next.priority) params.set('priority', next.priority)
      if (next.sort !== 'createdAt:desc') params.set('sort', next.sort)
      if (next.page > 1) params.set('page', String(next.page))
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [filters, pathname, router],
  )

  /** Clears filters but keeps the current view. */
  const reset = useCallback(
    () => router.replace(filters.view === 'list' ? `${pathname}?view=list` : pathname, { scroll: false }),
    [filters.view, pathname, router],
  )

  return { filters, setFilters, reset }
}
