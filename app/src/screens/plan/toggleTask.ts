import { ApiError } from '../../api/client';
import { setTaskCompleted as saveTaskCompleted } from '../../api/plan';
import { useAppStore } from '../../state/store';

export function toggleTask(taskId: string, completed: boolean): void {
  useAppStore.getState().setTaskCompleted(taskId, completed);
  void saveTaskCompleted(taskId, completed).catch((error: unknown) => {
    console.warn(error instanceof ApiError ? error.code : 'network_error');
  });
}
