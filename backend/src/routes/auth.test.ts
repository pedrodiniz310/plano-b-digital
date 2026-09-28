import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';
import type { PrismaClient } from '../generated/prisma/client.js';

// Secret sintético só pra assinar JWT em memória — não é credencial de lugar nenhum.
process.env.JWT_ACCESS_SECRET ??= 'segredo-de-teste-sem-valor-fora-daqui';

/**
 * Prisma de mentira: as rotas de auth são exercitadas por HTTP sem subir
 * Postgres. `findUnique` sempre devolve `null`, então o login cai em
 * `invalid_credentials` sem pagar argon2 — o que isola o teste no limitador.
 */
function prismaStub(): PrismaClient {
  let seq = 0;
  return {
    user: {
      findUnique: async () => null,
      create: async () => {
        seq += 1;
        return {
          id: `user-${seq}`,
          name: 'Visitante',
          email: `guest-${seq}@planob.local`,
          passwordHash: null,
          isGuest: true,
        };
      },
    },
    refreshToken: {
      create: async () => ({ id: 'refresh-1' }),
    },
  } as unknown as PrismaClient;
}

let app: FastifyInstance | null = null;

async function startApp(): Promise<FastifyInstance> {
  app = await buildApp({ prisma: prismaStub(), logger: false });
  await app.ready();
  return app;
}

afterEach(async () => {
  await app?.close();
  app = null;
});

describe('rate limit das rotas de auth', () => {
  it('corta o login na 6ª tentativa do mesmo IP dentro da janela', async () => {
    const server = await startApp();
    const login = () =>
      server.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'alvo@example.com', password: 'senha12345' },
      });

    const permitidas = [];
    for (let i = 0; i < 5; i += 1) permitidas.push(await login());
    expect(permitidas.map((res) => res.statusCode)).toEqual([401, 401, 401, 401, 401]);

    const bloqueada = await login();
    expect(bloqueada.statusCode).toBe(429);
    expect(bloqueada.json()).toMatchObject({ code: 'rate_limited' });
  });

  it('corta a criação de visitante, que grava no banco sem autenticação nenhuma', async () => {
    const server = await startApp();
    const guest = () => server.inject({ method: 'POST', url: '/auth/guest' });

    const permitidas = [];
    for (let i = 0; i < 5; i += 1) permitidas.push(await guest());
    expect(permitidas.map((res) => res.statusCode)).toEqual([200, 200, 200, 200, 200]);

    const bloqueada = await guest();
    expect(bloqueada.statusCode).toBe(429);
    expect(bloqueada.json()).toMatchObject({ code: 'rate_limited' });
  });

  /**
   * O `X-Forwarded-For` é uma cadeia: o proxy **anexa à direita** o endereço que
   * ele mesmo observou e preserva o que o cliente escreveu à esquerda. Logo, só
   * a entrada da direita é testemunho; a da esquerda é texto digitado pelo
   * cliente. Quem chaveia o balde pela entrada da esquerda entrega ao atacante a
   * escolha do próprio balde, e o limite deixa de existir.
   *
   * Este teste manda **cadeia de dois endereços**, que é o formato real atrás de
   * proxy. A versão anterior mandava um valor único — formato em que esquerda e
   * direita coincidem e o defeito não aparece.
   */
  it('com TRUST_PROXY, chaveia pelo IP que o proxy observou, não pelo que o cliente escreve', async () => {
    const anterior = process.env.TRUST_PROXY;
    process.env.TRUST_PROXY = 'true';
    try {
      const server = await startApp();
      const login = (xff: string) =>
        server.inject({
          method: 'POST',
          url: '/auth/login',
          payload: { email: 'alvo@example.com', password: 'senha12345' },
          headers: { 'x-forwarded-for': xff },
        });

      // Uma máquina só, girando o endereço forjado a cada tiro. O proxy anexa
      // sempre o mesmo IP real (198.51.100.77) à direita.
      const forjadas = [];
      for (let i = 0; i < 6; i += 1) {
        forjadas.push(await login(`203.0.113.${100 + i}, 198.51.100.77`));
      }
      expect(forjadas.map((res) => res.statusCode)).toEqual([401, 401, 401, 401, 401, 429]);

      // E o vizinho de CGNAT, que tem outro IP de origem de verdade, continua
      // com o balde dele — o limite não pode virar balde único.
      const deOutroIp = await login('198.51.100.78');
      expect(deOutroIp.statusCode).toBe(401);
    } finally {
      if (anterior === undefined) delete process.env.TRUST_PROXY;
      else process.env.TRUST_PROXY = anterior;
    }
  });

  it('não deixa o balde de auth derrubar o resto da API', async () => {
    const server = await startApp();
    for (let i = 0; i < 6; i += 1) {
      await server.inject({ method: 'POST', url: '/auth/login', payload: { email: 'a@b.com', password: 'senha12345' } });
    }

    const saude = await server.inject({ method: 'GET', url: '/health' });
    expect(saude.statusCode).toBe(200);
  });
});
