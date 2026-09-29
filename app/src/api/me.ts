import { apiRequest } from './client';
import type { FontSizeKey, ThemeName } from '../theme/tokens';

export interface Me {
  name: string;
  emailMasked: string;
  guest: boolean;
  theme: ThemeName;
  contrast: boolean;
  fontSize: FontSizeKey;
}

export function fetchMe(): Promise<Me> {
  return apiRequest<Me>('/me');
}

export function updateMe(patch: Partial<Pick<Me, 'name' | 'theme' | 'contrast' | 'fontSize'>>): Promise<Me> {
  return apiRequest<Me>('/me', { method: 'PATCH', body: patch });
}
