import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-surface-rgb) / <alpha-value>)',
        surface: 'rgb(var(--color-surface-rgb) / <alpha-value>)',
        'surface-container': 'rgb(var(--color-surface-container-rgb) / <alpha-value>)',
        'surface-container-high': 'rgb(var(--color-surface-container-high-rgb) / <alpha-value>)',
        'surface-container-low': 'rgb(var(--color-surface-container-low-rgb) / <alpha-value>)',
        'surface-container-lowest': 'rgb(var(--color-surface-container-lowest-rgb) / <alpha-value>)',
        'on-surface': 'rgb(var(--color-on-surface-rgb) / <alpha-value>)',
        'on-surface-variant': 'rgb(var(--color-on-surface-variant-rgb) / <alpha-value>)',
        primary: 'rgb(var(--color-primary-rgb) / <alpha-value>)',
        'primary-container': 'rgb(var(--color-primary-container-rgb) / <alpha-value>)',
        'primary-fixed': 'rgb(var(--color-primary-fixed-rgb) / <alpha-value>)',
        'on-primary': 'rgb(var(--color-on-primary-rgb) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary-rgb) / <alpha-value>)',
        'secondary-fixed': 'rgb(var(--color-secondary-fixed-rgb) / <alpha-value>)',
        'on-secondary-container': 'rgb(var(--color-on-secondary-container-rgb) / <alpha-value>)',
        outline: 'rgb(var(--color-outline-rgb) / <alpha-value>)',
        'outline-variant': 'rgb(var(--color-outline-variant-rgb) / <alpha-value>)',
        error: 'rgb(var(--color-error-rgb) / <alpha-value>)',
        'error-container': 'rgb(var(--color-error-container-rgb) / <alpha-value>)',
        'on-error': 'rgb(var(--color-on-error-rgb) / <alpha-value>)',
        'on-error-container': 'rgb(var(--color-on-error-container-rgb) / <alpha-value>)',
        // Semantic aliases
        'brand-surface': 'rgb(var(--color-brand-surface-rgb) / <alpha-value>)',
        action: 'rgb(var(--color-action-rgb) / <alpha-value>)',
        'action-subtle': 'rgb(var(--color-action-subtle-rgb) / <alpha-value>)',
        'border-warm': 'rgb(var(--color-border-rgb) / <alpha-value>)',
      },
      fontFamily: {
        headline: ['var(--font-headline)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: 'var(--shadow-soft-1)',
        'soft-2': 'var(--shadow-soft-2)',
        ambient: 'var(--shadow-ambient)',
      },
      borderRadius: {
        sm: 'var(--radius-4)',
        md: 'var(--radius-8)',
        lg: 'var(--radius-12)',
        xl: 'var(--radius-12)',
        full: 'var(--radius-full)',
      },
      spacing: {
        2: 'var(--spacing-2)',
        4: 'var(--spacing-4)',
        6: 'var(--spacing-6)',
        8: 'var(--spacing-8)',
        12: 'var(--spacing-12)',
        16: 'var(--spacing-16)',
        20: 'var(--spacing-20)',
      },
    },
  },
  plugins: [],
};

export default config;
