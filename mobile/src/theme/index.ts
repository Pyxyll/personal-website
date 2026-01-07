// Design System Constants - Terminal/Hacker Aesthetic with Pink Accent

export const colors = {
  // Base colors
  background: '#0a0a0a',
  card: '#141414',
  cardHover: '#1a1a1a',
  surface: '#1a1a1a',

  // Text colors
  text: '#e5e5e5',
  textSecondary: '#a3a3a3',
  textMuted: '#737373',
  textDisabled: '#525252',

  // Accent colors (pink gradient)
  accent: '#da2862',
  accentLight: '#f472b6',
  accentDark: '#9f1239',
  gradientStart: '#9f1239',
  gradientMid: '#da2862',
  gradientEnd: '#f472b6',

  // UI colors
  border: '#333333',
  borderLight: '#404040',
  borderAccent: '#da2862',

  // Status colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#dc2626',
  info: '#3b82f6',

  // Semantic
  destructive: '#dc2626',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  glass: 'rgba(20, 20, 20, 0.8)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const typography = {
  // Font sizes
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,

  // Font weights
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const borders = {
  width: 1,
  radius: 0, // Sharp corners - terminal aesthetic
};

// Animation timing
export const animation = {
  fast: 150,
  normal: 300,
  slow: 500,
  stagger: 50,
};

// Shadows for depth (subtle for dark theme)
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Common styles
export const commonStyles = {
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: borders.width,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardPressed: {
    backgroundColor: colors.cardHover,
    borderColor: colors.accent,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: borders.width,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.text,
    fontSize: typography.md,
  },
  inputFocused: {
    borderColor: colors.accent,
  },
  button: {
    backgroundColor: colors.text,
    padding: spacing.md,
    alignItems: 'center' as const,
  },
  buttonText: {
    color: colors.background,
    fontSize: typography.md,
    fontWeight: typography.semibold,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: borders.width,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center' as const,
  },
  buttonOutlineText: {
    color: colors.text,
    fontSize: typography.md,
    fontWeight: typography.semibold,
  },
};
