/**
 * Domain validation utilities
 */

const DOMAIN_REGEX = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

export function validateDomain(domain: string): { valid: boolean; error: string | null } {
  if (!domain || typeof domain !== 'string') {
    return { valid: false, error: 'Domain must be a string' };
  }

  if (domain.length < 3 || domain.length > 253) {
    return { valid: false, error: 'Domain must be between 3 and 253 characters' };
  }

  if (!DOMAIN_REGEX.test(domain)) {
    return { valid: false, error: 'Invalid domain format' };
  }

  return { valid: true, error: null };
}

export function checkBlacklist(
  domain: string,
  customBlacklist: string[] = []
): { blacklisted: boolean; reason: string | null } {
  const defaultBlacklist = [
    'pholio.link',
    'localhost',
    'example.com',
    'test.com',
  ];

  const fullBlacklist = [...defaultBlacklist, ...customBlacklist];
  const lowerDomain = domain.toLowerCase();

  const found = fullBlacklist.find((item) => {
    const pattern = item.replace(/\*/g, '.*');
    return new RegExp(`^${pattern}$`, 'i').test(lowerDomain);
  });

  if (found) {
    return { blacklisted: true, reason: `Domain matches blacklist pattern: ${found}` };
  }

  return { blacklisted: false, reason: null };
}
