import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { HttpError, Conflict, NotFound } from '../lib/httpErrors.js';
import { authenticate, userIdFromRequest } from '../plugins/auth.js';
import { actionBodySchema, createIncidentBodySchema, incidentActionResponseSchema, incidentIdParamsSchema, incidentResponseSchema } from '../schemas/incidents.js';

// Ids espelham os planos editoriais em app/src/content/emergency.ts.
const celularActions = new Set(Array.from({ length: 13 }, (_, i) => `c${i + 1}`));
const genericActions = new Set(Array.from({ length: 8 }, (_, i) => `g${i + 1}`));

function serialize(row: { id: string; scenarioId: string; startedAt: Date; closedAt: Date | null; actions: { actionId: string; completedAt: Date; clientTimestamp: Date | null }[] }) {
  return {
    id: row.id, scenarioId: row.scenarioId, startedAt: row.startedAt.toISOString(),
    closedAt: row.closedAt?.toISOString() ?? null,
    actions: row.actions.map((action) => ({
      actionId: action.actionId, completedAt: action.completedAt.toISOString(),
      clientTimestamp: action.clientTimestamp?.toISOString() ?? null,
    })),
  };
}

export const incidentRoutes: FastifyPluginAsync = async (rawApp) => {
  const app = rawApp.withTypeProvider<ZodTypeProvider>();

  async function ownedIncident(id: string, userId: string) {
    const row = await app.prisma.incident.findFirst({ where: { id, userId }, include: { actions: true } });
    if (!row) throw NotFound('incident_not_found', 'Atendimento não encontrado.');
    return row;
  }

  app.post('/incidents', {
    preHandler: authenticate,
    schema: { body: createIncidentBodySchema, response: { 200: incidentResponseSchema } },
  }, async (req) => {
    const userId = userIdFromRequest(req);
    const { id, scenarioId } = req.body;
    let existing = await app.prisma.incident.findFirst({ where: { id, userId }, include: { actions: true } });
    if (!existing) {
      try {
        existing = await app.prisma.incident.create({ data: { id, userId, scenarioId }, include: { actions: true } });
      } catch (error) {
        // Duas tentativas concorrentes podem disputar o mesmo UUID. Só P2002 é replay.
        if (!(typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002')) throw error;
        existing = await app.prisma.incident.findFirst({ where: { id, userId }, include: { actions: true } });
      }
    }
    if (!existing) throw Conflict('incident_conflict', 'Identificador de atendimento indisponível.');
    return serialize(existing);
  });

  app.post('/incidents/:id/actions', {
    preHandler: authenticate,
    schema: { params: incidentIdParamsSchema, body: actionBodySchema, response: { 200: incidentActionResponseSchema } },
  }, async (req) => {
    const incident = await ownedIncident(req.params.id, userIdFromRequest(req));
    const allowed = incident.scenarioId === 'celular' ? celularActions : genericActions;
    if (!allowed.has(req.body.actionId)) throw new HttpError(400, 'invalid_action', 'Ação inválida para este atendimento.');
    const row = await app.prisma.incidentAction.upsert({
      where: { incidentId_actionId: { incidentId: incident.id, actionId: req.body.actionId } },
      create: { incidentId: incident.id, actionId: req.body.actionId, clientTimestamp: new Date(req.body.clientTimestamp), completedAt: new Date() },
      update: {},
    });
    return { actionId: row.actionId, completedAt: row.completedAt.toISOString(), clientTimestamp: row.clientTimestamp?.toISOString() ?? null };
  });

  app.post('/incidents/:id/close', {
    preHandler: authenticate,
    schema: { params: incidentIdParamsSchema, response: { 200: incidentResponseSchema } },
  }, async (req) => {
    const userId = userIdFromRequest(req);
    await ownedIncident(req.params.id, userId);
    await app.prisma.incident.updateMany({ where: { id: req.params.id, userId, closedAt: null }, data: { closedAt: new Date() } });
    return serialize(await ownedIncident(req.params.id, userId));
  });

  app.get('/incidents/:id', {
    preHandler: authenticate,
    schema: { params: incidentIdParamsSchema, response: { 200: incidentResponseSchema } },
  }, async (req) => serialize(await ownedIncident(req.params.id, userIdFromRequest(req))));
};
