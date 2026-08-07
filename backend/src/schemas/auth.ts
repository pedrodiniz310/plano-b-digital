import { z } from 'zod';

export const signupBodySchema = z.object({
  name: z.string().trim().min(2, 'Informe seu primeiro nome.'),
  email: z.string().trim().email('Digite um e-mail válido.'),
  password: z
    .string()
    .min(8, 'Use ao menos 8 caracteres.')
    .regex(/\d/, 'Inclua ao menos um número.'),
});
export type SignupBody = z.infer<typeof signupBodySchema>;

export const loginBodySchema = z.object({
  email: z.string().trim().email('Digite um e-mail válido.'),
  password: z.string().min(1, 'Informe sua senha.'),
});
export type LoginBody = z.infer<typeof loginBodySchema>;

export const recoverBodySchema = z.object({
  email: z.string().trim().email('Digite um e-mail válido.'),
});
export type RecoverBody = z.infer<typeof recoverBodySchema>;

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshBody = z.infer<typeof refreshBodySchema>;

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  guest: z.boolean(),
});

export const authSessionSchema = z.object({
  user: userSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type AuthSessionResponse = z.infer<typeof authSessionSchema>;

export const recoverResponseSchema = z.object({ sent: z.literal(true) });
