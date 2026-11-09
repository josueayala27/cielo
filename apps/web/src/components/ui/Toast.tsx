'use client'

import { CircleAlert, CircleCheck, X } from 'lucide-react'
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { css } from 'styled-system/css'

type ToastTone = 'success' | 'danger'

interface ToastItem {
  id: number
  tone: ToastTone
  message: string
}

interface ToastApi {
  /** Shows a short confirmation. */
  success(message: string): void
  /** Shows a failure that the user should notice. */
  error(message: string): void
}

const ToastContext = createContext<ToastApi | null>(null)

/** How long a toast stays on screen. */
const TOAST_DURATION_MS = 4000

const region = css({
  position: 'fixed',
  zIndex: 'toast',
  bottom: '4',
  right: '4',
  left: { base: '4', sm: 'auto' },
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  pointerEvents: 'none',
})
const toast = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  minW: { sm: '[280px]' },
  maxW: { sm: '[380px]' },
  p: '3',
  bg: 'bg.elevated',
  color: 'fg.default',
  borderRadius: 'md',
  boxShadow: 'popover',
  textStyle: 'body.sm',
  pointerEvents: 'auto',
  animation: 'toastIn',
  '&[data-tone=success] [data-part=icon]': { color: 'success.default' },
  '&[data-tone=danger] [data-part=icon]': { color: 'danger.default' },
})
const message = css({ flex: '1' })
const close = css({ color: 'fg.subtle', cursor: 'pointer', _hover: { color: 'fg.default' } })

/**
 * Provides {@link useToast}. Toasts render in a polite live region so screen readers
 * announce "Ticket saved" style feedback without moving focus.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => setItems((current) => current.filter((item) => item.id !== id)), [])

  const push = useCallback(
    (tone: ToastTone, text: string) => {
      const id = ++nextId.current
      setItems((current) => [...current.slice(-2), { id, tone, message: text }])
      setTimeout(() => dismiss(id), TOAST_DURATION_MS)
    },
    [dismiss],
  )

  const api = useMemo<ToastApi>(
    () => ({ success: (text) => push('success', text), error: (text) => push('danger', text) }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={region} role="status" aria-live="polite">
        {items.map((item) => {
          const Icon = item.tone === 'success' ? CircleCheck : CircleAlert
          return (
            <div key={item.id} className={toast} data-tone={item.tone}>
              <Icon size={16} data-part="icon" aria-hidden />
              <span className={message}>{item.message}</span>
              <button type="button" className={close} aria-label="Dismiss" onClick={() => dismiss(item.id)}>
                <X size={14} aria-hidden />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

/** Access the toast API. Must be used under {@link ToastProvider}. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) throw new Error('useToast must be used inside <ToastProvider>')
  return api
}
