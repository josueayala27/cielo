import { css } from 'styled-system/css'

const spinner = css({
  display: 'inline-block',
  w: '3.5',
  h: '3.5',
  flexShrink: 0,
  borderRadius: 'full',
  borderWidth: '2px',
  borderColor: 'currentColor',
  borderRightColor: 'transparent',
  animation: 'spin 0.7s linear infinite',
})

/** Small indeterminate progress indicator that inherits the text colour. */
export function Spinner({ label = 'Loading' }: { label?: string }) {
  return <span className={spinner} role="status" aria-label={label} />
}
