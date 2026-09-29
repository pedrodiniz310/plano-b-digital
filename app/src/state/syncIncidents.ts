import { sendIncidentOp, type ServerAction, type ServerIncident } from '../api/incidents';
import { flush, type Op } from '../lib/outbox';
import { useAppStore, type LocalIncident } from './store';

let inFlight: Promise<void> | null = null;

function isIncident(value: ServerIncident | ServerAction): value is ServerIncident {
  return 'startedAt' in value;
}

function applyServerResult(op: Op, value: ServerIncident | ServerAction) {
  const patch: Partial<LocalIncident> = {};
  if (isIncident(value)) {
    patch.startedAtServer = value.startedAt;
    if (value.closedAt) patch.closedAtServer = value.closedAt;
    patch.actions = Object.fromEntries(value.actions.map((action) => [action.actionId, {
      clientTimestamp: action.clientTimestamp ?? action.completedAt, completedAt: action.completedAt,
    }]));
  } else if (op.kind === 'action') {
    patch.actions = { [op.actionId]: { clientTimestamp: op.clientTimestamp, completedAt: value.completedAt } };
  }
  useAppStore.getState().applyIncidentSync(op.incidentId, patch);
}

/** Uma fila por vez; a UI nunca espera pela rede. */
export function syncOutbox(): Promise<void> {
  if (inFlight) return inFlight;
  if (!useAppStore.persist.hasHydrated()) return Promise.resolve();
  inFlight = (async () => {
    while (true) {
      const state = useAppStore.getState();
      if (!state.user || state.outbox.length === 0) return;
      const owner = state.user.id;
      const snapshot = [...state.outbox];
      const result = await flush(snapshot, sendIncidentOp);
      if (useAppStore.getState().user?.id !== owner) return;
      for (const { op, value } of result.results) applyServerResult(op, value);
      useAppStore.getState().acknowledgeOutbox(snapshot, result.remaining);
      // Erros transitórios preservam a fila; esperamos o próximo gatilho.
      if (result.remaining.length > 0) return;
    }
  })().finally(() => { inFlight = null; });
  return inFlight;
}
