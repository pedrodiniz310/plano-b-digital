/**
 * Design tokens portados literalmente do handoff em
 * docs/design-handoff/README.md (seção "Design tokens"). Não redesenhar
 * valores aqui — mudança de token é mudança de handoff, não de código.
 */

export type ThemeName = 'light' | 'dark';
export type FontSizeKey = 's' | 'm' | 'g';

export interface ColorPalette {
  deep: string;
  blue: string;
  blueInk: string;
  tint: string;
  green: string;
  amber: string;
  red: string;
  bg: string;
  surface: string;
  card: string;
  text: string;
  text2: string;
  border: string;
  soft: string;
  dangerTint: string;
  onDeep: string;
  onPrimary: string;
  onDanger: string;
  onDeepMuted: string;
  onDeepSubtle: string;
  onDeepTile: string;
  onDeepBorder: string;
}

export const lightPalette: ColorPalette = {
  deep: '#123B5D',
  blue: '#246BFD',
  blueInk: '#1B54CC',
  tint: '#EAF2FF',
  green: '#2DBE78',
  amber: '#F4B740',
  red: '#E5484D',
  bg: '#F7F9FC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#172033',
  text2: '#667085',
  border: '#E4EAF2',
  soft: 'rgba(18,59,93,.06)',
  dangerTint: 'rgba(229,72,77,.08)',
  onDeep: '#FFFFFF',
  onPrimary: '#FFFFFF',
  onDanger: '#0B1525',
  onDeepMuted: 'rgba(234,242,255,.86)',
  onDeepSubtle: 'rgba(234,242,255,.78)',
  onDeepTile: 'rgba(255,255,255,.09)',
  onDeepBorder: 'rgba(255,255,255,.12)',
};

export const darkPalette: ColorPalette = {
  deep: '#0B2540',
  blue: '#4C8BFF',
  blueInk: '#77A6FF',
  tint: '#16304E',
  green: '#3ED08C',
  amber: '#F6C560',
  red: '#FF6B6E',
  bg: '#0E1525',
  surface: '#172033',
  card: '#1D2939',
  text: '#F1F5FB',
  text2: '#94A3B8',
  border: '#28364D',
  soft: 'rgba(255,255,255,.05)',
  dangerTint: 'rgba(255,107,110,.12)',
  onDeep: '#FFFFFF',
  onPrimary: '#0B2540',
  onDanger: '#0B2540',
  onDeepMuted: 'rgba(234,242,255,.86)',
  onDeepSubtle: 'rgba(234,242,255,.78)',
  onDeepTile: 'rgba(255,255,255,.09)',
  onDeepBorder: 'rgba(255,255,255,.12)',
};

/**
 * Tinta de texto pros tons de status quando usados como cor de tipo (badge de
 * nível, % por área). Só se aplica no tema claro — no escuro usa o valor
 * vibrante original (ver `ink()` em theme/ThemeProvider.tsx).
 */
export const lightTextInk: Record<string, string> = {
  [lightPalette.green]: '#1B8A56',
  [lightPalette.blue]: '#1B54CC',
  [lightPalette.amber]: '#8A6100',
  [lightPalette.red]: '#B02A2E',
};

/** Reforço da tinta verde sobre superfície clara no modo de alto contraste. */
export const highContrastTextInk: Record<string, string> = {
  [lightPalette.green]: '#167548',
};

export const highContrastOverrides: Record<ThemeName, Partial<ColorPalette>> = {
  light: { text2: '#3B4759', border: '#94A3B8', onDanger: '#0B1525' },
  dark: { text2: '#D2DCEA', border: '#6B7C96' },
};

export const fontFamily = {
  light: 'Poppins_300Light',
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
} as const;

/** Escala de tamanho de fonte por preferência (README: 100% / 109% / 120%). */
export const fontScale: Record<FontSizeKey, number> = {
  s: 1,
  m: 1.09,
  g: 1.2,
};

