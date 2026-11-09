'use client'

import * as RadixDialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'
import { css } from 'styled-system/css'

const overlay = css({
  position: 'fixed',
  inset: '0',
  zIndex: 'modal',
  bg: 'bg.backdrop',
  animation: 'fadeIn',
})
const content = css({
  position: 'fixed',
  zIndex: 'modal',
  top: '[50%]',
  left: '[50%]',
  translate: '[-50% -50%]',
  w: '[calc(100vw - 32px)]',
  maxW: '[420px]',
  maxH: '[calc(100dvh - 32px)]',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  p: '5',
  bg: 'bg.elevated',
  color: 'fg.default',
  borderRadius: 'lg',
  boxShadow: 'popover',
  outline: 'none',
  animation: 'dialogIn',
})
const titleClass = css({ textStyle: 'body.title' })
const descriptionClass = css({ textStyle: 'body.sm', color: 'fg.muted' })
const footer = css({ display: 'flex', justifyContent: 'flex-end', gap: '2', mt: '3', flexWrap: 'wrap' })

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  /** `alertdialog` for confirmations that interrupt the user. */
  role?: 'dialog' | 'alertdialog'
  /** Buttons rendered at the bottom-right. */
  footer?: ReactNode
  children?: ReactNode
}

/**
 * Modal dialog. Radix owns the focus trap, focus return, scroll lock, Esc handling
 * and `aria-*` wiring; this component only adds the design-system look.
 */
export function Dialog({ open, onOpenChange, title, description, role = 'dialog', footer: actions, children }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={overlay} />
        <RadixDialog.Content className={content} role={role}>
          <RadixDialog.Title className={titleClass}>{title}</RadixDialog.Title>
          {description ? (
            <RadixDialog.Description className={descriptionClass}>{description}</RadixDialog.Description>
          ) : (
            <RadixDialog.Description className={css({ srOnly: true })}>{title}</RadixDialog.Description>
          )}
          {children}
          {actions && <div className={footer}>{actions}</div>}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

/** Closes the surrounding {@link Dialog} when its child is pressed. */
export const DialogClose = RadixDialog.Close
