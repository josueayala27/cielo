'use client'

import type { CreateTicketInput, ListTicketsParams, Ticket, UpdateTicket } from '@cielo/contracts'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ticketsApi } from './api'

/**
 * Query keys. Everything lives under `['tickets']`, so one invalidation after a write
 * refreshes the list, the detail and the dashboard stats together.
 */
export const ticketKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketKeys.all, 'list'] as const,
  list: (params: ListTicketsParams) => [...ticketKeys.lists(), params] as const,
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
