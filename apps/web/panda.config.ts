import { defineConfig } from '@pandacss/dev'
import { cieloPreset } from './src/design-system/preset'

/**
 * Panda CSS config. Tokens, semantic tokens and text styles live in the Cielo design
 * system preset; this file only wires it up.
 */
export default defineConfig({
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda', cieloPreset],
  preflight: true,
  strictTokens: true,
  jsxFramework: 'react',
  include: ['./src/**/*.{ts,tsx}'],
  exclude: ['./src/**/*.test.ts'],
  outdir: 'styled-system',
  conditions: {
    extend: {
      light: '[data-theme=light] &',
      dark: '[data-theme=dark] &, :root:not([data-theme]) &',
    },
  },
  globalCss: {
    body: {
      bg: 'bg.app',
      color: 'fg.default',
      fontFamily: 'ui',
      textStyle: 'body.sm',
      WebkitFontSmoothing: 'antialiased',
      minH: 'dvh',
    },
    ':root': { colorScheme: 'dark' },
    ':root[data-theme=light]': { colorScheme: 'light' },
    '::selection': { bg: 'accent.muted' },
    '*:focus-visible': { outline: '2px solid token(colors.accent.default)', outlineOffset: '[1px]' },
  },
})
