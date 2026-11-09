'use client'

import { FileQuestion } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { css } from 'styled-system/css'
import { BackLink } from '@/components/layout/BackLink'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, Card, EmptyState, Skeleton, buttonRecipe, useToast } from '@/components/ui'
import { ApiError } from '@/lib/api-client'
import { TicketForm } from '../components/TicketForm'
import { useTicket, useUpdateTicket } from '../queries'

/** Edit page: loads the ticket, then PATCHes only the changed fields. */
export function EditTicketView({ id }: { id: string }) {
  const router = useRouter()
  const toast = useToast()
  const { data: ticket, isPending, error, refetch } = useTicket(id)
  const update = useUpdateTicket(id)

  if (isPending) return <Skeleton className={css({ h: '[480px]', w: 'full', borderRadius: 'lg' })} />

  if (error) {
    const notFound = error instanceof ApiError && error.isNotFound
    return (
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
    )
  }

  return (
    <>
      <PageHeader eyebrow={<BackLink href={`/tickets/${id}`}>Back to ticket</BackLink>} title="Edit ticket" description={ticket.title} />
      <TicketForm
        ticket={ticket}
        submitLabel="Save changes"
        onCancel={() => router.push(`/tickets/${id}`)}
        onSubmit={async (changes) => {
          if (Object.keys(changes).length > 0) await update.mutateAsync(changes)
          toast.success(Object.keys(changes).length > 0 ? 'Changes saved' : 'No changes to save')
          router.push(`/tickets/${id}`)
        }}
      />
    </>
  )
}
