/**
 * Premium Admin Design System v2.0
 * Inspired by modern SaaS platforms with futuristic dark navy aesthetic
 * Abderrahim Talibi - Software Engineer | AI & Backend Developer
 */

/* ============ COLOR TOKENS ============ */
export const COLORS = {
  /* Core palette as specified */
  background: "#050B1A",
  sidebar: "#081127",
  card: "#0D1730",
  
  /* Primary accents */
  primaryBlue: "#1677FF",
  cyanAccent: "#00C8FF",
  purpleAccent: "#8B5CF6",
  greenAccent: "#10D9A0",
  amberAccent: "#F5A623",
  
  /* Text colors */
  primaryText: "#F4F7FF",
  secondaryText: "#A5B4D4",
  
  /* Borders */
  border: "rgba(100, 140, 220, 0.16)",
  
  /* Status colors */
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  
  /* Glassmorphism */
  glass: "rgba(13, 23, 48, 0.7)",
  glassBorder: "rgba(100, 140, 220, 0.2)",
  
  /* States */
  bgGradientStart: "#080E15",
  bgGradientEnd: "#0F1622",
} as const;

/* ============ TYPOGRAPHY SCALE ============ */
export const TYPOGRAPHY = {
  headerH1: { fontSize: "1.875rem", fontWeight: 800, lineHeight: "2.25rem" },
  headerH2: { fontSize: "1.25rem", fontWeight: 600, lineHeight: "1.75rem" },
  headerH3: { fontSize: "1.125rem", fontWeight: 600, lineHeight: "1.6rem" },
  body1: { fontSize: "0.875rem", fontWeight: 400, lineHeight: "1.375rem" },
  body2: { fontSize: "0.75rem", fontWeight: 500, lineHeight: "1.25rem" },
  caption: { fontSize: "0.625rem", fontWeight: 500, lineHeight: "1rem" },
  label: { fontSize: "0.75rem", fontWeight: 600, lineHeight: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" },
  button: { fontSize: "0.875rem", fontWeight: 500, lineHeight: "1.5rem" },
} as const;

/* ============ SPACING SYSTEM ============ */
export const SPACING = {
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
} as const;

/* ============ BORDER RADIUS ============ */
export const RADIUS = {
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
} as const;

/* ============ SHADOWS ============ */
export const SHADOWS = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 1px 0 rgba(0, 0, 0, 0.15)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)",
  button: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
} as const;

/* ============ TRANSITIONS ============ */
export const TRANSITIONS = {
  fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
  normal: "250ms cubic-bezier(0.4, 0, 0.2, 1)",
  smooth: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
  easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
} as const;

/* ============ Z-INDEX SCALE ============ */
export const Z_INDEX = {
  dropdown: 1000,
  modal: 1100,
  overlay: 1001,
  header: 1002,
  sidebar: 1003,
} as const;

/* ============ DESIGN UTILITIES ============ */
export function gradientBuilder(colors: string[], direction: "to-bottom" | "to-right" | "to-tr" = "to-bottom"): string {
  return `linear-gradient(${direction}, ${colors.join(",")})`;
}

export function glassStyle(background = "var(--glass)", border = "var(--glass-border)") {
  return `background: ${background}; border: 1px solid ${border}; backdrop-filter: blur(12px);`;
}

/* ============ THEME CONTEXT ============ */
export const THEME = {
  dark: {
    name: "dark",
    bg: "#050B1A",
    sidebarBg: "#081127",
    cardBg: "#0D1730",
    cardBorder: "rgba(100, 140, 220, 0.16)",
    textPrimary: "#F4F7FF",
    textSecondary: "#A5B4D4",
    primaryBlue: "#1677FF",
    cyanAccent: "#00C8FF",
    purpleAccent: "#8B5CF6",
    greenAccent: "#10D9A0",
    amberAccent: "#F5A623",
  },
  light: {
    name: "light",
    bg: "#F8FAFC",
    sidebarBg: "#F1F5F9",
    cardBg: "#FFFFFF",
    cardBorder: "rgba(100, 140, 220, 0.2)",
    textPrimary: "#0F172A",
    textSecondary: "#64748B",
    primaryBlue: "#0891B2",
    cyanAccent: "#06B6D4",
    purpleAccent: "#A855F7",
    greenAccent: "#059669",
    amberAccent: "#D97706",
  },
} as const;