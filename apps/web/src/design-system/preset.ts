import { definePreset } from '@pandacss/dev'

/**
 * Cielo design system preset.
 *
 * Defines the ink neutral ramp, the sky accent, status hues, radii, control sizes,
 * motion tokens, semantic surface/foreground tokens (dark by default, `data-theme=light`
 * for light) and the `ui` / `body` / `display` text styles.
 */
export const cieloPreset = definePreset({
  name: 'cielo',
  theme: {
    extend: {
      keyframes: {
        'skeleton-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'skeleton-shimmer': { from: { backgroundPosition: '100% 0' }, to: { backgroundPosition: '-100% 0' } },
        'toast-in': { from: { opacity: 0, transform: 'translateY(8px) scale(0.98)' }, to: { opacity: 1, transform: 'none' } },
        'dialog-in': { from: { opacity: 0, transform: 'scale(0.96)' }, to: { opacity: 1, transform: 'scale(1)' } },
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
      },
      tokens: {
        fonts: {
          ui: { value: 'var(--font-inter), Inter, ui-sans-serif, system-ui, -apple-system, sans-serif' },
          display: { value: 'var(--font-inter), Inter, ui-sans-serif, system-ui, -apple-system, sans-serif' },
          mono: { value: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace' },
        },
        colors: {
          // Neutral ramp anchored on the brand neutrals: Wild Sand (50), Iron (200), Woodsmoke (800).
          ink: {
            0: { value: '#ffffff' },
            50: { value: '#f6f6f6' },
            100: { value: '#ebebeb' },
            200: { value: '#cccccc' },
            300: { value: '#a6a6a6' },
            400: { value: '#8a8a8a' },
            500: { value: '#6b6b6b' },
            600: { value: '#3d3d3d' },
            700: { value: '#2c2c2c' },
            750: { value: '#242424' },
            800: { value: '#1a1a1a' },
            850: { value: '#151515' },
            900: { value: '#101010' },
            950: { value: '#0a0a0a' },
          },
          // Sky: the brand accent ("cielo").
          sky: {
            200: { value: '#bae6fd' },
            300: { value: '#7dd3fc' },
            400: { value: '#38bdf8' },
            500: { value: '#0ea5e9' },
            600: { value: '#0284c7' },
            700: { value: '#0369a1' },
            800: { value: '#075985' },
          },
          // Deep blue for accent fills: white labels pass WCAG AA on all three steps.
          blue: { 600: { value: '#2563eb' }, 700: { value: '#1d4ed8' }, 800: { value: '#1e40af' } },
          indigo: { 400: { value: '#818cf8' } },
          green: { 500: { value: '#22c55e' } },
          amber: { 500: { value: '#f59e0b' } },
          red: { 500: { value: '#ef4444' } },
        },
        gradients: {
          // Soft top highlight laid over filled buttons and tiles.
          sheen: { value: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 63.53%)' },
        },
        radii: {
          xs: { value: '4px' },
          sm: { value: '6px' },
          md: { value: '8px' },
          lg: { value: '12px' },
          xl: { value: '16px' },
          full: { value: '9999px' },
        },
        sizes: {
          control: { sm: { value: '24px' }, md: { value: '28px' }, lg: { value: '32px' }, xl: { value: '40px' } },
          content: { value: '1120px' },
        },
        durations: {
          instant: { value: '80ms' },
          fast: { value: '140ms' },
          normal: { value: '220ms' },
          slow: { value: '360ms' },
        },
        easings: {
          standard: { value: 'cubic-bezier(0.2, 0, 0, 1)' },
          emphasized: { value: 'cubic-bezier(0.3, 0, 0, 1)' },
        },
        animations: {
          fadeIn: { value: 'fade-in 140ms cubic-bezier(0.2, 0, 0, 1)' },
          dialogIn: { value: 'dialog-in 220ms cubic-bezier(0.3, 0, 0, 1)' },
          toastIn: { value: 'toast-in 220ms cubic-bezier(0.3, 0, 0, 1)' },
          spin: { value: 'spin 0.7s linear infinite' },
          // Fades in after a short delay so fast loads never flash, then sweeps slowly.
          skeleton: { value: 'skeleton-in 220ms 150ms forwards, skeleton-shimmer 1.6s linear infinite' },
        },
        zIndex: {
          chrome: { value: 20 },
          modal: { value: 30 },
          toast: { value: 60 },
        },
      },
      semanticTokens: {
        colors: {
          bg: {
            app: { value: { base: '{colors.ink.950}', _light: '{colors.ink.50}' } },
            panel: { value: { base: '{colors.ink.850}', _light: '{colors.ink.0}' } },
            elevated: { value: { base: '{colors.ink.800}', _light: '{colors.ink.0}' } },
            subtle: { value: { base: '{colors.ink.750}', _light: '{colors.ink.100}' } },
            hover: { value: { base: '{colors.ink.750}', _light: '{colors.ink.100}' } },
            active: { value: { base: '{colors.ink.700}', _light: '{colors.ink.200}' } },
            input: { value: { base: '{colors.ink.800}', _light: '{colors.ink.100}' } },
            backdrop: { value: { base: 'rgba(0,0,0,0.55)', _light: 'rgba(15,15,20,0.32)' } },
          },
          fg: {
            default: { value: { base: '{colors.ink.50}', _light: '{colors.ink.900}' } },
            muted: { value: { base: '{colors.ink.300}', _light: '{colors.ink.500}' } },
            subtle: { value: { base: '{colors.ink.400}', _light: '{colors.ink.400}' } },
            // White on accent fills in both themes (5.2:1 on blue.600).
            onAccent: { value: '{colors.ink.0}' },
            onColor: { value: '{colors.ink.0}' },
          },
          border: {
            default: { value: { base: '{colors.ink.750}', _light: '{colors.ink.200}' } },
            strong: { value: { base: '{colors.ink.600}', _light: '{colors.ink.300}' } },
          },
          // `default`/`hover`/`pressed` are fills (buttons, borders, focus ring) with white labels.
          // `text` is for links and accent-coloured text: light sky on dark surfaces, deep blue on light.
          accent: {
            default: { value: '{colors.blue.600}' },
            hover: { value: '{colors.blue.700}' },
            pressed: { value: '{colors.blue.800}' },
            text: { value: { base: '{colors.sky.400}', _light: '{colors.blue.700}' } },
            muted: { value: 'color-mix(in srgb, {colors.blue.600} 28%, transparent)' },
            soft: { value: 'color-mix(in srgb, {colors.blue.600} 16%, transparent)' },
          },
          success: {
            default: { value: '{colors.green.500}' },
            muted: { value: 'color-mix(in srgb, {colors.green.500} 18%, transparent)' },
          },
          warning: {
            default: { value: '{colors.amber.500}' },
            muted: { value: 'color-mix(in srgb, {colors.amber.500} 18%, transparent)' },
          },
          danger: {
            default: { value: '{colors.red.500}' },
            muted: { value: 'color-mix(in srgb, {colors.red.500} 18%, transparent)' },
          },
          info: {
            default: { value: '{colors.indigo.400}' },
            muted: { value: 'color-mix(in srgb, {colors.indigo.400} 20%, transparent)' },
          },
        },
        gradients: {
          graphite: {
            value: {
              base: 'linear-gradient(160deg, #202020 0%, #141414 55%, #0e0e0e 100%)',
              _light: 'linear-gradient(160deg, #ffffff 0%, #f6f6f6 55%, #ededed 100%)',
            },
          },
        },
        shadows: {
          popover: {
            value: {
              base: '0 0 0 1px {colors.ink.700}, 0 12px 32px -8px rgba(0,0,0,0.6), 0 4px 12px -4px rgba(0,0,0,0.5)',
              _light: '0 0 0 1px {colors.ink.200}, 0 12px 32px -8px rgba(0,0,0,0.18)',
            },
          },
          card: {
            value: {
              base: '0 0 0 1px {colors.ink.750}',
              _light: '0 0 0 1px {colors.ink.200}, 0 1px 2px rgba(0,0,0,0.04)',
            },
          },
        },
      },
      textStyles: {
        ui: {
          xs: { value: { fontSize: '11px', lineHeight: '16px', fontWeight: '500', letterSpacing: '0.005em' } },
          sm: { value: { fontSize: '12px', lineHeight: '16px', fontWeight: '500' } },
          md: { value: { fontSize: '13px', lineHeight: '20px', fontWeight: '500' } },
          label: { value: { fontSize: '11px', lineHeight: '16px', fontWeight: '600', letterSpacing: '0.01em' } },
          title: { value: { fontSize: '14px', lineHeight: '20px', fontWeight: '600', letterSpacing: '-0.005em' } },
        },
        display: {
          md: { value: { fontFamily: 'display', fontWeight: '500', fontSize: 'clamp(24px, 2.6vw, 32px)', lineHeight: '1.15', letterSpacing: '-0.025em' } },
        },
        body: {
          md: { value: { fontSize: '16px', lineHeight: '1.6', fontWeight: '400' } },
          sm: { value: { fontSize: '14px', lineHeight: '1.55', fontWeight: '400' } },
          title: { value: { fontSize: '18px', lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.01em' } },
          eyebrow: { value: { fontSize: '13px', lineHeight: '1', fontWeight: '600', letterSpacing: '0.02em' } },
        },
      },
    },
  },
})
