import type { ReactNode } from 'react'
import { css } from 'styled-system/css'

const root = css({ display: 'flex', alignItems: { base: 'flex-start', sm: 'flex-end' }, justifyContent: 'space-between', gap: '3', flexDirection: { base: 'column', sm: 'row' } })
const titleClass = css({ textStyle: 'display.md', color: 'fg.default' })
const descriptionClass = css({ textStyle: 'body.sm', color: 'fg.muted', mt: '1' })
const actionsClass = css({ display: 'flex', gap: '2', flexWrap: 'wrap' })

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  /** Small link above the title, e.g. "← All tickets". */
  eyebrow?: ReactNode
  actions?: ReactNode
}

/** Page title block with optional description and right-aligned actions. */
export function PageHeader({ title, description, eyebrow, actions }: PageHeaderProps) {
  return (
    <div className={root}>
      <div>
        {eyebrow}
        <h1 className={titleClass}>{title}</h1>
        {description && <p className={descriptionClass}>{description}</p>}
      </div>
      {actions && <div className={actionsClass}>{actions}</div>}
    </div>
  )
}
