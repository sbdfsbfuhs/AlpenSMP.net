import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { lookupTicket, submitCommunity, submitTicket, type TicketView } from "@/lib/alpen/live";
import { DiscordLink } from "@/components/site/shell";

const COOLDOWN = 60_000;
const STAR_LINE = ["", "Autsch 😬", "Na ja...", "Solide", "Stark!", "Legendär! 🏔️"];
const IMAGE_OK = /image\/(png|jpeg|webp)/;

export function reviewGaps(input: {
  name: string;
  text: string;
  kind: "both" | "image" | "review";
  hasFile: boolean;
  consent: boolean;
  rights: boolean;
}) {
  const gaps: string[] = [];
  if (input.name.trim().length < 2) gaps.push("Name");
  if (input.kind !== "image" && input.text.trim().length < 4) gaps.push("Text");
  if (input.kind !== "review" && !input.hasFile) gaps.push("Bild");
  if (!input.consent) gaps.push("Datenschutz");
  if (input.kind !== "review" && !input.rights) gaps.push("Bildrechte");
  return gaps;
}

function imageFile(file: File) {
  return IMAGE_OK.test(file.type) || /\.(png|jpe?g|webp)$/i.test(file.name);
}

export function ReviewForm() {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [kind, setKind] = useState<"both" | "image" | "review">("both");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);
  const [rights, setRights] = useState(false);
  const [over, setOver] = useState(false);
  const [motion, setMotion] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const lit = hover || rating;
  const sent = note.startsWith("Danke.");
  const textNeeded = kind !== "image";
  const imageNeeded = kind !== "review";
  const gaps = reviewGaps({ name, text, kind, hasFile: Boolean(file), consent, rights });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setMotion(false);
  }, []);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function pickFile(next: File | null) {
    if (!next) {
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (!imageFile(next)) {
      setNote("Nur PNG, JPG oder WebP. Diese Datei passt nicht.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (next.size > 12 * 1024 * 1024) {
      setNote("Das Bild ist grösser als 12 MB. Bitte ein kleineres Foto.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setNote("");
    setFile(next);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const cleanName = name.trim().slice(0, 32);
    const cleanText = text.trim().slice(0, 800);
    const missing = reviewGaps({ name: cleanName, text: cleanText, kind, hasFile: Boolean(file), consent, rights });
    if (missing.length) {
      setNote(`Noch fehlt: ${missing.join(", ")}.`);
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
      if (file && imageNeeded) imageUrl = await compressImage(file);
      await submitCommunity({ name: cleanName, text: cleanText, rating, kind, imageUrl });
      localStorage.setItem("alpensmp_last_submit", String(Date.now()));
      setName("");
      setText("");
      pickFile(null);
      setConsent(false);
      setRights(false);
      setNote("Danke. Dein Beitrag ist raus. Das Team prüft ihn, danach erscheint er. Nicht sofort.");
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Senden fehlgeschlagen. Alternativ über Discord.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={`card card-still review-form space-y-5 p-5${motion ? " is-live" : ""}`} onSubmit={onSubmit}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Reicht jetzt deins ein</h3>
          <p className="mt-1 text-sm text-muted">
            {kind === "image"
              ? "Ein Bild reicht. Text ist freiwillig."
              : kind === "review"
                ? "Nur der Text. Ein Bild brauchst du nicht."
                : "Bild und Text, beides."}
          </p>
        </div>
        <label className="review-motion text-xs text-faint">
          <input type="checkbox" checked={motion} onChange={(event) => setMotion(event.target.checked)} />
          Bewegung
        </label>
      </div>
      <label className="block text-sm" htmlFor="review-name">
        Name
        <input id="review-name" className="field mt-1" name="name" autoComplete="nickname" value={name} maxLength={32} onChange={(e) => setName(e.target.value)} />
      </label>
      <fieldset className="review-block">
        <legend className="text-sm">Sterne</legend>
        <div className="review-stars mt-2" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={n <= lit ? "review-star is-on" : "review-star"}
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(0)}
              onClick={() => setRating(n)}
              aria-pressed={n === rating}
              aria-label={`${n} Sterne`}
            >
              ★
            </button>
          ))}
        </div>
        <p className="review-line" aria-live="polite">{rating} von 5 · {STAR_LINE[rating]}</p>
      </fieldset>
      <fieldset className="review-block">
        <legend className="text-sm">Was du einreichst</legend>
        <div className="mt-2 flex flex-wrap gap-2">
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
            className={kind === value ? "btn-brand review-kind is-on px-3" : "btn-ghost review-kind px-3"}
            onClick={() => setKind(value)}
            aria-pressed={kind === value}
          >
            {label}
          </button>
        ))}
        </div>
      </fieldset>
      {imageNeeded ? (
        <div className="review-block text-sm">
          <p>Bild{kind === "both" ? "" : " · reicht allein"}</p>
          <div
            className={over ? "review-drop is-over" : "review-drop"}
            onDragOver={(event) => {
              event.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setOver(false);
              pickFile(event.dataTransfer.files?.[0] ?? null);
            }}
          >
            <input
              ref={fileRef}
              id="review-file"
              className="sr-only"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
            />
            <button type="button" className="btn-ghost" onClick={() => fileRef.current?.click()}>
              Bild wählen
            </button>
            <p className="text-xs text-faint">Oder hierher ziehen. PNG, JPG oder WebP.</p>
          </div>
          {preview && file ? (
            <div className="review-picked">
              <img src={preview} alt="Vorschau deines Bildes" className="review-preview" />
              <div className="min-w-0">
                <p className="truncate font-semibold">{file.name}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" className="btn-ghost px-3" onClick={() => fileRef.current?.click()}>
                    Austauschen
                  </button>
                  <button type="button" className="btn-ghost px-3" onClick={() => pickFile(null)}>
                    Entfernen
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="review-block text-sm text-muted">Kein Bild nötig.</p>
      )}
      <label className="review-block block text-sm" htmlFor="review-text">
        Text{textNeeded ? "" : " · optional"}
        <textarea
          id="review-text"
          className="field mt-1 min-h-28"
          name="text"
          value={text}
          maxLength={800}
          placeholder={textNeeded ? "Was hat dich begeistert? Was könnte besser sein?" : "Optional. Ein Bild allein reicht."}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <ul className="review-list text-sm">
        <Check ok={name.trim().length >= 2} label="Name eingetragen" />
        <Check ok label={`Sterne: ${rating} · ${STAR_LINE[rating]}`} />
        <Check ok={Boolean(file)} optional={!imageNeeded && !file} label={imageNeeded ? "Bild ausgewählt" : "Bild"} />
        <Check ok={text.trim().length >= 4} optional={!textNeeded && text.trim().length < 4} label={textNeeded ? "Text ergänzt" : "Text"} />
        <Check ok={consent} label="Datenschutz" />
        {imageNeeded ? <Check ok={rights} label="Bildrechte" /> : null}
      </ul>
      {gaps.length ? <p className="text-sm text-brand">Vor dem Absenden noch: {gaps.join(", ")}.</p> : <p className="text-sm text-muted">Alles Nötige ist da.</p>}
      <label className="review-check text-sm" htmlFor="review-consent">
        <input id="review-consent" className="review-check-input" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>
          Ich willige ein, dass Name, Text und Sterne
          {kind === "review" ? "" : " sowie das Bild"} gespeichert und nach Freigabe öffentlich gezeigt werden. Dazu die{" "}
          <Link to="/datenschutz" className="text-brand underline">Datenschutzerklärung</Link>.
        </span>
      </label>
      {imageNeeded ? (
        <label className="review-check text-sm" htmlFor="review-rights">
          <input id="review-rights" className="review-check-input" type="checkbox" checked={rights} onChange={(e) => setRights(e.target.checked)} />
          <span>Das Bild gehört mir oder ich darf es hier zeigen. Kein fremdes Foto.</span>
        </label>
      ) : null}
      <button className={sent ? "btn-brand review-send is-sent" : "btn-brand review-send"} type="submit" disabled={busy}>
        {busy ? "Wird gesendet…" : sent ? "Angekommen" : "Absenden zur Freigabe"}
      </button>
      <p className={sent ? "review-ok text-sm" : "text-sm text-muted"} role="status">{note || "Wird nicht sofort öffentlich. Maximal 1 Beitrag pro Minute."}</p>
    </form>
  );
}

