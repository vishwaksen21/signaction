import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // SignAction Refined Brand Palette (Human-Designed Editorial Tech)
        'sign-navy': '#062B5C',
        'sign-blue': '#0757E8',
        'sign-bright': '#0284C7',
        'sign-cyan': '#0EA5E9',
        'sign-sky': '#38BDF8',
        'sign-surface': '#FAF9F6',
        'sign-panel': '#F4F6F9',
        'sign-border': 'rgba(6, 43, 92, 0.08)',
        'sign-darktext': '#0F172A',
        'sign-muted': '#64748B',

        // Compatibility mappings
        'apple-primary': '#0757E8',
        'apple-primary-focus': '#0284C7',
        'apple-primary-on-dark': '#38BDF8',
        'apple-ink': '#0F172A',
        'apple-body': '#1E293B',
        'apple-body-on-dark': '#F8FAFC',
        'apple-body-muted': '#64748B',
        'apple-divider-soft': 'rgba(15, 23, 42, 0.06)',
        'apple-hairline': 'rgba(15, 23, 42, 0.08)',
        'apple-canvas': '#FAF9F6',
        'apple-canvas-parchment': '#F4F6F9',
        'apple-surface-pearl': '#FFFFFF',
        // Sophisticated Neutral Surfaces
        'warm-ivory': '#FAF9F6',
        'warm-surface': '#F4F6F9',
        'brand-navy': '#0A192F',
        'brand-blue': '#0757E8',
        'brand-cyan': '#0EA5E9',
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'card': '16px',
        'card-lg': '20px',
        'pill': '9999px',
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(15, 23, 42, 0.05)',
        'sm': '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
        'md': '0 4px 12px rgba(15, 23, 42, 0.06), 0 2px 4px rgba(15, 23, 42, 0.04)',
        'lg': '0 10px 24px rgba(15, 23, 42, 0.07), 0 4px 8px rgba(15, 23, 42, 0.04)',
        'sign-card': '0 1px 3px rgba(15, 23, 42, 0.05), 0 8px 24px rgba(15, 23, 42, 0.03)',
        'sign-button': '0 2px 8px rgba(7, 87, 232, 0.22)',
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant('light', 'html.light &');
    }),
  ],
};

export default config;

