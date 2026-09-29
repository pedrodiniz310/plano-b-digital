import { apiRequest } from './client';

export interface TaskState {
  taskId: string;
  completed: boolean;
  completedAt: string | null;
}

export function fetchPlan(): Promise<{ tasks: TaskState[] }> {
  return apiRequest<{ tasks: TaskState[] }>('/plan');
}

export function setTaskCompleted(taskId: string, completed: boolean): Promise<TaskState> {
  return apiRequest<TaskState>(`/plan/tasks/${encodeURIComponent(taskId)}`, {
    method: 'PATCH',
    body: { completed },
  });
}
