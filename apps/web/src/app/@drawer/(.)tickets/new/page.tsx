import { ticketStatusSchema } from '@cielo/contracts'
import { CreateTicketView } from '@/features/tickets/views/CreateTicketView'

/** Intercepts `/tickets/new` during in-app navigation and shows the form in a drawer. */
export default async function NewTicketDrawer({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const parsed = ticketStatusSchema.safeParse((await searchParams).status)
  return <CreateTicketView presentation="drawer" defaultStatus={parsed.success ? parsed.data : undefined} />
}
