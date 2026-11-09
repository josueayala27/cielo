import type { LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { cva, cx, type RecipeVariantProps } from 'styled-system/css'
import { Spinner } from './Spinner'

/**
 * Button styles. Exported so links (`next/link`) can look like buttons:
 * `<Link className={buttonRecipe({ variant: 'primary' })} />`.
 */
export const buttonRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5',
    flexShrink: 0,
    borderRadius: 'sm',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    userSelect: 'none',
    textDecoration: 'none',
    transitionProperty: 'background, color, box-shadow, opacity',
    transitionDuration: 'fast',
    transitionTimingFunction: 'standard',
    _disabled: { opacity: 0.4, cursor: 'default', pointerEvents: 'none' },
  },
  variants: {
    variant: {
      // Filled buttons carry the `sheen` highlight over their colour.
      primary: {
        background: '[token(gradients.sheen), token(colors.accent.default)]',
        color: 'fg.onAccent',
        _hover: { background: '[token(gradients.sheen), token(colors.accent.hover)]' },
        _active: { background: 'accent.pressed' },
      },
      secondary: {
        bg: 'bg.subtle',
        color: 'fg.default',
        borderWidth: '1px',
        borderColor: 'border.default',
        _hover: { bg: 'bg.active' },
        _active: { bg: 'bg.hover' },
      },
      ghost: {
        bg: 'transparent',
        color: 'fg.muted',
        _hover: { bg: 'bg.hover', color: 'fg.default' },
        _active: { bg: 'bg.active' },
      },
      danger: {
        background: '[token(gradients.sheen), token(colors.danger.default)]',
        color: 'fg.onColor',
        _hover: { opacity: 0.88 },
        _active: { opacity: 0.76 },
      },
    },
    size: {
      sm: { h: 'control.sm', px: '2', textStyle: 'ui.xs' },
      md: { h: 'control.md', px: '3', textStyle: 'ui.sm' },
      lg: { h: 'control.lg', px: '3', borderRadius: 'md', textStyle: 'ui.md' },
      xl: { h: 'control.xl', px: '4', borderRadius: 'md', textStyle: 'body.sm', fontWeight: 'medium' },
    },
    block: { true: { w: 'full' } },
  },
  defaultVariants: { variant: 'secondary', size: 'lg' },
})

export type ButtonVariants = NonNullable<RecipeVariantProps<typeof buttonRecipe>>

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariants {
  /** Icon shown before the label; replaced by a spinner while `loading`. */
  icon?: LucideIcon
  /** Disables the button and shows a spinner. */
  loading?: boolean
}

/** Action button in four variants (primary, secondary, ghost, danger) and four sizes. */
export function Button({ variant, size, block, icon: Icon, loading = false, disabled, className, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(buttonRecipe({ variant, size, block }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner /> : Icon ? <Icon size={14} aria-hidden /> : null}
      {children}
    </button>
  )
}
