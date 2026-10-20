import { useState } from "react";
import { useLive } from "@/components/site/staff-live";
import { entries, formatRemaining, formatWhen, isPermanentBan, type ModItem } from "@/lib/alpen/staff";

export function PlayerSearch() {
  const bans = useLive<ModItem>("bans");
  const warns = useLive<ModItem>("warns");
  const notes = useLive<ModItem>("notes");
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const grouped = new Map<string, { kind: string; detail: string; ts?: number; perm: boolean; proof?: string; extra?: string }[]>();
  if (needle.length >= 2) {
    const add = (name: string, row: { kind: string; detail: string; ts?: number; perm: boolean; proof?: string; extra?: string }) => {
      const key = name.trim() || "Ohne Namen";
      const blob = `${key} ${row.detail} ${row.extra || ""}`.toLowerCase();
      if (!blob.includes(needle)) return;
      const list = grouped.get(key) ?? [];
      list.push(row);
      grouped.set(key, list);
    };
    for (const [, item] of entries(bans)) {
      add(item.name || "", { kind: "Ban", detail: `${item.reason || ""} · ${item.duration || formatRemaining(item.endsAt)}${item.pending ? " · wartet" : ""}${item.archived ? " · archiviert" : ""}`, ts: item.ts, perm: isPermanentBan(item), proof: item.proof });
    }
    for (const [, item] of entries(warns)) {
      add(item.name || "", { kind: "Warnung", detail: `${item.reason || ""} · ${item.duration || ""}${item.archived ? " · archiviert" : ""}`, ts: item.ts, perm: false });
    }
    for (const [, item] of entries(notes)) {
      add(item.name || "", { kind: "Notiz", detail: item.text || "", ts: item.ts, perm: false, extra: item.text });
    }
  }

  return (
    <section className="card card-still mt-4 p-4">
      <label className="text-sm font-semibold" htmlFor="player-search">Spieler-Akte</label>
      <input id="player-search" className="field mt-2" placeholder="Spielername" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="mt-3 space-y-3">
        {[...grouped.entries()].slice(0, 8).map(([name, rows]) => (
          <article key={name} className="rounded-md border border-line p-3">
            <h2 className="font-semibold">{name}</h2>
            <ul className="mt-2 space-y-2">
              {rows.map((row, index) => (
                <li key={`${row.kind}-${index}`} className={row.perm ? "text-sm text-red-200" : "text-sm text-muted"}>
                  <span className="font-semibold text-fg">{row.kind}.</span> {row.detail} · {formatWhen(row.ts)}
                  {row.proof && /^https?:\/\//i.test(row.proof) ? <a className="ml-2 text-brand" href={row.proof} target="_blank" rel="noreferrer">Beweis</a> : null}
                </li>
              ))}
            </ul>
          </article>
        ))}
        {needle.length >= 2 && grouped.size === 0 ? <p className="text-sm text-muted">Nichts zu diesem Namen</p> : null}
      </div>
    </section>
  );
}

export function CheckInBanner() {
  const users = useLive<{ disabled?: boolean }>("staffUsers");
  const presence = useLive<{ lastSeen?: number }>("presence");
  const absences = useLive<{ by?: string; from?: string; until?: string }>("absences");
  const today = new Date().toISOString().slice(0, 10);
  const away = new Set(entries(absences).filter(([, item]) => item.from && item.until && item.from <= today && today <= item.until).map(([, item]) => item.by || ""));
  const late = entries(users).filter(([name, item]) => {
    if (item.disabled || away.has(name)) return false;
    const seen = presence[name]?.lastSeen || 0;
    return !seen || Date.now() - seen > 3 * 86_400_000;
  });
  if (!late.length) return null;
  return (
    <p className="mt-4 rounded-md border border-red-500 bg-red-950/40 px-3 py-2 text-sm text-red-200">
      Seit mehr als 3 Tagen nicht im Team und nicht abwesend: {late.map(([name]) => name).join(", ")}
    </p>
  );
}

