import React, { createContext, useContext, useMemo } from 'react';
import { useAppStore } from '../state/store';
import {
  cardShadow,
  darkPalette,
  fontScale,
  heights,
  highContrastOverrides,
  highContrastTextInk,
  lightPalette,
  lightTextInk,
  motion,
  primaryButtonShadow,
  progressHeight,
  radii,
  spacing,
  statusColorFor,
  typography,
  type ColorPalette,
  type ThemeName,
} from './tokens';

export interface ResolvedTheme {
  name: ThemeName;
  contrast: boolean;
  colors: ColorPalette;
  /** Tinta de texto pra uma cor de status (verde/azul/âmbar/vermelho). */
  ink: (statusColor: string) => string;
  statusColor: (percent: number) => string;
  fontScale: number;
  typography: typeof typography;
  spacing: typeof spacing;
  radii: typeof radii;
  heights: typeof heights;
  progressHeight: typeof progressHeight;
  shadow: { card: typeof cardShadow; primaryButton: typeof primaryButtonShadow };
  motion: typeof motion;
}

const ThemeContext = createContext<ResolvedTheme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeName = useAppStore((s) => s.theme);
  const contrast = useAppStore((s) => s.contrast);
  const font = useAppStore((s) => s.font);

  const value = useMemo<ResolvedTheme>(() => {
    const base = themeName === 'dark' ? darkPalette : lightPalette;
    const colors: ColorPalette = contrast ? { ...base, ...highContrastOverrides[themeName] } : base;

    return {
      name: themeName,
      contrast,
      colors,
      ink: (statusColor) => (themeName === 'dark' ? statusColor : (contrast ? highContrastTextInk[statusColor] : undefined) ?? lightTextInk[statusColor] ?? statusColor),
      statusColor: (percent) => statusColorFor(percent, colors),
      fontScale: fontScale[font],
      typography,
      spacing,
      radii,
      heights,
      progressHeight,
      shadow: { card: cardShadow, primaryButton: primaryButtonShadow },
      motion,
    };
  }, [themeName, contrast, font]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ResolvedTheme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme() precisa estar dentro de <ThemeProvider>.');
  return ctx;
}
