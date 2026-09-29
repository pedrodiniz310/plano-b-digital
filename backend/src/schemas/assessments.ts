import { z } from 'zod';

const answerOptionSchema = z.number().int().min(0).max(3);

export const assessmentAnswersSchema = z
  .record(z.string(), answerOptionSchema)
  .superRefine((answers, ctx) => {
    const expectedKeys = Array.from({ length: 10 }, (_, index) => String(index));
    for (const key of expectedKeys) {
      if (!(key in answers)) {
        ctx.addIssue({ code: 'custom', message: `Resposta ausente: ${key}.`, path: [key] });
      }
    }
    for (const key of Object.keys(answers)) {
      if (!expectedKeys.includes(key)) {
        ctx.addIssue({ code: 'custom', message: `Índice de pergunta inválido: ${key}.`, path: [key] });
      }
    }
  });

export const assessmentBodySchema = z.object({ answers: assessmentAnswersSchema });

export const assessmentResponseSchema = z.object({
  answers: assessmentAnswersSchema,
  baseScore: z.number().int().min(0).max(100),
  updatedAt: z.iso.datetime(),
});

export type AssessmentAnswers = z.infer<typeof assessmentAnswersSchema>;
export type AssessmentResponse = z.infer<typeof assessmentResponseSchema>;
