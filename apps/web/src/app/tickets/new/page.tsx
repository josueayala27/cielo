import type { Metadata } from 'next'
import { CreateTicketView } from '@/features/tickets/views/CreateTicketView'

export const metadata: Metadata = { title: 'New ticket' }

/** `/tickets/new` */
export default function NewTicketPage() {
  return <CreateTicketView />
}
