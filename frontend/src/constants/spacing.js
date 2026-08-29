/**
 * RentEase Spacing System
 * Extracted from Stitch Design System: "Pro-Marketplace Minimalist"
 *
 * Base unit: 4px
 * Use multiples of the base unit for consistent spacing throughout the app.
 */

const spacing = {
  // Base scale (multiples of 4px)
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  massive: 64,

  // Semantic spacing
  containerMargin: 20,
  gutter: 16,
  cardPadding: 16,
  cardPaddingLg: 24,
  sectionGap: 24,
  screenPadding: 20,
  inputPadding: 16,
  buttonPaddingH: 24,
  buttonPaddingV: 14,
};

/**
 * Border radius values from Stitch design
 */
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

/**
 * Shadow presets for elevation
 * Stitch: extra-diffused, low-opacity shadows (Blur: 20px, Y: 4px, Slate 900 @ 8%)
 */
export const shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 5,
  },
};

export default spacing;
