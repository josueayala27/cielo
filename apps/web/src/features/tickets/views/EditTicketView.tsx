'use client'

import { FileQuestion } from 'lucide-react'
import Link from 'next/link'
import { ViewFrame, useLeaveView, type Presentation } from '@/components/layout/ViewFrame'
import { Button, Card, EmptyState, SkeletonText, buttonRecipe, useToast } from '@/components/ui'
import { ApiError } from '@/lib/api-client'
import { TicketForm, TicketFormSkeleton } from '../components/TicketForm'
import { useTicket, useUpdateTicket } from '../queries'

interface EditTicketViewProps {
  id: string
  presentation?: Presentation
}

/** Edit form: loads the ticket, then PATCHes only the changed fields. */
export function EditTicketView({ id, presentation = 'page' }: EditTicketViewProps) {
  const leave = useLeaveView(presentation)
  const toast = useToast()
  const { data: ticket, isPending, error, refetch } = useTicket(id)
  const update = useUpdateTicket(id)
  const back = { href: `/tickets/${id}`, label: 'Back to ticket' }

  if (isPending) {
    return (
      <ViewFrame presentation={presentation} title="Edit ticket" description={<SkeletonText width="16rem" />} back={back}>
        <TicketFormSkeleton />
      </ViewFrame>
    )
  }

  if (error) {
    const notFound = error instanceof ApiError && error.isNotFound
    return (
      <ViewFrame presentation={presentation} title="Edit ticket" back={back}>
        <Card>
          <EmptyState
            tone={notFound ? 'neutral' : 'danger'}
            icon={FileQuestion}
            title={notFound ? 'Ticket not found' : 'Could not load this ticket'}
            description={error.message}
            actions={
              <>
                {!notFound && <Button onClick={() => refetch()}>Try again</Button>}
                <Link href="/" className={buttonRecipe()}>
                  Back to tickets
                </Link>
              </>
            }
          />
        </Card>
      </ViewFrame>
    )
  }

  return (
    <ViewFrame presentation={presentation} title="Edit ticket" description={ticket.title} back={back}>
      <TicketForm
        ticket={ticket}
        submitLabel="Save changes"
        onCancel={() => leave(`/tickets/${id}`)}
        onSubmit={async (changes) => {
          const changed = Object.keys(changes).length > 0
          if (changed) await update.mutateAsync(changes)
          toast.success(changed ? 'Changes saved' : 'No changes to save')
          leave(`/tickets/${id}`)
        }}
      />
    </ViewFrame>
  )
}
