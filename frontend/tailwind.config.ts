import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // SignAction Official Brand Palette
        'sign-navy': '#062B87',
        'sign-blue': '#0757E8',
        'sign-bright': '#087FF5',
        'sign-cyan': '#12CFF3',
        'sign-lightcyan': '#7DEBFA',
        'sign-verylight': '#EAF9FF',
        'sign-soft': '#F4FAFF',
        'sign-darktext': '#062B5C',
        'sign-muted': '#60759A',

        // Legacy compatibility mappings
        'apple-primary': '#0757E8',
        'apple-primary-focus': '#087FF5',
        'apple-primary-on-dark': '#12CFF3',
        'apple-ink': '#062B5C',
        'apple-body': '#062B5C',
        'apple-body-on-dark': '#ffffff',
        'apple-body-muted': '#60759A',
        'apple-ink-muted-80': '#334155',
        'apple-ink-muted-48': '#60759A',
        'apple-divider-soft': 'rgba(7, 87, 232, 0.08)',
        'apple-hairline': 'rgba(7, 87, 232, 0.12)',
        'apple-canvas': '#ffffff',
        'apple-canvas-parchment': '#F4FAFF',
        'apple-surface-pearl': '#EAF9FF',
        'apple-surface-tile-1': '#062B87',
        'apple-surface-tile-2': '#041c5c',
        'apple-surface-tile-3': '#021038',
        'apple-surface-black': '#03143f',
        // Editorial & Warm Human Palette
        'warm-ivory': '#FAF9F6',
        'warm-surface': '#F0F4F8',
        'brand-navy': '#0A192F',
        'brand-blue': '#0757E8',
        'brand-cyan': '#12CFF3',
        'brand-turquoise': '#00B4D8',
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'Manrope', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Manrope', 'system-ui', 'sans-serif'],
      },

      borderRadius: {
        'card': '20px',
        'card-lg': '28px',
        'pill': '9999px',
      },
      boxShadow: {
        'xs': '0 1px 3px rgba(7, 87, 232, 0.08)',
        'sign-card': '0 10px 40px rgba(7, 87, 232, 0.08)',
        'sign-card-hover': '0 14px 44px rgba(7, 87, 232, 0.15)',
        'sign-glow': '0 0 24px rgba(18, 207, 243, 0.35)',
        'sign-button': '0 6px 20px rgba(7, 87, 232, 0.28)',
        'apple-product': '0 10px 40px rgba(7, 87, 232, 0.08)',
      },

      backgroundImage: {
        'sign-gradient': 'linear-gradient(135deg, #0757E8 0%, #12CFF3 100%)',
        'sign-gradient-hover': 'linear-gradient(135deg, #064ad1 0%, #0ebde0 100%)',
        'sign-gradient-soft': 'linear-gradient(135deg, #EAF9FF 0%, #F4FAFF 100%)',
        'sign-gradient-dark': 'linear-gradient(135deg, #062B87 0%, #03184f 100%)',
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
        'apple-button-large': ['18px', { lineHeight: '1.0', letterSpacing: '0px', fontWeight: '500' }],
        'apple-button-utility': ['14px', { lineHeight: '1.29', letterSpacing: '-0.224px', fontWeight: '500' }],
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
