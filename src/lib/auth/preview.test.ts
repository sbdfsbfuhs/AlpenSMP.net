import assert from "node:assert/strict";
import test from "node:test";
import { parseAuthAllowedHosts } from "./preview.ts";

test("parseAuthAllowedHosts accepts and deduplicates configured hostnames", () => {
  assert.deepEqual(
    parseAuthAllowedHosts(" Preview.example.com, *.preview.example.com, preview.example.com "),
    ["preview.example.com", "*.preview.example.com"],
  );
});

test("parseAuthAllowedHosts rejects URLs, ports, and misplaced wildcards", () => {
  for (const value of [
    "https://preview.example.com",
    "preview.example.com:8080",
    "preview.*.example.com",
    "*.com",
  ]) {
    assert.throws(() => parseAuthAllowedHosts(value), /GROK_AUTH_ALLOWED_HOSTS/);
  }
});
