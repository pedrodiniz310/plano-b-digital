import fastifyRateLimit, { type RateLimitOptions } from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';
import { TooManyRequests } from '../lib/httpErrors.js';

/**
 * Teto de fundo, por IP. Um cliente mobile legítimo faz punhados de chamadas por
 * tela, então 100/min é folga larga — serve só pra nenhuma rota nascer sem
 * limite. O controle que importa é o por rota, abaixo.
 */
const GLOBAL_RATE_LIMIT: RateLimitOptions = { max: 100, timeWindow: '1 minute' };

/**
 * Signup, login e recover. Todas podem chegar ao argon2 e todas são alvo de
 * força bruta e enumeração. 5/min ainda cobre quem erra a senha algumas vezes
 * seguidas e trava um único IP em ~7.200 tentativas por dia — inviável contra a
 * política de senha de 8+ caracteres com dígito (`schemas/auth.ts`).
 */
export const AUTH_RATE_LIMIT: RateLimitOptions = { max: 5, timeWindow: '1 minute' };

/**
 * `/auth/guest` grava User + RefreshToken sem autenticação nenhuma. Uma pessoa
 * real toca "entrar como visitante" uma vez, talvez outra ao reinstalar. 5/hora
 * por IP põe teto no enchimento do banco sem atrapalhar uso legítimo.
 */
export const GUEST_RATE_LIMIT: RateLimitOptions = { max: 5, timeWindow: '1 hour' };

/**
 * `/auth/refresh` é chamada automática do app (uma em voo por vez, ver
 * `app/src/api/client.ts`) e não paga argon2. Aparelhos atrás do mesmo NAT
 * dividem o IP, então o limite é mais folgado que o de login.
 */
export const REFRESH_RATE_LIMIT: RateLimitOptions = { max: 20, timeWindow: '1 minute' };

/**
 * Chave do balde é `req.ip` — depende de `trustProxy` estar ligado quando há
 * proxy na frente (ver `app.ts`), senão o tráfego inteiro cai num balde só. E
 * depende de ele estar ligado como *contagem de saltos*, não como `true`: o
 * limite só vale enquanto a chave for o endereço que o proxy observou, e não
 * um que o cliente possa escrever no X-Forwarded-For.
 */
export async function registerRateLimit(app: FastifyInstance): Promise<void> {
  await app.register(fastifyRateLimit, {
    ...GLOBAL_RATE_LIMIT,
    // O plugin lança o que este builder devolve; devolvendo HttpError, o
    // handler de erro de `app.ts` responde no mesmo formato { code, message }
    // do resto da API, que é o que o cliente sabe ler.
    errorResponseBuilder: () =>
      TooManyRequests(
        'rate_limited',
        'Muitas tentativas em pouco tempo. Aguarde um instante e tente de novo.'
      ),
  });
}