export const typography = {
  micro: { size: 10, lineHeight: 1.2, tracking: 0, family: fontFamily.semibold },
  small: { size: 12, lineHeight: 1.5, tracking: 0, family: fontFamily.light },
  bodySmall: { size: 14, lineHeight: 1.55, tracking: 0, family: fontFamily.regular },
  compactHeading: { size: 17, lineHeight: 1.25, tracking: 0, family: fontFamily.semibold },
  subheading: { size: 18, lineHeight: 1.25, tracking: 0, family: fontFamily.semibold },
  compactTitle: { size: 22, lineHeight: 1.25, tracking: -0.02, family: fontFamily.semibold },
  cardTitle: { size: 24, lineHeight: 1.25, tracking: -0.02, family: fontFamily.semibold },
  displaySplash: { size: 31, lineHeight: 1.1, tracking: -0.03, family: fontFamily.semibold },
  screenTitle: { size: 26, lineHeight: 1.2, tracking: -0.03, family: fontFamily.semibold },
  sectionTitle: { size: 20, lineHeight: 1.25, tracking: -0.025, family: fontFamily.semibold },
  listItem: { size: 15, lineHeight: 1.35, tracking: 0, family: fontFamily.medium },
  body: { size: 15, lineHeight: 1.6, tracking: 0, family: fontFamily.regular },
  secondary: { size: 13, lineHeight: 1.5, tracking: 0, family: fontFamily.light },
  sectionLabel: { size: 11, lineHeight: 1, tracking: 0.22, family: fontFamily.semibold, uppercase: true },
  bigNumber: { size: 44, lineHeight: 1, tracking: -0.04, family: fontFamily.semibold },
} as const;

export const spacing = {
  marginX: 26,
  marginXIncident: 22,
  screenTop: 62,
  tabBarReserve: 116,
  listGap: 10,
  blockGap: 24,
  inset: 16,
  compactInset: 14,
  heroInset: 22,
} as const;

export const radii = {
  field: 17,
  card: 20,
  iconSquare: 14,
  segmented: 16,
  segmentedTab: 12,
  checkbox: 8,
  heroCard: 24,
  largeIcon: 34,
  vaultIcon: 38,
  sos: 22,
  sheetTop: 28,
  pill: 99,
} as const;

/** Alturas de trilho presentes nas telas do protótipo. */
export const progressHeight = {
  thin: 5,
  regular: 6,
  incident: 7,
  overview: 8,
} as const;

export const heights = {
  buttonPrimary: 56,
  buttonSecondary: 52,
  field: 54,
  iconButton: 42,
  minTouchTarget: 44,
} as const;

/** CSS de referência: `0 1px 2px rgba(16,24,40,.04), 0 10px 28px rgba(16,24,40,.06)`. */
export const cardShadow = {
  shadowColor: '#101828',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.06,
  shadowRadius: 28,
  elevation: 6,
} as const;

/** CSS de referência: `0 10px 24px rgba(36,107,253,.24)`. */
export const primaryButtonShadow = {
  shadowColor: '#246BFD',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.24,
  shadowRadius: 24,
  elevation: 8,
} as const;

export const motion = {
  easing: [0.22, 1, 0.36, 1] as [number, number, number, number],
  pressMs: 140,
  fadeMs: 350,
  sheetMs: 320,
  sheetBackdrop: 'rgba(11,37,64,.42)',
  popMs: 280,
  progressMs: 600,
  splashRippleMs: 3400,
  splashRippleStaggerMs: 900,
  splashStrokeMs: 1400,
  vaultScanMs: 1400,
  onboardingOrbitMs: 34000,
} as const;

/** Cor da barra/badge por faixa de percentual — mesma regra em todo o app. */
export function statusColorFor(percent: number, palette: ColorPalette): string {
  if (percent >= 70) return palette.green;
  if (percent >= 40) return palette.amber;
  return palette.red;
}
