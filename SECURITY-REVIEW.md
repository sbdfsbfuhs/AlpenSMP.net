# AlpenSMP Security Review

**Audit date:** 2026-11-20
**Scope:** Uncommitted website changes, active Firebase Realtime Database rules, live security relay, provider retention and known data locations.
**Execution:** Read-only. No live rules, services, records or deployments were changed. No ticket, staff or community records were read.

## Findings

No critical finding was confirmed.

| # | Severity | File | Lines | Vulnerability | Confidence |
|---|----------|------|-------|---------------|------------|
| 1 | 🟠 HIGH | Live relay `server.js` | 241-245, 341-347, 725-779 | Public community GETs return complete records without status or consent filtering. Anonymous POSTs accept caller-supplied status and consent fields. This exposes non-public submissions and permits moderation/consent bypass. | 10/10 |
| 2 | 🟠 HIGH | `firebase/database.rules.json`; `src/lib/alpen/staff.ts` | 82, 89, 98-99, 531-536 | Owner write rules do not reject disabled owners. Pausing an owner only changes database flags; an owner with a valid Firebase session can restore access through direct rule-authorized writes. | 9/10 |
| 3 | 🟡 MEDIUM | `firebase/database.rules.json`; `src/lib/alpen/staff.ts` | 79-81, 86-89, 431-444 | Staff reads are broader than intended: disabled non-streamers can read staff mappings, and any authenticated staff UID can read another UID mapping. Those records include staff email addresses. No Firebase records were fetched. | 9/10 |
| 4 | 🟡 MEDIUM | Live relay `server.js`; `src/components/site/staff-community.tsx` | 236-237, 694-721, 772-774; 73-84 | The UI exposes community deletion only to owners/admins, while the relay authorizes DELETE with the broader community write-role list, including helpers/supporters. | 9/10 |
| 5 | ⚪ LOW | `src/lib/alpen/community-consent.ts` | 34-42 | Public display accepts an approved legacy record when consent fields are missing. The previous form required consent but did not persist it on the record, so per-item proof cannot be checked. Whether any such live records exist was not queried. | 8/10 |
| 6 | ⚪ LOW | `firebase/database.rules.json` | 108-111 | The Firebase `staffLog` rule permits active staff to create or alter audit entries with arbitrary `by` and `action` values. The current website path uses the relay, which limits `staffLog` writes to owners; impact on the legacy Firebase copy is unverified. | 8/10 |
| 7 | ⚪ LOW | `firebase/database.rules.json`; `src/routes/team.tsx` | 123-125; 267 | Any active staff account can write any `presence/<name>` node; the rule does not bind the path to the authenticated user. This permits presence spoofing, not account takeover. | 9/10 |
| 8 | ⚪ LOW | `src/lib/auth/gate-session.server.ts` | 62-64 | On a cookie-parse error, server logging includes the first 120 characters of a signed session `Set-Cookie` header. The branch is conditional and no production occurrence was verified; remove the value from logs to avoid credential exposure. | 7/10 |

## Verification and limitations

- The complete active Firebase rule file was compared with the repository copy; they are structurally identical. The root is deny-by-default, ticket/help-request Firebase data requires an active staff role, and the `site_stats_history` writer is not anonymous.
- The production relay's ticket path validates the ticket body, checks its linked support request and expiry, and prevents overwriting an existing ticket. Public-write rate-limit entries are expired and removed.
- Oracle instance metadata confirms `eu-frankfurt-1` (Frankfurt). The security API and Discord support-bot services run on that instance. Firebase Realtime Database is in `europe-west1` (Belgium). The Minecraft process was not independently mapped to a running service in this pass.
- The live privacy page still describes the Minecraft host as being in Switzerland; the uncommitted local page corrects this to Frankfurt.
- Vercel project plan and runtime region were unavailable. Vercel's published runtime-log retention varies by plan from one hour to 30 days: <https://vercel.com/docs/logs/runtime>. No ticket-code transmission to Vercel logs was identified; ticket access uses the separate panel relay.
- DriveBackupV2 has Google Drive enabled, scheduled backups disabled, remote `keep-count: 20` and `local-keep-count: 0`. This is a count limit, not a time period. Four local SQLite backup files were present; the oldest was 22 days old. Google Drive objects/region and OCI snapshots were not inspected. Plugin documentation: <https://github.com/MaxMaeder/DriveBackupV2/wiki/Backup-Storage>.
- The local bot greeting includes the Groq disclosure, but that wording was not found on the running bot.
- No community records, tickets, staff records, Drive files or snapshot contents were read. The conditional findings above remain unverified against live data.

## Validation

- `npm test`: 94 passed.
- `npm run typecheck`: passed.
- `npm run build:dev`: passed.
- `npm run check:auth`: passed against a temporary local development server.
- `git diff --check`: passed.
- `npm run lint`: failed on the existing `no-empty` error in `src/lib/app-data/client.server.ts:281`; it also reported warnings.

The website source changes remain uncommitted and were not deployed. This report is committed separately; it has not been pushed.
