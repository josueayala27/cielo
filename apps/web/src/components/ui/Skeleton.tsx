import { css, cx } from 'styled-system/css'

// Fades in after a short delay so fast loads never flash, then sweeps slowly.
const skeleton = css({
  display: 'block',
  borderRadius: 'sm',
  bgGradient: 'to-r',
  gradientFrom: 'bg.subtle',
  gradientVia: 'bg.active',
  gradientTo: 'bg.subtle',
  backgroundSize: '[200% 100%]',
  opacity: 0,
  animation: 'skeleton-in token(durations.normal) 150ms forwards, skeleton-shimmer 1.6s linear infinite',
})

/** Loading placeholder block. Size it with `className`. */
export function Skeleton({ className }: { className?: string }) {
  return <span className={cx(skeleton, className)} aria-hidden />
}
