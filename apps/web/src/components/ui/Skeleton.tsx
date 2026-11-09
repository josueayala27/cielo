import { css, cx } from 'styled-system/css'

const shimmer = {
  borderRadius: 'sm',
  bgGradient: 'to-r',
  gradientFrom: 'bg.subtle',
  gradientVia: 'bg.active',
  gradientTo: 'bg.subtle',
  backgroundSize: '[200% 100%]',
  opacity: 0,
  animation: 'skeleton',
} as const

const block = css({ display: 'block', ...shimmer })
// A non-breaking space in the inherited font gives the bar the exact height of a real line.
const text = css({ display: 'inline-block', maxW: 'full', color: 'transparent', userSelect: 'none', verticalAlign: 'top', ...shimmer })

/**
 * Loading placeholder block for non-text content (badges, inputs). Size it with
 * `className` using the same size tokens as the real element, so nothing jumps on load.
 */
export function Skeleton({ className }: { className?: string }) {
  return <span className={cx(block, className)} aria-hidden />
}

/**
 * Loading placeholder for one line of text. It takes its height from the surrounding
 * text style, so placed in the same element as the real text it occupies the same box.
 *
 * @param width - CSS width of the bar, e.g. `"60%"` or `"3ch"`.
 */
export function SkeletonText({ width = '100%', className }: { width?: string; className?: string }) {
  return (
    <span className={cx(text, className)} style={{ width }} aria-hidden>
      {' '}
    </span>
  )
}
