# AlpenSMP Security Review — Local Remediation

**Review date:** 2026-11-23
**Status:** Vercel confirms that Production deployment `dpl_DGmsL1zzTqUgxqfQdmisjvpAgrKB` (dashboard path suffix `DGmsL1zzTqUgxqfQdmisjvpAgrKB`) is `Ready` and `Current`, serves `alpensmp.net`, and uses commit `33a6317` from branch `quelle`. The Vercel team is on the Hobby plan; runtime-log retention is one hour per Vercel's current documentation, and the project settings specify 30 days for canceled, errored, pre-production, and production deployments. Matching Firebase Realtime Database rules and Relay changes were deployed and verified. No intentional changes were made to live services during this follow-up. This internal report and the sanitized public summary remain local and were not pushed.

> This file is the detailed internal report. Do not publish it without reviewing and redacting it first. `SECURITY-REVIEW-PUBLIC.md` is the sanitized summary.

## Scope and baseline

- Implemented local fixes for the confirmed findings from the read-only review: community relay authorization and consent, paused-owner enforcement, staff data minimization, deletion-role alignment, legacy consent handling, staff logs, presence, and session-cookie logging.
- Firebase rules and website code are in the local repository. The live relay source is not; its change is prepared as a patch against the saved read-only baseline in the session files, together with the two required policy modules.
- No community or ticket contents were read. The active Firebase rules were exported read-only before deployment. A minimal Owner profile/UID-mapping check was also performed; only active/role-consistency results were emitted, and no identifier or email was recorded in the report.
- Earlier local legal/privacy-page and form changes were preserved; they were not part of this security remediation.

## Findings and local remediation

| # | Severity | Location | Finding and local change | Status |
|---|---|---|---|---|
| 1 | HIGH | Private relay patch `server.js:752-843`; `security-api/community-policy.cjs:26-138` | Public community reads filter for approval and explicit publication consent (and image-rights confirmation for images). Anonymous submissions are field-whitelisted, remain pending, and receive consent/status/timestamps from the server. Moderation records the authenticated moderator. | Deployed; anonymous live tests passed; no entries were publicly visible |
| 2 | HIGH | `firebase/database.rules.json:78-122`; `src/lib/alpen/staff.ts:570-589`; private relay patch `server.js:702-750,913-982` | Disabled mappings block owner/staff rule paths. Owner bootstrap requires a pre-provisioned active identity. Pausing disables the UID mapping first; resuming enables the profile before the mapping. Relay authorization requires a matching UID, role, and enabled profile. | Deployed; rules read-back matches the release; Owner mapping verified active |
| 3 | MEDIUM | `firebase/database.rules.json:78-110`; `src/lib/alpen/staff.ts:414-430`; `src/components/site/staff-accounts.tsx:67-83` | Staff-account records are owner-only except for a staff member's own record. Other active staff use a minimized `staffDirectory` without email addresses; paused staff cannot read it. | Rules deployed; Owner sync successfully updated 14 minimized directory entries |
| 4 | MEDIUM | Private relay patch `server.js:723-745`; `security-api/community-policy.cjs:193-204` | Community moderation and deletion permissions are checked separately on the server. Helper/supporter roles may moderate but cannot delete; deletion is limited to owner/admin. | Deployed; unauthenticated live deletion was rejected |
| 5 | LOW | `security-api/community-policy.cjs:26-45`; `src/lib/alpen/community-consent.ts` | Public display requires explicit publication consent; images also require image-rights confirmation. Legacy records without proof are hidden rather than deleted. | Deployed; public endpoints returned zero visible entries; underlying records were not inspected |
| 6 | LOW | `firebase/database.rules.json:121-123`; private relay patch `server.js:728-745,811-824`; `security-api/community-policy.cjs:3-19,169-191` | Direct Firebase writes to `staffLog` are denied. Relay derives `by` and timestamp from the authenticated staff identity, restricts action labels, and maps actions to the roles permitted to perform them. Free-form detail is client-supplied, and the log is not cryptographically bound to the underlying operation. | Deployed; role/action policy tests pass; anonymous Relay reads/writes rejected; residual audit-integrity limitation remains |
| 7 | LOW | `firebase/database.rules.json:134-138` | Presence writes are bound to the UID linked to that staff name, and disabled staff are rejected. | Deployed; emulator tests passed |
| 8 | LOW | `src/lib/auth/gate-session.server.ts:62-64` | Cookie/session values are no longer included in the missing-cookie error log; only a static message is logged. | Website release deployed |
| 9 | MEDIUM | `firebase/database.rules.json:142-158`; `security-tests/firebase-rules.test.mjs:226-249` | Rules require chat authorship to match the authenticated staff username; emulator tests cover valid, forged, and paused-account cases. | Deployed; rules read-back matches the release |
| 10 | MEDIUM (operational) | Session-local Relay copy `alpen-sicherheit-server.local.js:207`; CORS test in `alpen-sicherheit-cors.test.cjs` | The authenticated Staff-Center sends `PATCH` for ban-list synchronization, but the Relay CORS method list omitted `PATCH` even though the data handler already supports it and enforces staff roles. | Fixed in the local Relay copy and deployment patch only; not deployed |

