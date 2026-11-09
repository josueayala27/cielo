import type { LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { cva, cx } from 'styled-system/css'

const iconButton = cva({
  base: {
    display: 'inline-grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: 'sm',
    color: 'fg.muted',
    cursor: 'pointer',
    transitionProperty: 'background, color',
    transitionDuration: 'fast',
    _hover: { bg: 'bg.hover', color: 'fg.default' },
    _active: { bg: 'bg.active' },
    _disabled: { opacity: 0.4, pointerEvents: 'none' },
  },
  variants: {
    size: {
      sm: { w: 'control.sm', h: 'control.sm' },
      md: { w: 'control.md', h: 'control.md' },
      lg: { w: 'control.lg', h: 'control.lg' },
    },
  },
  defaultVariants: { size: 'lg' },
})

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: LucideIcon
  /** Accessible name; icon-only buttons must always have one. */
  label: string
  size?: 'sm' | 'md' | 'lg'
}

/** Square, icon-only button with a required accessible label. */
export function IconButton({ icon: Icon, label, size, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button type={type} aria-label={label} title={label} className={cx(iconButton({ size }), className)} {...rest}>
      <Icon size={size === 'sm' ? 12 : 16} aria-hidden />
    </button>
  )
}
