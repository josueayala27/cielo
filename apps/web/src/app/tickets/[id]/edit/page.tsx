import type { Metadata } from 'next'
import { EditTicketView } from '@/features/tickets/views/EditTicketView'

export const metadata: Metadata = { title: 'Edit ticket' }

/** `/tickets/:id/edit` */
export default async function EditTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <EditTicketView id={id} />
}