No critical finding was identified in the prior review. The high- and medium-priority access-control changes are now live; remaining verification gaps and operational follow-ups are listed below.

## Changed files

Security remediation and tests:

- `firebase/database.rules.json`, `firebase.test.json`
- `security-api/community-policy.cjs`, `security-api/staff-policy.cjs`
- `security-tests/community-policy.test.mjs`, `security-tests/staff-policy.test.mjs`, `security-tests/firebase-rules.test.mjs`
- `package.json`, `package-lock.json`
- `src/lib/alpen/community-consent.ts`, `src/lib/alpen/live.ts`, `src/lib/alpen/staff.ts`
- `src/lib/alpen/staff.test.ts`, `src/lib/alpen/staff-account-flow.test.ts`
- `src/components/site/staff-accounts.tsx`, `staff-community.tsx`, `staff-extra.tsx`, `staff-roster.tsx`
- `src/routes/team.tsx`, `src/lib/auth/gate-session.server.ts`
- Session-local Relay source/patch and CORS regression test: `alpen-sicherheit-server.local.js`, `alpen-sicherheit-server.patch`, `alpen-sicherheit-cors.test.cjs` (outside the website repository)

The worktree also contains earlier legal/privacy and form edits; these were preserved, not rolled back. The private Relay changes remain separate from the website Git diff; the deployed source and policy modules are retained in the session files for traceability.

## Verification

- `npm test`: 94 application tests and 9 focused security-policy tests passed; the script's empty `scripts/**/*.test.mjs` selector reports 0 tests.
- `npm run test:firebase-rules`: 8 Firebase Emulator tests passed using only `demo-alpensmp-security`; production Firebase access was not attempted.
- `npm run typecheck`: passed.
- `npm run build:dev`: passed.
- Relay JavaScript syntax, Firebase rules JSON, and `git diff --check`: passed.
- Relay patch was applied to a temporary copy of the saved baseline and matched the local relay source after newline normalization.
- After deployment, 8 Relay policy tests passed; after adding role/action enforcement, all 9 passed. The updated policy hash is installed live with its previous version backed up. Production checks confirmed the updated privacy page, exact Firebase-rules read-back, Relay health, zero anonymously visible community entries, HTTP 400 for an anonymous forged approval, and HTTP 401 for anonymous Relay `staffLog` reads/writes and community deletion.
- A direct anonymous Firebase read of `community_reviews` returned HTTP 401. No intentional production write test was attempted.
- On 2026-11-23, an authenticated Staff-Center session displayed the active `Owner` role and loaded the read-only dashboard. No deliberate production write was used to test mutation paths. The page's automatic ban synchronization emitted a `PATCH` request to the Relay data endpoint, but the browser rejected its CORS preflight because `PATCH` was not permitted; that request did not reach the service. This confirms a live integration failure for at least one attempted update, not a server-side authorization bypass. The relevant caller is `src/routes/team.tsx:842-923,982-1013`, using `src/lib/alpen/security.ts:72-92`. Local policy and Firebase Emulator tests pass, but authenticated production writes remain unverified.
- The session-local Relay copy now includes `PATCH` in its CORS method list. The server-side handler already accepts `PATCH` and continues to require active staff identity and role authorization. Added `alpen-sicherheit-cors.test.cjs`; its contract test passes, `node --check` passes, and the updated deployment patch applies cleanly to the saved baseline and reproduces the local Relay copy. The patch was not deployed and the live write path was not retested.
- The Vercel dashboard shows the deployment above as the current Production deployment with `alpensmp.net` assigned. Project deployment-retention settings are 30 days for all four deployment states. The current Production alias is an exception to automatic deletion while it remains assigned; 30 days is an eligibility policy, not a guarantee that the current deployment is deleted on day 30. Official runtime-log retention is plan-dependent; the Hobby plan provides one hour. The request header `X-Vercel-Id` was not used as a deployment or region identifier.
- Relay files were installed only after the active `server.js` hash matched the saved baseline. The original source is backed up at `/home/ubuntu/alpen-sicherheit/backups/security-rollout-33a6317-20261120191602/server.js`.
- The prior Relay policy is backed up at `/home/ubuntu/alpen-sicherheit/backups/security-rollout-33a6317-20261120191602/community-policy.cjs.before-role-allowlist`.
- Commit `33a6317` was pushed to `quelle`; the available `Vercel Preview Comments` check succeeded, while the Production domain independently served the expected updated privacy content. The exact Vercel deployment ID was not established. Firebase rules were deployed from that release and read back for exact equality. No Minecraft restart or production-data deletion occurred.
- Secret-pattern scan of the private relay source: no matches.
- Full `npm run lint`: blocked by an existing `no-empty` error in unchanged `src/lib/app-data/client.server.ts:281`; it also reported warnings, including an existing unused `describeLogin` warning in `staff.ts`.
- `npm audit` previously reported 0 vulnerabilities after the targeted dependency override; no dependency changes were made in this remediation.

