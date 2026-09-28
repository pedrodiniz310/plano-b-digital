import * as SecureStore from 'expo-secure-store';
import { secureStore } from '../../state/secureStore';
import { fetchLatestAssessment, submitAssessment } from '../assessments';

jest.mock('expo-secure-store', () => {
  const keystore = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (key: string) => keystore.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => { keystore.set(key, value); }),
    deleteItemAsync: jest.fn(async (key: string) => { keystore.delete(key); }),
  };
});

const fetchMock = jest.fn();
globalThis.fetch = fetchMock as unknown as typeof fetch;

function httpResponse(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(body) };
}

beforeEach(async () => {
  await secureStore.clearSession();
  fetchMock.mockReset();
  (SecureStore.getItemAsync as jest.Mock).mockClear();
});

describe('fetchLatestAssessment', () => {
  it('retorna null somente quando a avaliação não existe', async () => {
    fetchMock.mockResolvedValueOnce(httpResponse(404, { code: 'assessment_not_found', message: 'Não encontrada.' }));
    await expect(fetchLatestAssessment()).resolves.toBeNull();
  });

  it('propaga falhas do servidor', async () => {
    fetchMock.mockResolvedValueOnce(httpResponse(500, { code: 'internal_error', message: 'Falha.' }));
    await expect(fetchLatestAssessment()).rejects.toMatchObject({ status: 500, code: 'internal_error' });
  });

  it('propaga outros erros 404', async () => {
    fetchMock.mockResolvedValueOnce(httpResponse(404, { code: 'not_found', message: 'Rota não encontrada.' }));
    await expect(fetchLatestAssessment()).rejects.toMatchObject({ status: 404, code: 'not_found' });
  });
});

describe('submitAssessment', () => {
  it('envia as respostas com autenticação e lê a pontuação do servidor', async () => {
    const answers = Object.fromEntries(Array.from({ length: 10 }, (_, index) => [index, index % 4]));
    const assessment = { answers, baseScore: 40, updatedAt: '2026-09-28T12:00:00.000Z' };
    await secureStore.setAccessToken('test-token');
    fetchMock.mockResolvedValueOnce(httpResponse(200, assessment));

    await expect(submitAssessment(answers)).resolves.toEqual(assessment);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/assessments'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ answers }), headers: expect.objectContaining({ Authorization: 'Bearer test-token' }) })
    );
  });
});
