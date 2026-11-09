import { css, cx } from 'styled-system/css'

const skeleton = css({
  display: 'block',
  borderRadius: 'sm',
  bgGradient: 'to-r',
  gradientFrom: 'bg.subtle',
  gradientVia: 'bg.active',
  gradientTo: 'bg.subtle',
  backgroundSize: '[200% 100%]',
  opacity: 0,
  animation: 'skeleton',
})

/** Loading placeholder block. Size it with `className`. */
export function Skeleton({ className }: { className?: string }) {
  return <span className={cx(skeleton, className)} aria-hidden />
}
