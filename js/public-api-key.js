const PROJECT_URL = /^https:\/\/([a-z0-9-]+)\.supabase\.co$/;
const PUBLISHABLE_KEY = /^sb_publishable_[A-Za-z0-9][A-Za-z0-9_-]{0,511}$/;
const JWT_SEGMENT = /^[A-Za-z0-9_-]+$/;
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function decodeClaims(segment) {
  if (!JWT_SEGMENT.test(segment) || segment.length % 4 === 1) return null;
  const base64 = segment.replaceAll('-', '+').replaceAll('_', '/');
  const bytes = Uint8Array.from(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')), character => character.charCodeAt(0));
  return JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(bytes));
}

/**
 * Only low-privilege client keys belong in public configuration. Legacy JWTs
 * must identify this project and the anonymous API role. The API still checks
 * the signature; this local guard never authenticates a user or grants access.
 */
export function isPublicApiKey(key, projectUrl) {
  if (typeof key !== 'string' || key.length > 16_384 || typeof projectUrl !== 'string') return false;
  const project = PROJECT_URL.exec(projectUrl)?.[1];
  if (!project) return false;
  if (PUBLISHABLE_KEY.test(key)) return true;
  const parts = key.split('.');
  if (parts.length !== 3 || !/^[A-Za-z0-9_-]{43}$/.test(parts[2])) return false;
  try {
    const header = decodeClaims(parts[0]), claims = decodeClaims(parts[1]);
    if (!isRecord(header) || header.alg !== 'HS256' || header.typ !== 'JWT' || !isRecord(claims)) return false;
    const now = Math.floor(Date.now() / 1000);
    return claims.iss === 'supabase' && claims.role === 'anon' && claims.ref === project
      && Number.isSafeInteger(claims.exp) && claims.exp > now
      && (claims.iat === undefined || Number.isSafeInteger(claims.iat) && claims.iat >= 0 && claims.iat <= now + 300)
      && (claims.nbf === undefined || Number.isSafeInteger(claims.nbf) && claims.nbf >= 0 && claims.nbf <= now);
  } catch {
    return false;
  }
}
