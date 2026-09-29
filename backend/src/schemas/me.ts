import { z } from 'zod';

export const meResponseSchema = z.object({
  name: z.string(),
  emailMasked: z.string(),
  guest: z.boolean(),
  theme: z.enum(['light', 'dark']),
  contrast: z.boolean(),
  fontSize: z.enum(['s', 'm', 'g']),
});

export const updateMeBodySchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  theme: z.enum(['light', 'dark']).optional(),
  contrast: z.boolean().optional(),
  fontSize: z.enum(['s', 'm', 'g']).optional(),
}).strict().refine((body) => Object.keys(body).length > 0);
