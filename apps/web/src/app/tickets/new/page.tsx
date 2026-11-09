import { ticketStatusSchema } from '@cielo/contracts'
import type { Metadata } from 'next'
import { CreateTicketView } from '@/features/tickets/views/CreateTicketView'

export const metadata: Metadata = { title: 'New ticket' }

/** `/tickets/new?status=…`: the optional status pre-selects the form (board "+" buttons). */
export default async function NewTicketPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const parsed = ticketStatusSchema.safeParse(status)
  return <CreateTicketView defaultStatus={parsed.success ? parsed.data : undefined} />
}
