import { EditTicketView } from '@/features/tickets/views/EditTicketView'

/** Intercepts `/tickets/:id/edit` during in-app navigation and shows the form in a drawer. */
export default async function EditTicketDrawer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <EditTicketView id={id} presentation="drawer" />
}
