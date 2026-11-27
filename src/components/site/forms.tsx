import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { lookupTicket, submitCommunity, submitTicket, type TicketView } from "@/lib/alpen/live";
import { communitySubmissionGaps } from "@/lib/alpen/community-consent";
import { DiscordLink } from "@/components/site/shell";

const COOLDOWN = 60_000;
const STAR_LINE = ["", "Autsch 😬", "Na ja...", "Solide", "Stark!", "Legendär! 🏔️"];
const REVIEW_KINDS = [
  ["both", "Beides"],
  ["image", "Nur Screenshot"],
  ["review", "Nur Rezension"],
] as const;
const IMAGE_OK = /image\/(png|jpeg|webp)/;
type ReviewConsentKey = "submissionAcknowledged" | "publicationConsent" | "imageRightsConfirmed";

function imageFile(file: File) {
  return IMAGE_OK.test(file.type) || /\.(png|jpe?g|webp)$/i.test(file.name);
}

export function ReviewForm() {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [starPulse, setStarPulse] = useState(0);
  const [kind, setKind] = useState<"both" | "image" | "review">("both");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [submissionAcknowledged, setSubmissionAcknowledged] = useState(false);
  const [publicationConsent, setPublicationConsent] = useState(false);
  const [rights, setRights] = useState(false);
  const [checkboxErrors, setCheckboxErrors] = useState<Record<ReviewConsentKey, boolean>>({
    submissionAcknowledged: false,
    publicationConsent: false,
    imageRightsConfirmed: false,
  });
  const [shakingCheckboxes, setShakingCheckboxes] = useState<ReviewConsentKey[]>([]);
  const [over, setOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const submissionAcknowledgementRef = useRef<HTMLInputElement>(null);
  const publicationConsentRef = useRef<HTMLInputElement>(null);
  const imageRightsRef = useRef<HTMLInputElement>(null);
  const lit = hover || rating;
  const sent = note.startsWith("Danke.");
  const textNeeded = kind !== "image";
  const imageNeeded = kind !== "review";

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
    const cleanText = textNeeded ? text.trim().slice(0, 800) : "";
    const missing = communitySubmissionGaps({
      name: cleanName,
      text: cleanText,
      kind,
      hasFile: Boolean(file),
      submissionAcknowledged,
      publicationConsent,
      imageRightsConfirmed: rights,
    });
    if (missing.length) {
      const errors: Record<ReviewConsentKey, boolean> = {
        submissionAcknowledged: missing.includes("Bestätigung zur Prüfung"),
        publicationConsent: missing.includes("Zustimmung zur Veröffentlichung"),
        imageRightsConfirmed: missing.includes("Bestätigung der Bildrechte"),
      };
      setCheckboxErrors(errors);
      const missingCheckboxes = (Object.keys(errors) as ReviewConsentKey[]).filter(
        (key) => errors[key],
      );
      setShakingCheckboxes([]);
      if (missingCheckboxes.length > 0) {
        window.requestAnimationFrame(() => {
          if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setShakingCheckboxes(missingCheckboxes);
          }
          const firstMissing = missingCheckboxes[0];
          if (firstMissing === "submissionAcknowledged") submissionAcknowledgementRef.current?.focus();
          if (firstMissing === "publicationConsent") publicationConsentRef.current?.focus();
          if (firstMissing === "imageRightsConfirmed") imageRightsRef.current?.focus();
        });
      }
      const otherMissing = missing.filter(
        (gap) =>
          gap !== "Bestätigung zur Prüfung" &&
          gap !== "Zustimmung zur Veröffentlichung" &&
          gap !== "Bestätigung der Bildrechte",
      );
      setNote(otherMissing.length ? `Noch fehlt: ${otherMissing.join(", ")}.` : "");
      return;
    }
    setCheckboxErrors({
      submissionAcknowledged: false,
      publicationConsent: false,
      imageRightsConfirmed: false,
    });
    const last = Number(localStorage.getItem("alpensmp_last_submit") || 0);
    if (Date.now() - last < COOLDOWN) {
      setNote("Bitte warte eine Minute zwischen Beiträgen.");
      return;
    }
    setBusy(true);
    setNote("Wird gesendet…");
    try {
      let imageUrl = "";
      if (file && imageNeeded) imageUrl = await compressImage(file);
      await submitCommunity({
        name: cleanName,
        text: cleanText,
        rating,
        kind,
        imageUrl,
        submissionAcknowledged,
        reviewPublicationConsent: textNeeded && publicationConsent,
        imagePublicationConsent: imageNeeded && publicationConsent,
        imageRightsConfirmed: imageNeeded && rights,
      });
      localStorage.setItem("alpensmp_last_submit", String(Date.now()));
      setName("");
      setText("");
      pickFile(null);
      setSubmissionAcknowledged(false);
      setPublicationConsent(false);
      setRights(false);
      setCheckboxErrors({
        submissionAcknowledged: false,
        publicationConsent: false,
        imageRightsConfirmed: false,
      });
      setShakingCheckboxes([]);
      setNote(
        "Danke. Dein Beitrag ist zur internen Prüfung eingegangen. Veröffentlicht wird nur, wofür du separat zugestimmt hast.",
      );
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        void import("canvas-confetti").then(({ default: confetti }) => {
          void confetti({
            particleCount: 72,
            spread: 72,
            startVelocity: 28,
            ticks: 72,
            gravity: 1.1,
            scalar: 0.8,
            origin: { x: 0.5, y: 0.62 },
            colors: ["#E1062C", "#F5C451", "#ffffff", "#9a9a9a"],
            disableForReducedMotion: true,
          });
        });
      }
    } catch (err) {
      setNote(
        err instanceof Error ? err.message : "Senden fehlgeschlagen. Alternativ über Discord.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className={`card card-still review-form${sent ? " is-live" : ""} space-y-5 p-5`}
      onSubmit={onSubmit}
    >
      <div>
        <h3 className="text-lg font-semibold">Reiche deinen Community-Beitrag ein</h3>
        <p className="mt-1 text-sm text-muted">
          {kind === "image"
            ? "Ein Bild reicht. Text ist freiwillig."
            : kind === "review"
              ? "Nur der Text. Ein Bild brauchst du nicht."
              : "Bild und Text, beides."}
        </p>
      </div>
      {sent ? (
        <div className="review-success-card" role="status">
          <div className="review-success-stars" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} style={{ animationDelay: `${(star - 1) * 70}ms` }}>
                ★
              </span>
            ))}
          </div>
          <div>
            <h4 className="font-semibold text-fg">Dein Beitrag ist angekommen!</h4>
            <p className="mt-1 text-sm text-muted">
              Das Team prüft ihn jetzt. Öffentlich erscheint er nur, wenn du der Veröffentlichung
              zugestimmt hast.
            </p>
          </div>
        </div>
      ) : null}
      <label className="block text-sm" htmlFor="review-name">
        Name (Ingame-Name)
        <input
          id="review-name"
          className="field mt-1"
          name="name"
          autoComplete="nickname"
          value={name}
          maxLength={32}
          onChange={(e) => setName(e.target.value)}
        />
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
              onClick={() => {
                setRating(n);
                setStarPulse((current) => current + 1);
              }}
              aria-pressed={n === rating}
              aria-label={`${n} Sterne`}
            >
              <span
                key={starPulse}
                className={starPulse ? "review-star-icon is-pulsing" : "review-star-icon"}
                style={{ animationDelay: `${(n - 1) * 45}ms` }}
              >
                ★
              </span>
            </button>
          ))}
        </div>
        <p className="review-line" aria-live="polite">
          {rating} von 5 · {STAR_LINE[rating]}
        </p>
      </fieldset>
      <fieldset className="review-block">
        <legend className="text-sm">Was du einreichst</legend>
        <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Art des Beitrags">
          {REVIEW_KINDS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={kind === value}
              tabIndex={kind === value ? 0 : -1}
              data-kind={value}
              className={
                kind === value ? "btn-brand review-kind is-on px-3" : "btn-ghost review-kind px-3"
              }
              onClick={() => setKind(value)}
              onKeyDown={(event) => {
                const currentIndex = REVIEW_KINDS.findIndex(([option]) => option === value);
                const delta =
                  event.key === "ArrowRight" || event.key === "ArrowDown"
                    ? 1
                    : event.key === "ArrowLeft" || event.key === "ArrowUp"
                      ? -1
                      : 0;
                if (!delta) return;
                event.preventDefault();
                const next =
                  REVIEW_KINDS[(currentIndex + delta + REVIEW_KINDS.length) % REVIEW_KINDS.length];
                setKind(next[0]);
                event.currentTarget.parentElement
                  ?.querySelector<HTMLButtonElement>(`[data-kind="${next[0]}"]`)
                  ?.focus();
              }}
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
            <p className="text-xs text-faint">
              Oder hierher ziehen. PNG, JPG oder WebP. Keine privaten Daten oder fremden Personen
              ohne Zustimmung zeigen.
            </p>
          </div>
          {preview && file ? (
            <div className="review-picked">
              <img src={preview} alt="Vorschau deines Bildes" className="review-preview" />
              <div className="min-w-0">
                <p className="truncate font-semibold">{file.name}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-ghost px-3"
                    onClick={() => fileRef.current?.click()}
                  >
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
      ) : null}
      {textNeeded ? (
        <label className="review-block block text-sm" htmlFor="review-text">
          Text
          <textarea
            id="review-text"
            className="field mt-1 min-h-28"
            name="text"
            value={text}
            maxLength={800}
            placeholder="Was hat dich begeistert? Was könnte besser sein?"
            onChange={(e) => setText(e.target.value)}
          />
        </label>
      ) : null}
      <label
        className={`review-check text-sm${checkboxErrors.submissionAcknowledged ? " is-invalid" : ""}${shakingCheckboxes.includes("submissionAcknowledged") ? " is-shaking" : ""}`}
        htmlFor="review-submission"
        onAnimationEnd={(event) => {
          if (event.animationName === "review-checkbox-shake") {
            setShakingCheckboxes((current) =>
              current.filter((key) => key !== "submissionAcknowledged"),
            );
          }
        }}
      >
        <input
          ref={submissionAcknowledgementRef}
          id="review-submission"
          className="review-check-input"
          type="checkbox"
          checked={submissionAcknowledged}
          aria-invalid={checkboxErrors.submissionAcknowledged}
          aria-describedby={
            checkboxErrors.submissionAcknowledged ? "review-submission-error" : undefined
          }
          onChange={(e) => {
            setSubmissionAcknowledged(e.target.checked);
            if (e.target.checked) {
              setCheckboxErrors((current) => ({ ...current, submissionAcknowledged: false }));
              setShakingCheckboxes((current) =>
                current.filter((key) => key !== "submissionAcknowledged"),
              );
            }
          }}
        />
        <span>
          Ich reiche den Beitrag zur internen Prüfung ein. Dafür wird er gespeichert und ist
          zunächst nur für das Team sichtbar. Eine öffentliche Veröffentlichung ist nicht Teil
          dieser Bestätigung. Details stehen in der{" "}
          <Link to="/datenschutz" className="text-brand underline">
            Datenschutzerklärung
          </Link>
          .
          {checkboxErrors.submissionAcknowledged ? (
            <span
              id="review-submission-error"
              className="mt-2 block font-semibold text-red-300"
              role="alert"
            >
              Bitte bestätige die interne Prüfung.
            </span>
          ) : null}
        </span>
      </label>
      <label
        className={`review-check text-sm${checkboxErrors.publicationConsent ? " is-invalid" : ""}${shakingCheckboxes.includes("publicationConsent") ? " is-shaking" : ""}`}
        htmlFor="community-publication"
        onAnimationEnd={(event) => {
          if (event.animationName === "review-checkbox-shake") {
            setShakingCheckboxes((current) =>
              current.filter((key) => key !== "publicationConsent"),
            );
          }
        }}
      >
        <input
          ref={publicationConsentRef}
          id="community-publication"
          className="review-check-input"
          type="checkbox"
          checked={publicationConsent}
          aria-invalid={checkboxErrors.publicationConsent}
          aria-describedby={
            checkboxErrors.publicationConsent ? "community-publication-error" : undefined
          }
          onChange={(e) => {
            setPublicationConsent(e.target.checked);
            if (e.target.checked) {
              setCheckboxErrors((current) => ({ ...current, publicationConsent: false }));
              setShakingCheckboxes((current) =>
                current.filter((key) => key !== "publicationConsent"),
              );
            }
          }}
        />
        <span>
          Ich willige ein, dass mein Ingame-Name und die von mir ausgewählten Inhalte
          (Rezensionstext und/oder Screenshot) nach Freigabe öffentlich gezeigt werden dürfen. Ich
          kann diese Einwilligung jederzeit für die Zukunft widerrufen oder die Entfernung
          verlangen.
          {checkboxErrors.publicationConsent ? (
            <span
              id="community-publication-error"
              className="mt-2 block font-semibold text-red-300"
              role="alert"
            >
              Bitte bestätige die Zustimmung zur Veröffentlichung.
            </span>
          ) : null}
        </span>
      </label>
      {imageNeeded ? (
        <label
          className={`review-check text-sm${checkboxErrors.imageRightsConfirmed ? " is-invalid" : ""}${shakingCheckboxes.includes("imageRightsConfirmed") ? " is-shaking" : ""}`}
          htmlFor="review-rights"
          onAnimationEnd={(event) => {
            if (event.animationName === "review-checkbox-shake") {
              setShakingCheckboxes((current) =>
                current.filter((key) => key !== "imageRightsConfirmed"),
              );
            }
          }}
        >
          <input
            ref={imageRightsRef}
            id="review-rights"
            className="review-check-input"
            type="checkbox"
            checked={rights}
            aria-invalid={checkboxErrors.imageRightsConfirmed}
            aria-describedby={
              checkboxErrors.imageRightsConfirmed ? "review-rights-error" : undefined
            }
            onChange={(e) => {
              setRights(e.target.checked);
              if (e.target.checked) {
                setCheckboxErrors((current) => ({ ...current, imageRightsConfirmed: false }));
                setShakingCheckboxes((current) =>
                  current.filter((key) => key !== "imageRightsConfirmed"),
                );
              }
            }}
          />
          <span>
            Ich darf dieses Bild zur Veröffentlichung freigeben. Es zeigt keine privaten Angaben und
            keine fremden Personen ohne deren Zustimmung.
            {checkboxErrors.imageRightsConfirmed ? (
              <span
                id="review-rights-error"
                className="mt-2 block font-semibold text-red-300"
                role="alert"
              >
                Bitte bestätige die Bildrechte.
              </span>
            ) : null}
          </span>
        </label>
      ) : null}
      <button
        className={sent ? "btn-brand review-send is-sent" : "btn-brand review-send"}
        type="submit"
        disabled={busy}
      >
        {busy ? "Wird gesendet…" : sent ? "Weiteren Beitrag einreichen" : "Zur Prüfung absenden"}
      </button>
      {!sent ? (
        <p className="text-sm text-muted" role="status">
          {note || "Bitte bestätige alle angezeigten Angaben, bevor du den Beitrag absendest."}
        </p>
      ) : null}
    </form>
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
  if (url.length > 700_000)
    throw new Error("Bild ist selbst verkleinert noch zu gross. Bitte ein kleineres Foto wählen.");
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
  const [code, setCode] = useState("");
  const [sent, setSent] = useState("");
  const [found, setFound] = useState<TicketView | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (company) return;
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
          <p className="mt-1 text-sm text-muted">
            Der Ticketcode ist ein geheimer Zugangslink. Teile ihn nur mit Personen, denen du
            Zugriff geben möchtest. Er läuft nach 30 Tagen ab.
          </p>
          <p className="mt-2 font-mono text-lg">{sent}</p>
        </div>
      ) : null}
      <form className="space-y-3" onSubmit={onSubmit}>
        <p className="text-sm text-muted">
          Beschreibe das Problem. Das Team verarbeitet deine Angaben, um dir zu antworten. Du
          bekommst einen Ticketcode und kannst den Status später nachlesen.{" "}
          <Link to="/datenschutz" className="text-brand underline">
            So werden deine Daten bearbeitet
          </Link>
          .
        </p>
        <label className="block text-sm" htmlFor="ticket-name">
          Minecraft-Name
          <input
            id="ticket-name"
            className="field mt-1"
            name="name"
            autoComplete="nickname"
            placeholder="Dein Ingame-Name"
            value={name}
            maxLength={32}
            required
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block text-sm" htmlFor="ticket-category">
          Kategorie
          <select
            id="ticket-category"
            className="field mt-1"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {["Bug", "Frage", "Beschwerde", "Sonstiges"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm" htmlFor="ticket-topic">
          Betreff
          <input
            id="ticket-topic"
            className="field mt-1"
            name="topic"
            placeholder="Worum geht es?"
            value={topic}
            maxLength={80}
            required
            onChange={(e) => setTopic(e.target.value)}
          />
        </label>
        <label className="block text-sm" htmlFor="ticket-msg">
          Beschreibung
          <textarea
            id="ticket-msg"
            className="field mt-1 min-h-32"
            name="message"
            placeholder="Was ist passiert?"
            value={msg}
            maxLength={800}
            required
            onChange={(e) => setMsg(e.target.value)}
          />
        </label>
        <input
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          aria-hidden="true"
        />
        <button className="btn-brand" disabled={busy} type="submit">
          Ticket senden
        </button>
        {note ? <p className="text-sm text-ice">{note}</p> : null}
      </form>
      <div className="mt-6 border-t border-line pt-5">
        <h3 className="font-semibold">Status prüfen</h3>
        <p className="mt-1 text-sm text-muted">
          Ticketcode eingeben. Er funktioniert als geheimer Zugangslink, läuft nach 30 Tagen ab und
          sollte nicht öffentlich geteilt werden.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="ticket-code">
            Ticket-Nummer
          </label>
          <input
            id="ticket-code"
            className="field"
            placeholder="ALP- und 32 Zeichen"
            value={code}
            maxLength={36}
            autoCapitalize="characters"
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            type="button"
            className="btn-ghost"
            onClick={async () => {
              const row = await lookupTicket(code);
              setFound(row);
              if (!row) setNote("Ticket nicht gefunden oder der Zugriffslink ist abgelaufen.");
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
