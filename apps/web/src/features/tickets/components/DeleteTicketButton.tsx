'use client'

import type { Ticket } from '@cielo/contracts'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button, Dialog, DialogClose, useToast } from '@/components/ui'
import { ApiError } from '@/lib/api-client'
import { useDeleteTicket } from '../queries'

interface DeleteTicketButtonProps {
  ticket: Ticket
  /** Runs after the ticket was deleted, e.g. to navigate away. */
  onDeleted: () => void
}

/** Delete button guarded by a confirmation dialog. */
export function DeleteTicketButton({ ticket, onDeleted }: DeleteTicketButtonProps) {
  const [open, setOpen] = useState(false)
  const toast = useToast()
  const deletion = useDeleteTicket()

  async function confirm() {
    try {
      await deletion.mutateAsync(ticket.id)
      setOpen(false)
      toast.success('Ticket deleted')
      onDeleted()
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Could not delete the ticket.')
    }
  }

  return (
    <>
      <Button variant="ghost" icon={Trash2} onClick={() => setOpen(true)}>
        Delete
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => !deletion.isPending && setOpen(next)}
        role="alertdialog"
        title="Delete this ticket?"
        description={
          <>
            “{ticket.title}” will be permanently removed. This cannot be undone.
          </>
        }
        footer={
          <>
            <DialogClose asChild>
              <Button disabled={deletion.isPending}>Cancel</Button>
            </DialogClose>
            <Button variant="danger" icon={Trash2} loading={deletion.isPending} onClick={confirm}>
              Delete ticket
            </Button>
          </>
        }
      />
    </>
  )
}
