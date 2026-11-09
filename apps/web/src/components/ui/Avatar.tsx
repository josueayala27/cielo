import { css } from 'styled-system/css'

// Tints that read on both themes; text stays fg.default for contrast.
const TINTS = [
  css({ bg: 'info.muted' }),
  css({ bg: 'success.muted' }),
  css({ bg: 'warning.muted' }),
  css({ bg: 'danger.muted' }),
  css({ bg: 'accent.muted' }),
]

const avatar = css({
  display: 'inline-grid',
  placeItems: 'center',
  flexShrink: 0,
  w: '5',
  h: '5',
  borderRadius: 'full',
  color: 'fg.default',
  fontSize: '[9px]',
  fontWeight: 'semibold',
  letterSpacing: '[0.02em]',
})

/** Up to two initials: "María Gómez" → "MG". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : '')).toUpperCase()
}

/** Stable tint per name, so the same person always gets the same colour. */
function tintFor(name: string): string {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return TINTS[Math.abs(hash) % TINTS.length]!
}

/** Initials avatar for a person without a photo. Decorative: pair it with the visible name. */
export function Avatar({ name }: { name: string }) {
  return (
    <span className={`${avatar} ${tintFor(name)}`} aria-hidden>
      {initials(name)}
    </span>
  )
}
