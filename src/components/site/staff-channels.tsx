import { useEffect, useState } from "react";
import {
  CHANNEL_LIMIT,
  CHANNEL_PLATFORMS,
  asPlatform,
  channelsFromBoard,
  cleanChannelUrl,
  type Channel,
  type ChannelBoard,
  type ChannelPlatform,
} from "@/lib/alpen/channels";
import { fbGet, fbSet } from "@/lib/alpen/staff";

export function ChannelsDesk({ note }: { note: (text: string) => void }) {
  const [rows, setRows] = useState<Channel[]>([]);
  const [custom, setCustom] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let stop = false;
    void fbGet<ChannelBoard>("site_stats/channelBoard")
      .then((data) => {
        if (stop) return;
        const parsed = channelsFromBoard(data);
        setCustom(parsed.custom);
        setRows(parsed.items);
        setReady(true);
      })
      .catch((err: unknown) => {
        if (stop) return;
        setError(err instanceof Error ? err.message : "Kanäle konnten nicht geladen werden");
        setRows(channelsFromBoard(null).items);
        setReady(true);
      });
    return () => {
      stop = true;
    };
  }, []);

  function patch(index: number, next: Partial<Channel>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...next } : row)));
  }

  async function save() {
    const items: Record<string, Channel> = {};
    for (const [index, row] of rows.entries()) {
      const label = row.label.trim();
      const url = cleanChannelUrl(row.url);
      if (!label || !url) {
        note("Jeder Account braucht einen Namen und einen https-Link");
        return;
      }
      if (label.length > 32) {
        note("Name max. 32 Zeichen");
        return;
      }
      items[`c${index}`] = { label, url, platform: asPlatform(row.platform) };
    }
    setBusy(true);
    try {
      await fbSet("site_stats/channelBoard", { set: true, items });
      setCustom(true);
      setError("");
      note(rows.length ? "Accounts stehen auf der Community-Seite" : "Community-Accounts sind weg");
    } catch (err) {
      const text = err instanceof Error ? err.message : "Speichern fehlgeschlagen";
      setError(text);
      note(text);
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <p className="text-sm text-muted">Lade Accounts…</p>;

  return (
    <section className="card card-still max-w-2xl p-5">
      <h2 className="text-lg font-semibold">Community-Accounts</h2>
      <p className="mt-2 text-sm text-muted">
        Discord und TikTok bleiben eure Accounts. Hier kommen Kanäle von Spielern dazu. Sie stehen auf der Community-Seite, unter Discord und TikTok. Nach dem Speichern gilt genau diese Liste.
      </p>
      {!custom ? (
        <p className="mt-3 text-sm text-ice">
          Lennarts YouTube ist schon auf der Community-Seite. Speichern, sobald du etwas ändern oder weitere Accounts hinzufügen willst.
        </p>
      ) : null}
      <ul className="mt-4 space-y-3">
        {rows.map((row, index) => (
          <li key={index} className="rounded-md border border-line bg-bg/40 p-3">
            <div className="grid gap-2 sm:grid-cols-[9rem_minmax(0,1fr)_auto]">
              <label className="text-sm">
                Plattform
                <select
                  className="field mt-1"
                  value={row.platform}
                  onChange={(event) => patch(index, { platform: event.target.value as ChannelPlatform })}
                >
                  {CHANNEL_PLATFORMS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Name auf der Seite
                <input
                  className="field mt-1"
                  maxLength={32}
                  value={row.label}
                  onChange={(event) => patch(index, { label: event.target.value.slice(0, 32) })}
                />
              </label>
              <button
                type="button"
                className="btn-ghost sm:self-end"
                onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
              >
                Entfernen
              </button>
            </div>
            <label className="mt-2 block text-sm">
              Link
              <input
                className="field mt-1"
                inputMode="url"
                placeholder="https://"
                value={row.url}
                onChange={(event) => patch(index, { url: event.target.value })}
              />
            </label>
          </li>
        ))}
      </ul>
      {!rows.length ? <p className="mt-4 text-sm text-muted">Keine Community-Accounts. Auf der Community-Seite bleiben dann nur Discord und TikTok.</p> : null}
      {error ? <p className="mt-3 text-sm text-ember">{error}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-ghost"
          disabled={rows.length >= CHANNEL_LIMIT}
          onClick={() => setRows((prev) => [...prev, { label: "", url: "https://", platform: "youtube" }])}
        >
          Account hinzufügen
        </button>
        <button type="button" className="btn-brand" disabled={busy} onClick={() => void save()}>
          {busy ? "Speichere…" : "Speichern"}
        </button>
      </div>
    </section>
  );
}
