import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'apple-primary': '#0066cc',
        'apple-primary-focus': '#0071e3',
        'apple-primary-on-dark': '#2997ff',
        'apple-ink': '#1d1d1f',
        'apple-body': '#1d1d1f',
        'apple-body-on-dark': '#ffffff',
        'apple-body-muted': '#cccccc',
        'apple-ink-muted-80': '#333333',
        'apple-ink-muted-48': '#7a7a7a',
        'apple-divider-soft': '#f0f0f0',
        'apple-hairline': '#e0e0e0',
        'apple-canvas': '#ffffff',
        'apple-canvas-parchment': '#f5f5f7',
        'apple-surface-pearl': '#fafafc',
        'apple-surface-tile-1': '#272729',
        'apple-surface-tile-2': '#2a2a2c',
        'apple-surface-tile-3': '#252527',
        'apple-surface-black': '#000000',
        'apple-surface-chip': 'rgba(210, 210, 215, 0.64)',
        'apple-on-primary': '#ffffff',
        'apple-on-dark': '#ffffff',
      },
      fontFamily: {
        sans: ['"SF Pro Text"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"SF Pro Display"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        'xxs': '4px',
        'xs': '8px',
        'sm': '12px',
        'md': '17px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '48px',
        'section': '80px',
      },
      borderRadius: {
        'none': '0px',
        'xs': '5px',
        'sm': '8px',
        'md': '11px',
        'lg': '18px',
        'pill': '9999px',
        'full': '9999px',
      },
      boxShadow: {
        'apple-product': 'rgba(0, 0, 0, 0.22) 3px 5px 30px 0px',
      },
      fontSize: {
        'apple-hero': ['56px', { lineHeight: '1.07', letterSpacing: '-0.28px', fontWeight: '600' }],
        'apple-display-lg': ['40px', { lineHeight: '1.1', letterSpacing: '0px', fontWeight: '600' }],
        'apple-display-md': ['34px', { lineHeight: '1.47', letterSpacing: '-0.374px', fontWeight: '600' }],
        'apple-lead': ['28px', { lineHeight: '1.14', letterSpacing: '0.196px', fontWeight: '400' }],
        'apple-lead-airy': ['24px', { lineHeight: '1.5', letterSpacing: '0px', fontWeight: '300' }],
        'apple-tagline': ['21px', { lineHeight: '1.19', letterSpacing: '0.231px', fontWeight: '600' }],
        'apple-body-strong': ['17px', { lineHeight: '1.24', letterSpacing: '-0.374px', fontWeight: '600' }],
        'apple-body': ['17px', { lineHeight: '1.47', letterSpacing: '-0.374px', fontWeight: '400' }],
        'apple-dense-link': ['17px', { lineHeight: '2.41', letterSpacing: '0px', fontWeight: '400' }],
        'apple-caption': ['14px', { lineHeight: '1.43', letterSpacing: '-0.224px', fontWeight: '400' }],
        'apple-caption-strong': ['14px', { lineHeight: '1.29', letterSpacing: '-0.224px', fontWeight: '600' }],
        'apple-button-large': ['18px', { lineHeight: '1.0', letterSpacing: '0px', fontWeight: '300' }],
        'apple-button-utility': ['14px', { lineHeight: '1.29', letterSpacing: '-0.224px', fontWeight: '400' }],
        'apple-fine-print': ['12px', { lineHeight: '1.0', letterSpacing: '-0.12px', fontWeight: '400' }],
        'apple-micro-legal': ['10px', { lineHeight: '1.3', letterSpacing: '-0.08px', fontWeight: '400' }],
        'apple-nav-link': ['12px', { lineHeight: '1.0', letterSpacing: '-0.12px', fontWeight: '400' }],
      }
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant('light', 'html.light &');
    }),
  ],
};

export default config;
