import React from 'react';
import { GLYPHS, type GlyphKey } from './icons';

export interface IconProps {
  glyph: GlyphKey;
  size?: number;
  color: string;
  strokeWidth?: number;
}

export function Icon({ glyph, size = 22, color, strokeWidth = 2 }: IconProps) {
  const LucideIcon = GLYPHS[glyph] ?? GLYPHS.shield;
  return <LucideIcon size={size} color={color} strokeWidth={strokeWidth} />;
}
