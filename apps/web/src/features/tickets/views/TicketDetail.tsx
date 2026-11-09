'use client'

import { TICKET_STATUSES, type Ticket, type TicketStatus } from '@cielo/contracts'
import { FileQuestion, Pencil, WifiOff } from 'lucide-react'
import Link from 'next/link'
import { css, cva } from 'styled-system/css'
import { ViewFrame, useLeaveView, type Presentation } from '@/components/layout/ViewFrame'
import { Button, Card, EmptyState, Select, Skeleton, SkeletonText, buttonRecipe, useToast } from '@/components/ui'
import { ApiError } from '@/lib/api-client'
import { formatDateTime } from '@/lib/format'
import { DeleteTicketButton } from '../components/DeleteTicketButton'
import { PriorityBadge, StatusBadge } from '../components/TicketBadges'
import { STATUS_META } from '../presentation'
import { useTicket, useUpdateTicket } from '../queries'

const layoutRecipe = cva({
  base: { display: 'grid', gap: '4', alignItems: 'start' },
  variants: {
    presentation: {
      page: { gridTemplateColumns: { base: '1fr', md: '2fr 1fr' } },
      drawer: { gridTemplateColumns: '1fr' },
    },
  },
})
const body = css({ p: { base: '4', md: '6' }, display: 'flex', flexDirection: 'column', gap: '3' })
const label = css({ textStyle: 'ui.sm', color: 'fg.subtle' })
const description = css({ textStyle: 'body.md', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' })
const facts = css({ p: '4', display: 'flex', flexDirection: 'column', gap: '4', '& dd': { mt: '1', overflowWrap: 'anywhere' } })
const badges = css({ display: 'flex', gap: '2', flexWrap: 'wrap', mb: '2' })

interface TicketDetailProps {
  id: string
  presentation?: Presentation
}

const BACK = { href: '/', label: 'All tickets' }

/** Ticket detail with quick status change, edit and delete. */
export function TicketDetail({ id, presentation = 'page' }: TicketDetailProps) {
  const leave = useLeaveView(presentation)
  const { data: ticket, isPending, error, refetch } = useTicket(id)
  const layout = layoutRecipe({ presentation })

  // Every branch renders ViewFrame at the root, so in a drawer the same Drawer stays
  // mounted when loading finishes; swapping the root type would remount it and replay
  // the slide-in animation.
  if (isPending) {
    return (
      <ViewFrame
        presentation={presentation}
        title="Loading ticket…"
        heading={<SkeletonText width="min(28rem, 80%)" />}
        back={BACK}
        actions={<Skeleton className={css({ h: 'control.lg', w: '40', borderRadius: 'sm' })} />}
      >
        <DetailSkeleton layout={layout} />
      </ViewFrame>
    )
  }

  if (error) {
    const notFound = error instanceof ApiError && error.isNotFound
    return (
      <ViewFrame presentation={presentation} title="Ticket" back={BACK}>
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
      </ViewFrame>
    )
  }

  return (
    <ViewFrame
      presentation={presentation}
      title={ticket.title}
      back={BACK}
      actions={
        <>
          <DeleteTicketButton ticket={ticket} onDeleted={() => leave('/')} />
          <Link href={`/tickets/${ticket.id}/edit`} className={buttonRecipe({ variant: 'primary' })}>
            <Pencil size={14} aria-hidden /> Edit
          </Link>
        </>
      }
    >
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
    </ViewFrame>
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

const badgeSkeleton = css({ h: 'control.sm', w: '20', borderRadius: 'full' })

/** Same cards and rows as the loaded ticket, with text-height bars. */
function DetailSkeleton({ layout }: { layout: string }) {
  return (
    <div className={layout} aria-busy="true" aria-label="Loading ticket">
      <Card className={body}>
        <div className={badges}>
          <Skeleton className={badgeSkeleton} />
          <Skeleton className={badgeSkeleton} />
        </div>
        <h2 className={label}>Description</h2>
        <p className={description}>
          <SkeletonText />
          <SkeletonText width="70%" />
        </p>
      </Card>
      <Card>
        <dl className={facts}>
          <div>
            <dt className={label}>Status</dt>
            <dd>
              <Skeleton className={css({ h: 'control.xl', w: 'full', borderRadius: 'md' })} />
            </dd>
          </div>
          {['Customer', 'Created', 'Last updated', 'Ticket ID'].map((term) => (
            <div key={term}>
              <dt className={label}>{term}</dt>
              <dd>
                <SkeletonText width="60%" />
              </dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  )
}
