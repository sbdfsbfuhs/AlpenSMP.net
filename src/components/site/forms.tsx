import { useState, type FormEvent } from "react";
import { lookupTicket, submitCommunity, submitTicket, type TicketView } from "@/lib/alpen/live";
import { DiscordLink } from "@/components/site/shell";

const COOLDOWN = 60_000;

export function ReviewForm() {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [kind, setKind] = useState<"both" | "image" | "review">("both");
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const cleanName = name.trim().slice(0, 32);
    const cleanText = text.trim().slice(0, 800);
    if (cleanName.length < 2 || cleanText.length < 4) {
      setNote("Name und ein kurzer Text bitte.");
      return;
    }
    if ((kind === "image" || kind === "both") && !file) {
      setNote("Für einen Shot bitte ein Bild wählen – oder nur eine Rezension senden.");
      return;
    }
    const last = Number(localStorage.getItem("alpensmp_last_submit") || 0);
    if (Date.now() - last < COOLDOWN) {
      setNote("Maximal 1 Beitrag pro Minute.");
      return;
    }
    setBusy(true);
    setNote("Wird gesendet…");
    try {
      let imageUrl = "";
      if (file && (kind === "image" || kind === "both")) {
        imageUrl = await compressImage(file);
      }
      await submitCommunity({ name: cleanName, text: cleanText, rating, kind, imageUrl });
      localStorage.setItem("alpensmp_last_submit", String(Date.now()));
      setName("");
      setText("");
      setFile(null);
      setNote("Danke. Dein Beitrag ist raus – das Team schaltet ihn frei, sobald er geprüft ist. Er erscheint nicht sofort.");
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Senden fehlgeschlagen. Alternativ über Discord.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card space-y-4 p-5" onSubmit={onSubmit}>
      <div>
        <h3 className="text-lg font-semibold">Reicht jetzt deines ein</h3>
        <p className="mt-1 text-sm text-muted">
          Shot, Rezension oder beides. Das Team prüft kurz – danach erscheint dein Beitrag in Galerie und Stimmen.
        </p>
      </div>
      <label className="block text-sm">
        Name
        <input className="field mt-1" value={name} maxLength={32} required onChange={(e) => setName(e.target.value)} />
      </label>
      <div>
        <p className="text-sm">Sterne</p>
        <div className="mt-2 flex gap-2">
          {[5, 4, 3, 2, 1].map((n) => (
            <button
              key={n}
              type="button"
              className={n === rating ? "btn-gold px-3" : "btn-ghost px-3"}
              onClick={() => setRating(n)}
              aria-pressed={n === rating}
            >
              {n}★
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["both", "Beides"],
            ["image", "Nur Screenshot"],
            ["review", "Nur Rezension"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={kind === value ? "btn-gold px-3" : "btn-ghost px-3"}
            onClick={() => setKind(value)}
          >
            {label}
          </button>
        ))}
      </div>
      {kind !== "review" ? (
        <label className="block text-sm">
          Bild
          <input
            className="mt-1 block w-full text-sm text-muted"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <span className="mt-1 block text-xs text-faint">PNG, JPG oder WebP – wird vor dem Senden verkleinert.</span>
        </label>
      ) : null}
      <label className="block text-sm">
        Text
        <textarea className="field mt-1 min-h-28" value={text} maxLength={800} required onChange={(e) => setText(e.target.value)} />
      </label>
      <button className="btn-gold" type="submit" disabled={busy}>
        Absenden zur Freigabe
      </button>
      <p className="text-sm text-muted">{note || "Wird nicht sofort öffentlich. Maximal 1 Beitrag pro Minute."}</p>
    </form>
  );
}

async function compressImage(file: File) {
  const bmp = await createImageBitmap(file);
  const max = 1280;
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Bild konnte nicht vorbereitet werden.");
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const url = canvas.toDataURL("image/jpeg", 0.72);
  if (url.length > 900_000) throw new Error("Bild ist nach dem Verkleinern noch zu gross. Bitte ein kleineres Foto wählen.");
  return url;
}

export function TicketForm() {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [msg, setMsg] = useState("");
  const [company, setCompany] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [found, setFound] = useState<TicketView | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (company) return;
    if (name.trim().length < 2 || msg.trim().length < 8) {
      setNote("Name und etwas mehr Text bitte.");
      return;
    }
    setBusy(true);
    try {
      const next = await submitTicket({
        name: name.trim().slice(0, 32),
        topic: topic.trim().slice(0, 80),
        msg: msg.trim().slice(0, 800),
      });
      setCode(next);
      setNote(`Ticket-Code: ${next} — merken, damit du die Antwort lesen kannst.`);
      setName("");
      setTopic("");
      setMsg("");
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Senden fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-5">
      <form className="space-y-3" onSubmit={onSubmit}>
        <p className="text-sm text-muted">
          Ticket hier oder auf Discord. Du bekommst einen Code und kannst die Antwort unten nachlesen.
        </p>
        <input className="field" placeholder="Name / Ingame" value={name} maxLength={32} required onChange={(e) => setName(e.target.value)} />
        <input className="field" placeholder="Thema (z. B. Join-Problem)" value={topic} maxLength={80} onChange={(e) => setTopic(e.target.value)} />
        <textarea className="field min-h-32" placeholder="Was ist passiert?" value={msg} maxLength={800} required onChange={(e) => setMsg(e.target.value)} />
        <input className="hidden" tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} aria-hidden="true" />
        <button className="btn-gold" disabled={busy} type="submit">
          Ticket senden
        </button>
        {note ? <p className="text-sm text-ice">{note}</p> : null}
      </form>
      <div className="mt-6 border-t border-line pt-5">
        <h3 className="font-semibold">Antwort prüfen</h3>
        <p className="mt-1 text-sm text-muted">Code eingeben, den du nach dem Senden bekommen hast.</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input className="field" placeholder="z. B. ALP-4K2P" value={code} maxLength={16} onChange={(e) => setCode(e.target.value)} />
          <button
            type="button"
            className="btn-ghost"
            onClick={async () => {
              const row = await lookupTicket(code);
              setFound(row);
              if (!row) setNote("Kein Ticket unter diesem Code.");
            }}
          >
            Status laden
          </button>
        </div>
        {found ? (
          <div className="mt-4 space-y-2 text-sm">
            <p>
              <span className="text-faint">Status: </span>
              {found.status}
              {found.topic ? ` · ${found.topic}` : ""}
            </p>
            <p className="text-muted">{found.msg}</p>
            {found.replies.length ? (
              found.replies.map((reply, i) => (
                <p key={i} className="rounded-md bg-bg px-3 py-2">
                  <span className="font-medium text-gold">{reply.by}: </span>
                  {reply.text}
                </p>
              ))
            ) : (
              <p className="text-faint">Noch keine Antwort.</p>
            )}
          </div>
        ) : null}
        <DiscordLink className="mt-4">Oder Discord öffnen</DiscordLink>
      </div>
    </div>
  );
}
