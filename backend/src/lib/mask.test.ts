import { describe, expect, it } from 'vitest';
import { maskEmail, maskPhone } from './mask.js';

describe('contact masking', () => {
  it('keeps only DDD and the final four phone digits', () => {
    expect(maskPhone('11912340000')).toBe('(11) •••••-0000');
    expect(maskPhone('1132340000')).toBe('(11) •••••-0000');
  });

  it('keeps only the first email character and domain', () => {
    expect(maskEmail('marina@example.test')).toBe('m•••@example.test');
  });
});
