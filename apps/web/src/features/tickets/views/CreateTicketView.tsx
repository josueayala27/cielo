'use client'

import type { TicketInput, TicketStatus } from '@cielo/contracts'
import { useRouter } from 'next/navigation'
import { ViewFrame, useLeaveView, type Presentation } from '@/components/layout/ViewFrame'
import { useToast } from '@/components/ui'
import { TicketForm } from '../components/TicketForm'
import { useCreateTicket } from '../queries'

interface CreateTicketViewProps {
  presentation?: Presentation
  defaultStatus?: TicketStatus
}

/** New-ticket form. On success it toasts and opens the created ticket (in place of the form). */
export function CreateTicketView({ presentation = 'page', defaultStatus }: CreateTicketViewProps) {
  const router = useRouter()
  const leave = useLeaveView(presentation)
  const toast = useToast()
  const create = useCreateTicket()

  return (
    <ViewFrame presentation={presentation} title="New ticket" description="Log a customer request." back={{ href: '/', label: 'All tickets' }}>
      <TicketForm
        defaultStatus={defaultStatus}
        submitLabel="Create ticket"
        onCancel={() => leave('/')}
        onSubmit={async (values) => {
          const ticket = await create.mutateAsync(values as TicketInput)
          toast.success('Ticket created')
          // Replace, so going back from the new ticket returns to the board, not the empty form.
          router.replace(`/tickets/${ticket.id}`)
        }}
      />
    </ViewFrame>
  )
}