function Check({ ok, label, optional = false }: { ok: boolean; label: string; optional?: boolean }) {
  return (
    <li className={ok ? "is-ok" : ""}>
      <span aria-hidden="true">{ok ? "✓" : optional ? "–" : "○"}</span>
      {label}
      {optional ? <span className="text-faint"> · optional</span> : null}
    </li>
  );
}

async function compressImage(file: File) {
  const bmp = await createImageBitmap(file);
  const edge = 1600;
  const scale = Math.min(1, edge / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bmp.width * scale));
  canvas.height = Math.max(1, Math.round(bmp.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Bild konnte nicht vorbereitet werden.");
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const url = canvas.toDataURL("image/jpeg", 0.82);
  if (url.length > 700_000) throw new Error("Bild ist selbst verkleinert noch zu gross. Bitte ein kleineres Foto wählen.");
  return url;
}

export function TicketForm() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Frage");
  const [topic, setTopic] = useState("");
  const [msg, setMsg] = useState("");
  const [company, setCompany] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);
  const [code, setCode] = useState("");
  const [sent, setSent] = useState("");
  const [found, setFound] = useState<TicketView | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (company) return;
    if (!consent) {
      setNote("Bitte die Datenschutz-Einwilligung anhaken.");
      return;
    }
    setBusy(true);
    try {
      const next = await submitTicket({
        name: name.trim(),
        topic: topic.trim(),
        msg: msg.trim(),
        category,
      });
      setSent(next);
      setCode(next);
      setNote("");
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
      {sent ? (
        <div className="mb-6 rounded-md border border-brand/40 bg-brand/10 p-4">
          <p className="font-semibold">Ticket gesendet</p>
          <p className="mt-1 text-sm text-muted">Merke dir die Nummer. Damit kannst du den Status unten prüfen.</p>
          <p className="mt-2 font-mono text-lg">{sent}</p>
        </div>
      ) : null}
      <form className="space-y-3" onSubmit={onSubmit}>
        <p className="text-sm text-muted">Beschreibe das Problem. Du bekommst eine Ticket-Nummer und kannst den Status später nachlesen.</p>
        <label className="block text-sm" htmlFor="ticket-name">
          Minecraft-Name
          <input id="ticket-name" className="field mt-1" name="name" autoComplete="nickname" placeholder="Dein Ingame-Name" value={name} maxLength={32} required onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block text-sm" htmlFor="ticket-category">
          Kategorie
          <select id="ticket-category" className="field mt-1" value={category} onChange={(e) => setCategory(e.target.value)}>
            {["Bug", "Frage", "Beschwerde", "Sonstiges"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="block text-sm" htmlFor="ticket-topic">
          Betreff
          <input id="ticket-topic" className="field mt-1" name="topic" placeholder="Worum geht es?" value={topic} maxLength={80} required onChange={(e) => setTopic(e.target.value)} />
        </label>
        <label className="block text-sm" htmlFor="ticket-msg">
          Beschreibung
          <textarea id="ticket-msg" className="field mt-1 min-h-32" name="message" placeholder="Was ist passiert?" value={msg} maxLength={800} required onChange={(e) => setMsg(e.target.value)} />
        </label>
        <input className="hidden" tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} aria-hidden="true" />
        <label className="flex items-start gap-3 text-sm" htmlFor="ticket-consent">
          <input id="ticket-consent" className="mt-1" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
          <span>
            Ich willige ein, dass Name, Thema und Nachricht für die Antwort gespeichert werden.{" "}
            <Link to="/datenschutz" className="text-brand underline">Datenschutzerklärung</Link>
          </span>
        </label>
        <button className="btn-brand" disabled={busy} type="submit">
          Ticket senden
        </button>
        {note ? <p className="text-sm text-ice">{note}</p> : null}
      </form>
      <div className="mt-6 border-t border-line pt-5">
        <h3 className="font-semibold">Status prüfen</h3>
        <p className="mt-1 text-sm text-muted">Ticket-Nummer eingeben. Ein Login ist nicht nötig.</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="ticket-code">Ticket-Nummer</label>
          <input id="ticket-code" className="field" placeholder="z. B. ALP-4K2P" value={code} maxLength={16} onChange={(e) => setCode(e.target.value)} />
          <button
            type="button"
            className="btn-ghost"
            onClick={async () => {
              const row = await lookupTicket(code);
              setFound(row);
              if (!row) setNote("Kein Ticket unter dieser Nummer.");
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
              {found.category ? ` · ${found.category}` : ""}
              {found.topic ? ` · ${found.topic}` : ""}
            </p>
            <p className="text-muted">{found.msg}</p>
            {found.replies.length ? (
              found.replies.map((reply, i) => (
                <p key={i} className="rounded-md bg-bg px-3 py-2">
                  <span className="font-medium text-brand">{reply.by}: </span>
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
