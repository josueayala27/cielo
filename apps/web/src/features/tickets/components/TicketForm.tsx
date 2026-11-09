'use client'

import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  ticketInputSchema,
  type Ticket,
  type TicketInput,
} from '@cielo/contracts'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useForm, type FieldPath } from 'react-hook-form'
import type { z } from 'zod'
import { css } from 'styled-system/css'
import { Button, Card, FormField, Input, Select, Textarea } from '@/components/ui'
import { ApiError } from '@/lib/api-client'
import { PRIORITY_META, STATUS_META } from '../presentation'

type FormValues = z.input<typeof ticketInputSchema>

const EMPTY: FormValues = {
  title: '',
  description: '',
  customerName: '',
  customerEmail: '',
  priority: 'medium',
  status: 'open',
}

const form = css({ display: 'flex', flexDirection: 'column', gap: '5', p: { base: '4', md: '6' } })
const twoColumns = css({ display: 'grid', gap: '5', gridTemplateColumns: { base: '1fr', sm: '1fr 1fr' } })
const actions = css({ display: 'flex', justifyContent: 'flex-end', gap: '2', flexWrap: 'wrap', pt: '2' })
const formError = css({ p: '3', borderRadius: 'md', bg: 'danger.muted', color: 'fg.default', textStyle: 'body.sm' })

interface TicketFormProps {
  /** Ticket being edited; omit to create. */
  ticket?: Ticket
  submitLabel: string
  /**
   * Persists the values. For edits only the changed fields are passed.
   * Rejecting with an {@link ApiError} that has field issues shows them under the fields.
   */
  onSubmit: (values: Partial<TicketInput>) => Promise<unknown>
  onCancel: () => void
}

/**
 * Create/edit form. Validates on submit, then live, with the same Zod schema the API
 * uses, so the browser and the server agree on every rule. Server-side field errors
 * (422) are mapped back onto the matching inputs.
 */
export function TicketForm({ ticket, submitLabel, onSubmit, onCancel }: TicketFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<FormValues, unknown, TicketInput>({
    resolver: zodResolver(ticketInputSchema),
    defaultValues: ticket ? pickInput(ticket) : EMPTY,
    // First validation on submit, then live while the user fixes errors. Validating on blur
    // inserts error text that shifts the submit button away from a click already in progress.
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const submit = handleSubmit(async (values) => {
    const payload = ticket ? onlyDirty(values, dirtyFields) : values
    try {
      await onSubmit(payload)
    } catch (error) {
      if (!(error instanceof ApiError)) throw error
      for (const issue of error.issues) {
        if (issue.field in EMPTY) setError(issue.field as FieldPath<FormValues>, { message: issue.message }, { shouldFocus: true })
      }
      setError('root', { message: error.message })
    }
  })

  const titleLength = watch('title')?.length ?? 0
  const descriptionLength = watch('description')?.length ?? 0

  return (
    <Card>
      <form className={form} onSubmit={submit} noValidate>
        {errors.root?.message && (
          <p className={formError} role="alert">
            {errors.root.message}
          </p>
        )}

        <FormField id="title" label="Title" error={errors.title?.message} aside={`${titleLength}/100`}>
          {(field) => <Input {...field} {...register('title')} placeholder="Short summary of the problem" autoFocus={!ticket} />}
        </FormField>

        <FormField id="description" label="Description" error={errors.description?.message} aside={`${descriptionLength}/1000`} hint="At least 10 characters.">
          {(field) => <Textarea {...field} {...register('description')} rows={5} placeholder="What happened, and what did the customer expect?" />}
        </FormField>

        <div className={twoColumns}>
          <FormField id="customerName" label="Customer name" error={errors.customerName?.message}>
            {(field) => <Input {...field} {...register('customerName')} autoComplete="name" />}
          </FormField>
          <FormField id="customerEmail" label="Customer email" error={errors.customerEmail?.message}>
            {(field) => <Input {...field} {...register('customerEmail')} type="email" inputMode="email" autoComplete="email" />}
          </FormField>
        </div>

        <div className={twoColumns}>
          <FormField id="priority" label="Priority" error={errors.priority?.message}>
            {(field) => (
              <Select {...field} {...register('priority')}>
                {TICKET_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {PRIORITY_META[priority].label}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
          <FormField id="status" label="Status" error={errors.status?.message}>
            {(field) => (
              <Select {...field} {...register('status')}>
                {TICKET_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_META[status].label}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
        </div>

        <div className={actions}>
          <Button size="xl" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="xl" variant="primary" type="submit" icon={Save} loading={isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  )
}

/** The writable fields of a ticket, used as the edit form's defaults. */
function pickInput({ title, description, customerName, customerEmail, priority, status }: Ticket): FormValues {
  return { title, description, customerName, customerEmail, priority, status }
}

/** Keeps only the fields the user changed, so a PATCH never overwrites untouched data. */
function onlyDirty(values: TicketInput, dirty: Partial<Record<keyof FormValues, boolean | undefined>>): Partial<TicketInput> {
  return Object.fromEntries(Object.entries(values).filter(([key]) => dirty[key as keyof FormValues])) as Partial<TicketInput>
}
