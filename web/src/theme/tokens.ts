// Design Tokens - Single source of truth for all styling
export const tokens = {
  // Color Palette
  colors: {
    // Backgrounds
    background: {
      primary: '#09090f',
      secondary: '#0a0a14',
      elevated: '#0f0f1a',
      surface: '#141425',
      surface2: '#1a1a30',
    },
    // Text
    text: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
      muted: '#64748b',
      disabled: '#334155',
    },
    // Borders
    border: {
      default: '#1e1e3a',
      light: '#252545',
      lighter: '#2a2a4a',
    },
    // Status Colors
    status: {
      success: '#10b981',
      successBg: 'rgba(16,185,129,0.12)',
      successBorder: 'rgba(16,185,129,0.25)',

      warning: '#f59e0b',
      warningBg: 'rgba(245,158,11,0.12)',
      warningBorder: 'rgba(245,158,11,0.25)',

      error: '#ef4444',
      errorBg: 'rgba(239,68,68,0.12)',
      errorBorder: 'rgba(239,68,68,0.25)',

      info: '#3b82f6',
      infoBg: 'rgba(59,130,246,0.12)',
      infoBorder: 'rgba(59,130,246,0.25)',
    },
    // Primary Brand
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
      DEFAULT: '#3b82f6',
      dark: '#2563eb',
      light: '#60a5fa',
      muted: 'rgba(59,130,246,0.15)',
    },
    // Accent
    accent: {
      DEFAULT: '#06b6d4',
      hover: '#0891b2',
      muted: 'rgba(6,182,212,0.15)',
    },
    // Investment Returns
    returns: {
      positive: '#10b981',
      negative: '#ef4444',
      neutral: '#94a3b8',
    },
  },

  // Typography
  typography: {
    // Font families
    fonts: {
      sans: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    // Font sizes
    sizes: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    // Line heights
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
    // Font weights
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    // Predefined scales
    scales: {
      // Display
      display: {
        size: '3rem',     // 48px
        lineHeight: 1.2,
        weight: 700,
        letterSpacing: '-0.02em',
      },
      // Hero
      hero: {
        size: '2.25rem',  // 36px
        lineHeight: 1.2,
        weight: 700,
        letterSpacing: '-0.01em',
      },
      // Page Title
      pageTitle: {
        size: '1.875rem', // 30px
        lineHeight: 1.2,
        weight: 700,
        letterSpacing: '-0.01em',
      },
      // H1
      h1: {
        size: '1.5rem',   // 24px
        lineHeight: 1.3,
        weight: 700,
        letterSpacing: '-0.005em',
      },
      // H2
      h2: {
        size: '1.25rem',  // 20px
        lineHeight: 1.4,
        weight: 600,
        letterSpacing: '0em',
      },
      // H3
      h3: {
        size: '1.125rem', // 18px
        lineHeight: 1.4,
        weight: 600,
        letterSpacing: '0em',
      },
      // H4
      h4: {
        size: '1rem',     // 16px
        lineHeight: 1.5,
        weight: 600,
        letterSpacing: '0em',
      },
      // Body Large
      bodyLarge: {
        size: '1rem',     // 16px
        lineHeight: 1.5,
        weight: 400,
        letterSpacing: '0em',
      },
      // Body Medium
      bodyMedium: {
        size: '0.875rem', // 14px
        lineHeight: 1.5,
        weight: 400,
        letterSpacing: '0em',
      },
      // Body Small
      bodySmall: {
        size: '0.75rem',  // 12px
        lineHeight: 1.5,
        weight: 400,
        letterSpacing: '0em',
      },
      // Label
      label: {
        size: '0.75rem',  // 12px
        lineHeight: 1.2,
        weight: 600,
        letterSpacing: '0.05em',
      },
      // Caption
      caption: {
        size: '0.625rem', // 10px
        lineHeight: 1.2,
        weight: 500,
        letterSpacing: '0.02em',
      },
    },
  },

  // Spacing
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '2.5rem', // 40px
    '3xl': '3rem',   // 48px
    '4xl': '4rem',   // 64px
  },

  // Border Radius
  radius: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    '2xl': '28px',
    full: '99999px',
  },

  // Shadows
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glow: '0 0 20px rgba(59, 130, 246, 0.3)',
    glowLg: '0 0 40px rgba(59, 130, 246, 0.2)',
  },

  // Z-index
  zIndex: {
    hide: -1,
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    backdrop: 1300,
    offcanvas: 1400,
    modal: 1500,
    popover: 1600,
    tooltip: 1700,
  },

  // Breakpoints
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Transitions
  transitions: {
    fast: '150ms ease-out',
    base: '200ms ease-out',
    slow: '300ms ease-out',
    slower: '500ms ease-out',
  },
}

// Helper functions for theme values
export const useTheme = () => ({
  color: (path: string) => {
    const keys = path.split('.')
    let value: any = tokens.colors
    for (const key of keys) value = value?.[key]
    return value
  },
  spacing: (value: keyof typeof tokens.spacing) => tokens.spacing[value],
  radius: (value: keyof typeof tokens.radius) => tokens.radius[value],
  shadow: (value: keyof typeof tokens.shadows) => tokens.shadows[value],
  type: (scale: keyof typeof tokens.typography.scales) => tokens.typography.scales[scale],
})
