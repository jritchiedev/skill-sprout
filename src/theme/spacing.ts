import { Platform } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 34,
  display: 48,
} as const;

/**
 * Composed text styles for headings and numerics. Large type needs negative
 * tracking to read as composed rather than shouty; small caps-y labels need
 * positive tracking to stay legible.
 */
export const typography = {
  screenTitle: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  cardTitle: { fontSize: fontSize.md, fontWeight: '600', letterSpacing: -0.1 },
  body: { fontSize: fontSize.sm, lineHeight: 20 },
  /** Timers and results: tabular figures stop the layout jittering per digit. */
  numeric: { fontVariant: ['tabular-nums'] as ['tabular-nums'], letterSpacing: -0.5 },
} as const;

export const minTouchTarget = 44;

// Cards carry a hairline border now, so shadows only need to hint at lift.
// Heavy shadows were the main thing making the old cards look dated.
export const shadow = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
    },
    android: { elevation: 1 },
    default: {},
  }) as Record<string, unknown>,
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
    },
    android: { elevation: 2 },
    default: {},
  }) as Record<string, unknown>,
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.07,
      shadowRadius: 18,
    },
    android: { elevation: 5 },
    default: {},
  }) as Record<string, unknown>,
};
