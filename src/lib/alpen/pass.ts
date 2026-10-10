const ITERATIONS = 150_000;

function encode(bytes: Uint8Array) {
  let text = "";
  for (const value of bytes) text += String.fromCharCode(value);
  return btoa(text);
}

function decode(value: string) {
  const text = atob(value);
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i);
  return bytes;
}

export async function hashPassword(password: string, saltB64?: string, iterations = ITERATIONS) {
  const salt = saltB64 ? decode(saltB64) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
  return { salt: encode(salt), hash: encode(new Uint8Array(bits)), iterations };
}

export async function passwordMatches(
  password: string,
  row: { salt?: string; hash?: string; iterations?: number } | null,
) {
  if (!row?.salt || !row.hash) return false;
  const next = await hashPassword(password, row.salt, row.iterations || ITERATIONS);
  if (next.hash.length !== row.hash.length) return false;
  let diff = 0;
  for (let i = 0; i < next.hash.length; i++) diff |= next.hash.charCodeAt(i) ^ row.hash.charCodeAt(i);
  return diff === 0;
}
