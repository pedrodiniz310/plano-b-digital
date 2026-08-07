export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const Unauthorized = (code: string, message: string) => new HttpError(401, code, message);
export const Conflict = (code: string, message: string) => new HttpError(409, code, message);
export const NotFound = (code: string, message: string) => new HttpError(404, code, message);

/** Extrai `.statusCode` de um erro desconhecido (ex. erro de validação do Fastify), com fallback 500. */
export function statusCodeOf(err: unknown): number {
  if (typeof err === 'object' && err !== null && 'statusCode' in err) {
    const value = (err as { statusCode: unknown }).statusCode;
    if (typeof value === 'number') return value;
  }
  return 500;
}
