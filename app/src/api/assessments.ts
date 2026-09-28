import type { Answers } from '../lib/scoring';
import { ApiError, apiRequest } from './client';

export interface Assessment {
  answers: Answers;
  baseScore: number;
  updatedAt: string;
}

export function submitAssessment(answers: Answers): Promise<Assessment> {
  return apiRequest<Assessment>('/assessments', { method: 'POST', body: { answers } });
}

export async function fetchLatestAssessment(): Promise<Assessment | null> {
  try {
    return await apiRequest<Assessment>('/assessments/latest');
  } catch (error) {
    if (error instanceof ApiError && error.status === 404 && error.code === 'assessment_not_found') {
      return null;
    }
    throw error;
  }
}
