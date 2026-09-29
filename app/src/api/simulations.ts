import { apiRequest } from './client';

export interface SimulationResult {
  simulationId: string;
  hits: number;
  timeSeconds: number;
  completedAt: string;
}

export function fetchSimulationResults(): Promise<{ results: SimulationResult[] }> {
  return apiRequest<{ results: SimulationResult[] }>('/simulations/results');
}

export function submitSimulationResult(
  id: string,
  result: Pick<SimulationResult, 'hits' | 'timeSeconds'>
): Promise<SimulationResult> {
  return apiRequest<SimulationResult>(`/simulations/${encodeURIComponent(id)}/results`, {
    method: 'POST',
    body: result,
  });
}
