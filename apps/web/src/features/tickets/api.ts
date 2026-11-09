import type { CreateTicketInput, ListTicketsParams, Ticket, TicketPage, TicketStats, UpdateTicket } from '@cielo/contracts'
import { apiRequest } from '@/lib/api-client'

/** Thin, typed wrappers over the SupportDesk REST contract. */
export const ticketsApi = {
  list: (params: ListTicketsParams, signal?: AbortSignal) =>
    apiRequest<TicketPage>('/api/tickets', { query: params as Record<string, string | number | undefined>, signal }),
  get: (id: string, signal?: AbortSignal) => apiRequest<Ticket>(`/api/tickets/${encodeURIComponent(id)}`, { signal }),
  create: (input: CreateTicketInput) => apiRequest<Ticket>('/api/tickets', { method: 'POST', body: input }),
  update: (id: string, changes: UpdateTicket) =>
    apiRequest<Ticket>(`/api/tickets/${encodeURIComponent(id)}`, { method: 'PATCH', body: changes }),
  remove: (id: string) => apiRequest<void>(`/api/tickets/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  stats: (signal?: AbortSignal) => apiRequest<TicketStats>('/api/stats', { signal }),
}
