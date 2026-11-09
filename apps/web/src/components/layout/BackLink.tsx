import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { css } from 'styled-system/css'

const link = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1',
  mb: '2',
  textStyle: 'ui.md',
  color: 'fg.muted',
  textDecoration: 'none',
  _hover: { color: 'fg.default' },
})

/** "← Back" link used above page titles. */
export function BackLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className={link}>
      <ArrowLeft size={14} aria-hidden />
      {children}
    </Link>
  )
}
