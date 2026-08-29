/**
 * RentEase Typography System
 * Extracted from Stitch Design System: "Pro-Marketplace Minimalist"
 *
 * Font: Inter (all roles)
 * Centralized typography definitions for consistent text styling.
 */

const typography = {
  // Font families
  fontFamily: {
    primary: 'Inter',
    fallback: 'System',
  },

  // Type scale
  display: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.64, // -0.02em * 32
  },

  headlineLg: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    letterSpacing: -0.24, // -0.01em * 24
  },

  headlineMd: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },

  bodyLg: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },

  bodyMd: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },

  bodySm: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },

  labelLg: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },

  labelMd: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.6, // 0.05em * 12
  },

  labelSm: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
  },

  // Button text
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },

  buttonSm: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },

  // Caption
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
};

export default typography;
