import { allActions, planFor } from '../../lib/emergency';
import { EMERGENCY_SCENARIOS } from '../../content/emergency';
import type { LocalIncident } from '../../state/store';

export function scenarioTitle(id: string): string {
  return EMERGENCY_SCENARIOS.find((item) => item.id === id)?.title ?? 'Outro problema';
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function reportText(incident: LocalIncident): string {
  const actions = allActions(planFor(incident.scenarioId));
  const done = actions.filter((action) => incident.actions[action.id]);
  const pending = actions.filter((action) => !incident.actions[action.id]);
  return [
    `Relatório do atendimento — ${scenarioTitle(incident.scenarioId)}`,
    `Início: ${incident.startedAtServer ?? incident.startedAtLocal}${incident.startedAtServer ? ' (servidor)' : ' (local, aguardando sincronização)'}`,
    `Encerramento: ${incident.closedAtServer ?? incident.closedAtLocal ?? 'em andamento'}${incident.closedAtServer ? ' (servidor)' : ' (local, aguardando sincronização)'}`,
    `Ações concluídas: ${done.length}/${actions.length}`,
    ...done.map((action) => {
      const record = incident.actions[action.id];
      return `• ${action.title}: ${record.completedAt ?? record.clientTimestamp}${record.completedAt ? ' (servidor)' : ' (local, aguardando sincronização)'}`;
    }),
    ...(pending.length ? ['Ainda pendente:', ...pending.map((action) => `• ${action.title}`)] : []),
  ].join('\n');
}
