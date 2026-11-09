'use client'

import { TICKET_STATUSES, type Ticket, type TicketStatus } from '@cielo/contracts'
import { FileQuestion, Pencil, WifiOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { css } from 'styled-system/css'
import { BackLink } from '@/components/layout/BackLink'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, Card, EmptyState, Select, Skeleton, buttonRecipe, useToast } from '@/components/ui'
import { ApiError } from '@/lib/api-client'
import { formatDateTime } from '@/lib/format'
import { DeleteTicketButton } from '../components/DeleteTicketButton'
import { PriorityBadge, StatusBadge } from '../components/TicketBadges'
import { STATUS_META } from '../presentation'
import { useTicket, useUpdateTicket } from '../queries'

const layout = css({ display: 'grid', gap: '4', gridTemplateColumns: { base: '1fr', md: '2fr 1fr' }, alignItems: 'start' })
const body = css({ p: { base: '4', md: '6' }, display: 'flex', flexDirection: 'column', gap: '3' })
const label = css({ textStyle: 'ui.sm', color: 'fg.subtle' })
const description = css({ textStyle: 'body.md', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' })
const facts = css({ p: '4', display: 'flex', flexDirection: 'column', gap: '4', '& dd': { mt: '1', overflowWrap: 'anywhere' } })
const badges = css({ display: 'flex', gap: '2', flexWrap: 'wrap', mb: '2' })

/** Ticket detail page with quick status change, edit and delete. */
export function TicketDetail({ id }: { id: string }) {
  const router = useRouter()
  const { data: ticket, isPending, error, refetch } = useTicket(id)

  if (isPending) return <DetailSkeleton />

  if (error) {
    const notFound = error instanceof ApiError && error.isNotFound
    return (
      <Card>
        <EmptyState
          tone={notFound ? 'neutral' : 'danger'}
          icon={notFound ? FileQuestion : WifiOff}
          title={notFound ? 'Ticket not found' : 'Could not load this ticket'}
          description={notFound ? 'It may have been deleted, or the link is wrong.' : error.message}
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
      <PageHeader
        eyebrow={<BackLink href="/">All tickets</BackLink>}
        title={ticket.title}
        actions={
          <>
            <DeleteTicketButton ticket={ticket} onDeleted={() => router.push('/')} />
            <Link href={`/tickets/${ticket.id}/edit`} className={buttonRecipe({ variant: 'primary' })}>
              <Pencil size={14} aria-hidden /> Edit
            </Link>
          </>
        }
      />
      <div className={layout}>
        <Card className={body}>
          <div className={badges}>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <h2 className={label}>Description</h2>
          <p className={description}>{ticket.description}</p>
        </Card>
        <Card>
          <dl className={facts}>
            <div>
              <dt className={label}>Status</dt>
              <dd>
                <StatusSelect ticket={ticket} />
              </dd>
            </div>
            <div>
              <dt className={label}>Customer</dt>
              <dd>{ticket.customerName}</dd>
              <dd>
                <a href={`mailto:${ticket.customerEmail}`} className={css({ color: 'accent.text' })}>
                  {ticket.customerEmail}
                </a>
              </dd>
            </div>
            <div>
              <dt className={label}>Created</dt>
              <dd>
                <time dateTime={ticket.createdAt}>{formatDateTime(ticket.createdAt)}</time>
              </dd>
            </div>
            <div>
              <dt className={label}>Last updated</dt>
              <dd>
                <time dateTime={ticket.updatedAt}>{formatDateTime(ticket.updatedAt)}</time>
              </dd>
            </div>
            <div>
              <dt className={label}>Ticket ID</dt>
              <dd className={css({ fontFamily: 'mono', textStyle: 'ui.sm' })}>{ticket.id}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </>
  )
}

/** Inline status change: one PATCH with just `status`. */
function StatusSelect({ ticket }: { ticket: Ticket }) {
  const toast = useToast()
  const update = useUpdateTicket(ticket.id)

  async function change(status: TicketStatus) {
    try {
      await update.mutateAsync({ status })
      toast.success(`Status changed to ${STATUS_META[status].label}`)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Could not change the status.')
    }
  }

  return (
    <Select aria-label="Change status" value={ticket.status} disabled={update.isPending} onChange={(e) => change(e.target.value as TicketStatus)}>
      {TICKET_STATUSES.map((status) => (
        <option key={status} value={status}>
          {STATUS_META[status].label}
        </option>
      ))}
    </Select>
  )
}

function DetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading ticket" className={css({ display: 'flex', flexDirection: 'column', gap: '6' })}>
      <Skeleton className={css({ h: '8', w: '[60%]' })} />
      <div className={layout}>
        <Card className={body}>
          <Skeleton className={css({ h: '5', w: '40' })} />
          <Skeleton className={css({ h: '4', w: 'full' })} />
          <Skeleton className={css({ h: '4', w: '[80%]' })} />
        </Card>
        <Card className={body}>
          <Skeleton className={css({ h: '10', w: 'full' })} />
          <Skeleton className={css({ h: '4', w: '[70%]' })} />
        </Card>
      </div>
    </div>
  )
}
