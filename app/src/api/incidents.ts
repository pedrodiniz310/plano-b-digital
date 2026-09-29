import type { Op } from '../lib/outbox';
import { apiRequest } from './client';

export interface ServerAction { actionId: string; completedAt: string; clientTimestamp: string | null }
export interface ServerIncident {
  id: string;
  scenarioId: string;
  startedAt: string;
  closedAt: string | null;
  actions: ServerAction[];
}

export function createIncident(id: string, scenarioId: string): Promise<ServerIncident> {
  return apiRequest('/incidents', { method: 'POST', body: { id, scenarioId } });
}
export function completeIncidentAction(id: string, actionId: string, clientTimestamp: string): Promise<ServerAction> {
  return apiRequest(`/incidents/${encodeURIComponent(id)}/actions`, { method: 'POST', body: { actionId, clientTimestamp } });
}
export function closeIncident(id: string): Promise<ServerIncident> {
  return apiRequest(`/incidents/${encodeURIComponent(id)}/close`, { method: 'POST' });
}
export function fetchIncident(id: string): Promise<ServerIncident> {
  return apiRequest(`/incidents/${encodeURIComponent(id)}`);
}
export function sendIncidentOp(op: Op): Promise<ServerIncident | ServerAction> {
  switch (op.kind) {
    case 'create': return createIncident(op.incidentId, op.scenarioId);
    case 'action': return completeIncidentAction(op.incidentId, op.actionId, op.clientTimestamp);
    case 'close': return closeIncident(op.incidentId);
  }
}
