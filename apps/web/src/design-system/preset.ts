import { definePreset } from '@pandacss/dev'

/**
 * Cielo design system preset.
 *
 * Defines the ink neutral ramp, the orange accent, status hues, radii, control sizes,
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
          orange: {
            400: { value: '#fe8224' },
            500: { value: '#fe5900' },
            600: { value: '#e54f00' },
            700: { value: '#c84300' },
            800: { value: '#97271b' },
          },
          corvette: { 200: { value: '#ffd9a8' } },
          blue: { 400: { value: '#3daaff' }, 500: { value: '#0099ff' } },
          green: { 500: { value: '#22c55e' } },
          amber: { 500: { value: '#f59e0b' } },
          red: { 500: { value: '#ef4444' } },
        },
        gradients: {
          blaze: { value: 'linear-gradient(165deg, #fe8224, #fe5900 50%, #97271b)' },
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
            // Ink on the orange accent: white on #fe5900 fails WCAG AA (3.2:1), ink passes (6.3:1).
            onAccent: { value: '{colors.ink.950}' },
            onColor: { value: '{colors.ink.0}' },
          },
          border: {
            default: { value: { base: '{colors.ink.750}', _light: '{colors.ink.200}' } },
            strong: { value: { base: '{colors.ink.600}', _light: '{colors.ink.300}' } },
          },
          accent: {
            default: { value: '{colors.orange.500}' },
            hover: { value: '{colors.orange.600}' },
            pressed: { value: '{colors.orange.700}' },
            muted: { value: 'color-mix(in srgb, {colors.orange.500} 22%, transparent)' },
            soft: { value: 'color-mix(in srgb, {colors.orange.500} 13%, transparent)' },
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
            default: { value: '{colors.blue.400}' },
            muted: { value: 'color-mix(in srgb, {colors.blue.400} 18%, transparent)' },
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
