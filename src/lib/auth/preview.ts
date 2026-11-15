/** The shared auth broker issuer (OIDC discovery lives under it). */
export const GROK_ISSUER_DEFAULT = "https://auth.grok.me";

const AUTH_HOST_PATTERN =
  /^(?:\*\.)?(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

/** Parse explicitly configured dynamic auth hosts; never add a built-in wildcard. */
export function parseAuthAllowedHosts(value: string | undefined): string[] {
  const hosts = (value ?? "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
  if (hosts.some((host) => !AUTH_HOST_PATTERN.test(host))) {
    throw new Error(
      "GROK_AUTH_ALLOWED_HOSTS must contain only hostnames or leading *.host patterns",
    );
  }
  return [...new Set(hosts)];
}
