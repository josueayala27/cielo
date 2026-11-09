import type { Metadata } from 'next'
import { TicketDetail } from '@/features/tickets/views/TicketDetail'

export const metadata: Metadata = { title: 'Ticket' }

/** `/tickets/:id` */
export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <TicketDetail id={id} />
}
