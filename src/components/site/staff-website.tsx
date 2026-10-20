import { useEffect, useState } from "react";
import { can } from "@/lib/alpen/roles";
import { fbGet, fbPush, fbSet, fbUpdate, type StaffSession } from "@/lib/alpen/staff";

export function Website({ user, note }: { user: StaffSession; note: (text: string) => void }) {
  const [total, setTotal] = useState("");
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("");
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [color, setColor] = useState("#f5c400");
  const [buttonLabel, setButtonLabel] = useState("");
  const [buttonHref, setButtonHref] = useState("");
  const [lockTitle, setLockTitle] = useState("Kurz offline");
  const [lockMessage, setLockMessage] = useState("Die Website ist kurz abgeschaltet.");

  useEffect(() => {
    fbGet<{ total_players_ever?: number }>("site_stats").then((row) => {
      if (!row) return;
      setTotal(String(row.total_players_ever ?? ""));
    }).catch(() => {});
    fbGet<{ title?: string; message?: string; color?: string; button_label?: string; button_href?: string; lockdown?: boolean }>("site_status/active").then((row) => {
      if (!row) return;
      if (row.lockdown) {
        setLockTitle(row.title || "Kurz offline");
        setLockMessage(row.message || "");
      } else {
        setTitle(row.title || "");
        setMessage(row.message || "");
      }
      if (row.color?.startsWith("#")) setColor(row.color);
      setButtonLabel(row.button_label || "");
      setButtonHref(row.button_href || "");
    }).catch(() => {});
  }, []);

  async function saveTotal(next: number) {
    await fbUpdate("site_stats", { total_players_ever: next, updated_at: Date.now(), updated_by: user.username });
    await fbSet("total_players_ever", next);
    await fbPush("site_stats_history", { t: Date.now(), n: 0, total_players_ever: next, online_count: 0, by: user.username });
    setTotal(String(next));
    note("Spielerzahl gespeichert");
  }

  return (
    <div className="space-y-4">
      <form className="card card-still p-5" onSubmit={(e) => { e.preventDefault(); void saveTotal(Number(total)); }}>
        <h2 className="text-lg font-semibold">Spieler insgesamt</h2>
        <input className="field mt-3" value={total} onChange={(e) => setTotal(e.target.value)} />
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-brand" type="submit">Speichern</button>
          <button className="btn-ghost" type="button" onClick={() => void saveTotal(Number(total || 0) + 1)}>+1</button>
          <button className="btn-ghost" type="button" onClick={() => void saveTotal(Number(total || 0) + 5)}>+5</button>
        </div>
      </form>
      <form
        className="card card-still p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const body = {
            id: "active",
            status_type: "custom",
            type: "custom",
            title,
            message,
            is_active: true,
            lockdown: false,
            color,
            button_label: buttonLabel,
            button_href: buttonHref,
            created_by: user.username,
            updated_by: user.username,
            created_at: Date.now(),
            updated_at: Date.now(),
            expires_at: null,
          };
          void fbSet("site_status/active", body).then(() => fbPush("site_status/log", body)).then(() => note("Banner gesetzt"));
        }}
      >
        <h2 className="text-lg font-semibold">Banner</h2>
        <p className="mt-1 text-sm text-muted">Gelbes Absperrband oben. Die Website bleibt an.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="btn-ghost" onClick={() => { setTitle("Bedrock aus"); setMessage("Bedrock ist wegen eines Minecraft-Updates kurz offline."); setColor("#f5c400"); }}>Bedrock aus</button>
          <button type="button" className="btn-ghost" onClick={() => { setTitle("Server-Neustart"); setMessage("Der Server startet gerade neu. Gleich wieder da."); setColor("#f5c400"); }}>Neustart</button>
        </div>
        <input className="field mt-3" placeholder="Titel" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="field mt-2 min-h-20" placeholder="Text" value={message} onChange={(e) => setMessage(e.target.value)} />
        <label className="mt-3 flex items-center gap-3 text-sm">
          Farbe
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </label>
        <input className="field mt-2" placeholder="Knopf-Text, optional" value={buttonLabel} onChange={(e) => setButtonLabel(e.target.value)} />
        <input className="field mt-2" placeholder="Knopf-Link, z. B. Discord" value={buttonHref} onChange={(e) => setButtonHref(e.target.value)} />
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-brand" type="submit">Banner setzen</button>
          <button
            className="btn-ghost"
            type="button"
            onClick={() => {
              const body = { id: "active", status_type: "online", type: "online", title: "Online", message: "Alles läuft stabil.", is_active: false, lockdown: false, color, button_label: "", button_href: "", created_by: user.username, updated_by: user.username, created_at: Date.now(), updated_at: Date.now(), expires_at: null };
              void fbSet("site_status/active", body).then(() => note("Banner aus"));
            }}
          >
            Banner aus
          </button>
        </div>
      </form>
      {can(user.role, "lockdown") ? (
        <form
          className="card card-still p-5"
          onSubmit={(e) => {
            e.preventDefault();
            const body = {
              id: "active",
              status_type: "lockdown",
              type: "lockdown",
              title: lockTitle || "Kurz offline",
              message: lockMessage || "Die Website ist kurz abgeschaltet.",
              is_active: true,
              lockdown: true,
              color,
              button_label: "",
              button_href: "",
              created_by: user.username,
              updated_by: user.username,
              created_at: Date.now(),
              updated_at: Date.now(),
              expires_at: null,
            };
            void fbSet("site_status/active", body).then(() => note("Website aus. Team-Login bleibt."));
          }}
        >
          <h2 className="text-lg font-semibold">Website aus</h2>
          <p className="mt-1 text-sm text-muted">Lockdown schaltet die öffentliche Seite aus. Dieser Titel und Text ist genau das, was Besucher dann sehen. Die Team-Anmeldung bleibt.</p>
          <input className="field mt-3" placeholder="Titel" value={lockTitle} onChange={(e) => setLockTitle(e.target.value)} />
          <textarea className="field mt-2 min-h-20" placeholder="Text für Besucher" value={lockMessage} onChange={(e) => setLockMessage(e.target.value)} />
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn-brand" type="submit">Website aus</button>
            <button
              className="btn-ghost"
              type="button"
              onClick={() => {
                const body = { id: "active", status_type: "online", type: "online", title: "Online", message: "Alles läuft stabil.", is_active: false, lockdown: false, color, button_label: "", button_href: "", created_by: user.username, updated_by: user.username, created_at: Date.now(), updated_at: Date.now(), expires_at: null };
                void fbSet("site_status/active", body).then(() => note("Website wieder an"));
              }}
            >
              Website wieder an
            </button>
          </div>
        </form>
      ) : null}
      <form
        className="card card-still p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const stamp = { updated_by: user.username, updated_at: Date.now() };
          const payload: Record<string, { value: string; updated_by: string; updated_at: number }> = {};
          if (ip) payload.server_ip = { value: ip, ...stamp };
          if (port) payload.bedrock_port = { value: port, ...stamp };
          if (version) payload.recommended_version = { value: version, ...stamp };
          void fbUpdate("site_settings", payload).then(() => note("Einstellungen gespeichert"));
        }}
      >
        <h2 className="text-lg font-semibold">Serverangaben</h2>
        <input className="field mt-3" placeholder="Java: alpensmp.net" value={ip} onChange={(e) => setIp(e.target.value)} />
        <input className="field mt-2" placeholder="Bedrock-Port: 19132" value={port} onChange={(e) => setPort(e.target.value)} />
        <input className="field mt-2" placeholder="Version" value={version} onChange={(e) => setVersion(e.target.value)} />
        <button className="btn-brand mt-3" type="submit">Speichern</button>
      </form>
    </div>
  );
}
