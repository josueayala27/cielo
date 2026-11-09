import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { css, cva, cx } from 'styled-system/css'

/** Shared look of text inputs, textareas and selects (filled field, accent border on focus). */
export const controlRecipe = cva({
  base: {
    display: 'block',
    w: 'full',
    minW: '0',
    px: '3',
    borderRadius: 'md',
    bg: 'bg.input',
    color: 'fg.default',
    borderWidth: '1px',
    borderColor: 'transparent',
    textStyle: 'body.sm',
    outline: 'none',
    transitionProperty: 'border-color',
    transitionDuration: 'fast',
    _placeholder: { color: 'fg.subtle' },
    _hover: { borderColor: 'border.default' },
    _focusVisible: { outline: 'none', borderColor: 'accent.default', _hover: { borderColor: 'accent.default' } },
    _disabled: { opacity: 0.4, pointerEvents: 'none' },
    '&[aria-invalid=true]': { borderColor: 'danger.default', _hover: { borderColor: 'danger.default' } },
  },
  variants: {
    kind: {
      input: { h: 'control.xl' },
      textarea: { py: '2', minH: '32', resize: 'vertical' },
      select: {
        h: 'control.xl',
        pr: '8',
        appearance: 'none',
        cursor: 'pointer',
        // Chevron drawn with two gradients so it follows the theme colour.
        backgroundImage:
          '[linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%)]',
        backgroundPosition: '[calc(100% - 16px) 50%, calc(100% - 11px) 50%]',
        backgroundSize: '[5px 5px, 5px 5px]',
        backgroundRepeat: 'no-repeat',
      },
    },
  },
})

/** Single-line text input. Pass `aria-invalid` to show the error border. */
export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(controlRecipe({ kind: 'input' }), className)} {...rest} />
}

/** Multi-line text input, vertically resizable. */
export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(controlRecipe({ kind: 'textarea' }), className)} {...rest} />
}

/** Native select: accessible and mobile friendly by default, styled like the other fields. */
export function Select({ className, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cx(controlRecipe({ kind: 'select' }), className)} {...rest} />
}

const field = css({ display: 'flex', flexDirection: 'column', gap: '1.5', minW: '0' })
const head = css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2' })
const labelClass = css({ textStyle: 'ui.md', color: 'fg.muted' })
const asideClass = css({ textStyle: 'ui.xs', color: 'fg.subtle', fontVariantNumeric: 'tabular-nums' })
const hintClass = css({ textStyle: 'ui.sm', fontWeight: 'normal', color: 'fg.subtle' })
const errorClass = css({ textStyle: 'ui.sm', color: 'danger.default' })

/** Ids and state a {@link FormField} hands to its control. */
export interface FieldControlProps {
  id: string
  'aria-describedby': string | undefined
  'aria-invalid': boolean | undefined
}

interface FormFieldProps {
  /** Id of the control, used for the label's `for`. */
  id: string
  label: string
  hint?: string
  error?: string
  /** Shown at the end of the label line, e.g. a character counter. */
  aside?: string
  /** Renders the control with the accessibility props already wired. */
  children: (props: FieldControlProps) => ReactNode
}

/**
 * Stacked form field: label above the control, hint or error below it. The error is
 * announced (`role="alert"`) and linked to the control through `aria-describedby`.
 */
export function FormField({ id, label, hint, error, aside, children }: FormFieldProps) {
  const messageId = `${id}-message`
  return (
    <div className={field}>
      <div className={head}>
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
        {aside && <span className={asideClass}>{aside}</span>}
      </div>
      {children({ id, 'aria-describedby': error || hint ? messageId : undefined, 'aria-invalid': error ? true : undefined })}
      {error ? (
        <p id={messageId} className={errorClass} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className={hintClass}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
