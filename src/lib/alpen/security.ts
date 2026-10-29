import { ensureIdToken } from "@/lib/alpen/fb-auth";

const BASE = "https://panel.alpensmp.net/alpen-sicherheit";

export class SecurityDown extends Error {}
export class SecurityDenied extends Error {}

export async function securityJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await ensureIdToken();
  if (!token) throw new SecurityDenied("keine Anmeldung");
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    throw new SecurityDown("nicht erreichbar");
  }
  if (res.status === 401 || res.status === 403) throw new SecurityDenied(String(res.status));
  if (!res.ok) throw new SecurityDown(String(res.status));
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
