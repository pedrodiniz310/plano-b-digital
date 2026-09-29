import { z } from 'zod';

export const contactBodySchema = z.object({
  name: z.string().trim().min(2).max(80),
  relation: z.string().trim().min(1).max(40),
  phone: z.string().transform((phone) => phone.replace(/\D/g, '')).pipe(z.string().regex(/^\d{10,11}$/)),
  email: z.email().optional(),
  note: z.string().max(500).optional(),
});

export const contactResponseSchema = z.object({
  name: z.string(),
  relation: z.string(),
  phoneMasked: z.string(),
  emailMasked: z.string().nullable(),
  note: z.string().nullable(),
});
