import { ApiError, apiRequest } from './client';

export interface TrustedContact {
  name: string;
  relation: string;
  phoneMasked: string;
  emailMasked: string | null;
  note: string | null;
}

export interface ContactInput {
  name: string;
  relation: string;
  phone: string;
  email?: string;
  note?: string;
}

export async function fetchContact(): Promise<TrustedContact | null> {
  try {
    return await apiRequest<TrustedContact>('/trusted-contact');
  } catch (error) {
    if (error instanceof ApiError && error.status === 404 && error.code === 'contact_not_found') return null;
    throw error;
  }
}

export function saveContact(input: ContactInput): Promise<TrustedContact> {
  return apiRequest<TrustedContact>('/trusted-contact', { method: 'PUT', body: input });
}

export function deleteContact(): Promise<void> {
  return apiRequest<void>('/trusted-contact', { method: 'DELETE' });
}
