'use client'

import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { css } from 'styled-system/css'
import { IconButton } from './IconButton'

const overlay = css({ position: 'fixed', inset: '0', zIndex: 'modal', bg: 'bg.backdrop', animation: 'fadeIn' })
const panel = css({
  position: 'fixed',
  zIndex: 'modal',
  top: '0',
  right: '0',
  bottom: '0',
  display: 'flex',
  flexDirection: 'column',
  w: 'full',
  maxW: { base: 'full', sm: '[560px]' },
  bg: 'bg.app',
  color: 'fg.default',
  borderLeftWidth: { sm: '1px' },
  borderColor: 'border.default',
  boxShadow: 'popover',
  outline: 'none',
  animation: 'drawerIn',
  '@media (prefers-reduced-motion: reduce)': { animation: 'fadeIn' },
})
const header = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  minH: '14',
  px: '4',
  borderBottomWidth: '1px',
  borderColor: 'border.default',
})
const titleClass = css({ textStyle: 'ui.title', flex: '1', minW: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })
const body = css({ flex: '1', minH: '0', overflowY: 'auto', p: { base: '4', sm: '5' }, display: 'flex', flexDirection: 'column', gap: '4' })

interface DrawerProps {
  title: string
  /** Called when the user dismisses the drawer (Esc, backdrop, close button). */
  onClose: () => void
  /** Extra header controls shown before the close button. */
  actions?: ReactNode
  children: ReactNode
}

/**
 * Right-side sheet (full screen on phones). Built on Radix Dialog for the focus trap,
 * scroll lock and Esc handling. Always open: unmount it, or navigate away, to close.
 */
export function Drawer({ title, onClose, actions, children }: DrawerProps) {
  return (
    <RadixDialog.Root open onOpenChange={(open) => !open && onClose()}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={overlay} />
        <RadixDialog.Content className={panel} aria-describedby={undefined}>
          <header className={header}>
            <RadixDialog.Title className={titleClass}>{title}</RadixDialog.Title>
            {actions}
            <IconButton icon={X} label="Close" onClick={onClose} />
          </header>
          <div className={body}>{children}</div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
