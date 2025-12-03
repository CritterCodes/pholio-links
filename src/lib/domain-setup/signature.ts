/**
 * Domain Setup Client - Utilities
 * HMAC signature verification
 */

import crypto from 'crypto';

export const SECRET = process.env.DOMAIN_SETUP_SECRET || 'change-this-secret-in-production';

/**
 * Create HMAC signature for data
 */
export function createSignature(data: Record<string, unknown> | string): string {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto
    .createHmac('sha256', SECRET)
    .update(body)
    .digest('hex');
}

/**
 * Verify HMAC signature
 */
export function verifySignature(body: string, signature: string): boolean {
  try {
    const expected = createSignature(body);
    return expected === signature;
  } catch {
    return false;
  }
}
