'use client'

import { useRouter } from 'next/navigation'
import { BackLink } from '@/components/layout/BackLink'
import { PageHeader } from '@/components/layout/PageHeader'
import { useToast } from '@/components/ui'
import type { TicketInput } from '@cielo/contracts'
import { TicketForm } from '../components/TicketForm'
import { useCreateTicket } from '../queries'

/** New-ticket page: on success, toast and open the created ticket. */
export function CreateTicketView() {
  const router = useRouter()
  const toast = useToast()
  const create = useCreateTicket()

  return (
    <>
      <PageHeader eyebrow={<BackLink href="/">All tickets</BackLink>} title="New ticket" description="Log a customer request." />
      <TicketForm
        submitLabel="Create ticket"
        onCancel={() => router.back()}
        onSubmit={async (values) => {
          const ticket = await create.mutateAsync(values as TicketInput)
          toast.success('Ticket created')
          router.push(`/tickets/${ticket.id}`)
        }}
      />
    </>
  )
}
