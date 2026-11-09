import { TicketDetail } from '@/features/tickets/views/TicketDetail'

/** Intercepts `/tickets/:id` during in-app navigation and shows the ticket in a drawer. */
export default async function TicketDrawer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <TicketDetail id={id} presentation="drawer" />
}
