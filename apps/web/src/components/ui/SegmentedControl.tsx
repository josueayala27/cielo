'use client'

import type { LucideIcon } from 'lucide-react'
import { useRef, type KeyboardEvent } from 'react'
import { css } from 'styled-system/css'

const root = css({ display: 'inline-flex', gap: '0.5', p: '0.5', borderRadius: 'md', bg: 'bg.subtle' })
const item = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1.5',
  h: 'control.md',
  px: '3',
  borderRadius: 'sm',
  textStyle: 'ui.md',
  color: 'fg.muted',
  cursor: 'pointer',
  transitionProperty: 'background, color',
  transitionDuration: 'fast',
  _hover: { color: 'fg.default' },
  '&[aria-checked=true]': { bg: 'bg.elevated', color: 'fg.default', boxShadow: 'card' },
})

export interface SegmentedOption<T extends string> {
  value: T
  label: string
  icon?: LucideIcon
}

interface SegmentedControlProps<T extends string> {
  label: string
  value: T
  options: SegmentedOption<T>[]
  onChange: (value: T) => void
}

/**
 * Exclusive choice between a few options, as an ARIA radio group: one tab stop,
 * arrow keys move the selection.
 */
export function SegmentedControl<T extends string>({ label, value, options, onChange }: SegmentedControlProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  function onKeyDown(event: KeyboardEvent, index: number) {
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    event.preventDefault()
    const next = (index + step + options.length) % options.length
    onChange(options[next]!.value)
    refs.current[next]?.focus()
  }

  return (
    <div role="radiogroup" aria-label={label} className={root}>
      {options.map((option, index) => {
        const selected = option.value === value
        const Icon = option.icon
        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[index] = node
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            className={item}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {Icon && <Icon size={14} aria-hidden />}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
