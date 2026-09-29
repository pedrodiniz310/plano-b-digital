import { z } from 'zod';

const base64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

export const vaultParamsSchema = z.object({ promptId: z.string().regex(/^(?:v[1-6]|c-[a-z0-9]{8,32})$/) });
export const vaultBodySchema = z.object({
  ciphertext: z.string().min(1).max(8192).regex(base64),
  nonce: z.string().regex(base64).refine((value) => Buffer.from(value, 'base64').length === 12),
});
export const vaultItemSchema = vaultBodySchema.extend({
  promptId: z.string(),
  updatedAt: z.iso.datetime(),
});
export const vaultItemsSchema = z.object({ items: z.array(vaultItemSchema) });
