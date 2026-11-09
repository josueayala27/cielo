import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { css } from 'styled-system/css'

const root = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2',
  p: '8',
  minH: '[240px]',
  textAlign: 'center',
  color: 'fg.muted',
})
const mark = css({ display: 'grid', placeItems: 'center', w: '10', h: '10', mb: '1', borderRadius: 'md', bg: 'bg.subtle' })
const markTones = {
  neutral: css({ color: 'fg.muted' }),
  danger: css({ color: 'danger.default', bg: 'danger.muted' }),
}
const titleClass = css({ textStyle: 'ui.title', color: 'fg.default' })
const descriptionClass = css({ textStyle: 'body.sm', color: 'fg.muted', maxW: '[360px]' })
const actionsClass = css({ display: 'flex', gap: '2', mt: '2', flexWrap: 'wrap', justifyContent: 'center' })

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: ReactNode
  /** `danger` for error states. */
  tone?: keyof typeof markTones
  actions?: ReactNode
}

/** Placeholder for empty lists and failed loads: icon, title, description and actions. */
export function EmptyState({ icon: Icon, title, description, tone = 'neutral', actions }: EmptyStateProps) {
  return (
    <div className={root} role={tone === 'danger' ? 'alert' : undefined}>
      {Icon && (
        <span className={`${mark} ${markTones[tone]}`}>
          <Icon size={20} aria-hidden />
        </span>
      )}
      <p className={titleClass}>{title}</p>
      {description && <p className={descriptionClass}>{description}</p>}
      {actions && <div className={actionsClass}>{actions}</div>}
    </div>
  )
}
