'use client'

import type { CreateTicketInput, ListTicketsParams, Ticket, TicketStatus, UpdateTicket } from '@cielo/contracts'
import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ticketsApi } from './api'

/**
 * Query keys. Everything lives under `['tickets']`, so one invalidation after a write
 * refreshes the list, the detail and the dashboard stats together.
 */
export const ticketKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketKeys.all, 'list'] as const,
  list: (params: ListTicketsParams) => [...ticketKeys.lists(), params] as const,
  column: (status: TicketStatus, params: ColumnParams) => [...ticketKeys.lists(), 'column', status, params] as const,
  detail: (id: string) => [...ticketKeys.all, 'detail', id] as const,
  stats: () => [...ticketKeys.all, 'stats'] as const,
}

/** Paginated, filtered list. Keeps the previous page on screen while the next one loads. */
export function useTicketList(params: ListTicketsParams) {
  return useQuery({
    queryKey: ticketKeys.list(params),
    queryFn: ({ signal }) => ticketsApi.list(params, signal),
    placeholderData: keepPreviousData,
  })
}

/** Filters shared by every board column; each column adds its own status. */
export type ColumnParams = Omit<ListTicketsParams, 'status' | 'page'>

/**
 * One Kanban column: tickets with `status`, loaded page by page ("Load more").
 * `total` on any page is the column's full count for the current filters.
 */
export function useTicketColumn(status: TicketStatus, params: ColumnParams) {
  return useInfiniteQuery({
    queryKey: ticketKeys.column(status, params),
    queryFn: ({ pageParam, signal }) => ticketsApi.list({ ...params, status, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    placeholderData: keepPreviousData,
  })
}

/** One ticket by id. */
export function useTicket(id: string) {
  return useQuery({ queryKey: ticketKeys.detail(id), queryFn: ({ signal }) => ticketsApi.get(id, signal) })
}

/** Totals per status for the dashboard. */
export function useTicketStats() {
  return useQuery({ queryKey: ticketKeys.stats(), queryFn: ({ signal }) => ticketsApi.stats(signal) })
}

/** Shared success handler: cache the fresh ticket and refetch lists and stats. */
function useSyncAfterWrite() {
  const queryClient = useQueryClient()
  return (ticket?: Ticket) => {
    if (ticket) queryClient.setQueryData(ticketKeys.detail(ticket.id), ticket)
    return queryClient.invalidateQueries({ queryKey: ticketKeys.all, refetchType: 'active' })
  }
}

export function useCreateTicket() {
  const sync = useSyncAfterWrite()
  return useMutation({ mutationFn: (input: CreateTicketInput) => ticketsApi.create(input), onSuccess: (ticket) => sync(ticket) })
}

export function useUpdateTicket(id: string) {
  const sync = useSyncAfterWrite()
  return useMutation({ mutationFn: (changes: UpdateTicket) => ticketsApi.update(id, changes), onSuccess: (ticket) => sync(ticket) })
}

/** Saves a board move (status and/or position). Lists and stats refetch before it resolves. */
export function useMoveTicket() {
  const sync = useSyncAfterWrite()
  return useMutation({
    mutationFn: ({ id, status, position }: { id: string; status: TicketStatus; position: number }) =>
      ticketsApi.update(id, { status, position }),
    onSuccess: (ticket) => sync(ticket),
  })
}

export function useDeleteTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ticketsApi.remove(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ticketKeys.detail(id) })
      return queryClient.invalidateQueries({ queryKey: ticketKeys.all, refetchType: 'active' })
    },
  })
}
