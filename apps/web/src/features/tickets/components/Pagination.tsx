import { ChevronLeft, ChevronRight } from 'lucide-react'
import { css } from 'styled-system/css'
import { Button } from '@/components/ui'

const nav = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '3',
  flexWrap: 'wrap',
  pt: '3',
  color: 'fg.muted',
  textStyle: 'ui.md',
})
const buttons = css({ display: 'flex', gap: '2' })

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

/** "Showing 11–20 of 42" with previous/next buttons. */
export function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)
  return (
    <nav className={nav} aria-label="Pagination">
      <span aria-live="polite">
        Showing {from}–{to} of {total} · Page {page} of {totalPages}
      </span>
      <div className={buttons}>
        <Button size="lg" icon={ChevronLeft} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button size="lg" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
          <ChevronRight size={14} aria-hidden />
        </Button>
      </div>
    </nav>
  )
}
