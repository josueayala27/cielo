import type { HTMLAttributes } from 'react'
import { css, cx } from 'styled-system/css'

const card = css({ bg: 'bg.panel', borderRadius: 'lg', boxShadow: 'card' })

/** Raised panel surface used for sections and stat tiles. */
export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(card, className)} {...rest} />
}