The emulator-generated `database-debug.log` and the temporary patch-check copy were removed after verification.

## Provider retention and location evidence

- **Vercel:** The authenticated dashboard confirms Hobby and project deployment retention of 30 days for canceled, errored, pre-production, and production deployments. Vercel documents one hour of runtime-log retention for Hobby. This is a provider plan limit, not a project-specific log setting. Deployments with a production alias are exempt from automatic deletion while the alias remains assigned. The exact function/data-processing region was not verified.
- **Firebase / Google Cloud:** Google's Firebase privacy documentation says Realtime Database IP-address and user-agent data is retained for a few days; Firebase Authentication logs IP addresses for a few weeks, while other authentication information remains until the customer deletes the account, with deletion from live and backup systems within 180 days. Cloud Logging's default log-bucket retention is 30 days unless configured otherwise. The project's actual log buckets, sinks, and custom retention were not inspected.
- **Groq:** Groq's current documentation says inference inputs and outputs are not retained by default, but may be retained for reliability/abuse investigations for up to 30 days unless Zero Data Retention is enabled. Retained customer data is described as stored in US GCP buckets. The account's ZDR setting was not inspected.
- **Google Drive:** The previously inspected DriveBackupV2 configuration uses `keep-count: 20`, `local-keep-count: 0`, and has scheduled backups disabled. This is a count limit, not an age-based retention period. The Drive account's region, actual backup inventory, and whether plugin deletions enter Drive Trash were not verified. Google's consumer Drive help says trashed files are permanently deleted after 30 days; that does not establish how this plugin deletes files.
- **Oracle Cloud:** The instance region was previously confirmed as `eu-frankfurt-1`. Oracle documents that custom Block Volume backup policies can set schedules and retention, while Oracle-defined policies have fixed retention. The OCI backup inventory, assigned policy, and any cross-region copies were not inspected, so no actual snapshot retention period is confirmed.
- **Discord:** Provider retention is account- and content-dependent; no AlpenSMP-specific Discord data-retention control was inspected. Provider documentation is not evidence of the server's own message, bot-log, or ticket retention.

## Open risks and required follow-up

1. Authenticated production write workflows remain unverified. The local Relay copy and deployment patch now permit the already-authorized `PATCH`, but this fix has not been deployed. After a separately approved deployment, verify the path with synthetic data in a controlled environment; do not use a real ban or account change for this test.
2. Public community reads returned zero visible records. No underlying community records were enumerated, so the existence and state of legacy records remain unknown.
3. StaffLog actions are role-limited, but an authorized actor can still submit a permitted action without a server-side transaction proof; free-form detail remains client-provided.
4. Vercel deployment identity, plan, and deployment/log retention are now verified. Vercel function/data region; Google Drive region and file inventory; OCI backup inventory, policy, and cross-region copies; Firebase/GCP project-specific logging configuration; and Groq's ZDR setting remain unverified. Firebase's database region was previously identified as `europe-west1`.
5. The Firebase rollback rules export remains private at `firebase-rules-before-alpensmp-ad844.json`. The Relay source backup is on the server at the path recorded in the verification section. No production records were deleted, and Minecraft was not restarted.

Official retention references: [Vercel Runtime Logs](https://vercel.com/docs/logs/runtime), [Vercel Deployment Retention](https://vercel.com/docs/deployment-retention), [Firebase privacy and retention](https://firebase.google.com/support/privacy), [Google Cloud Logging buckets](https://cloud.google.com/logging/docs/buckets#retention), [Groq Your Data](https://console.groq.com/docs/your-data), [Google Drive deleted files](https://support.google.com/drive/answer/1716222?hl=en), [Discord retention](https://support.discord.com/hc/en-us/articles/5431812448791-How-long-Discord-keeps-your-information), and [OCI Block Volume Backup Policies](https://docs.oracle.com/en-us/iaas/Content/Block/Tasks/schedulingvolumebackups.htm).
