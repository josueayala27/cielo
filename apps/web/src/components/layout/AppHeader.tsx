import { LifeBuoy, Plus } from 'lucide-react'
import Link from 'next/link'
import { css } from 'styled-system/css'
import { buttonRecipe } from '@/components/ui'
import { ThemeToggle } from './ThemeToggle'

const header = css({
  position: 'sticky',
  top: '0',
  zIndex: 'chrome',
  bg: 'bg.app/85',
  backdropFilter: '[blur(12px)]',
  borderBottomWidth: '1px',
  borderColor: 'border.default',
})
const inner = css({ display: 'flex', alignItems: 'center', gap: '3', maxW: 'content', mx: 'auto', px: '4', h: '14' })
const brand = css({ display: 'flex', alignItems: 'center', gap: '2', mr: 'auto', color: 'fg.default', textDecoration: 'none', textStyle: 'ui.title' })
const mark = css({ display: 'grid', placeItems: 'center', w: '7', h: '7', borderRadius: 'md', bgImage: 'blaze', color: 'fg.onAccent' })
const product = css({ color: 'fg.subtle', fontWeight: 'normal', hideBelow: 'sm' })

/** Top bar: brand, theme switch and the primary "New ticket" action. */
export function AppHeader() {
  return (
    <header className={header}>
      <div className={inner}>
        <Link href="/" className={brand}>
          <span className={mark}>
            <LifeBuoy size={16} aria-hidden />
          </span>
          SupportDesk <span className={product}>by Cielo</span>
        </Link>
        <ThemeToggle />
        <Link href="/tickets/new" className={buttonRecipe({ variant: 'primary' })}>
          <Plus size={14} aria-hidden />
          New ticket
        </Link>
      </div>
    </header>
  )
}
