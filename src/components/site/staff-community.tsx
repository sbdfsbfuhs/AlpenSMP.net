import { useEffect, useState } from "react";
import { Neu } from "@/components/site/staff-shared";
import { canPublishCommunityItem } from "@/lib/alpen/community-consent";
import { relayDetail } from "@/lib/alpen/security";
import {
  entries,
  fbGet,
  fbRemove,
  formatWhen,
  freshStamp,
  type CommunityItem,
  type StaffSession,
} from "@/lib/alpen/staff";

export function Community({ user, note }: { user: StaffSession; note: (text: string) => void }) {
  const [reviews, setReviews] = useState<Record<string, CommunityItem>>({});
  const [images, setImages] = useState<Record<string, CommunityItem>>({});
  const [filter, setFilter] = useState("open");
  const load = () => {
    void fbGet<Record<string, CommunityItem>>("community_reviews").then((value) =>
      setReviews(value ?? {}),
    );
    void fbGet<Record<string, CommunityItem>>("community_images").then((value) =>
      setImages(value ?? {}),
    );
  };
  useEffect(() => {
    load();
  }, []);
  const mark = (kind: "reviews" | "images", key: string, status: string) => {
    const set = kind === "reviews" ? setReviews : setImages;
    set((prev) => ({ ...prev, [key]: { ...prev[key], status } }));
  };
  const drop = (kind: "reviews" | "images", key: string) => {
    const set = kind === "reviews" ? setReviews : setImages;
    set((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {["open", "approved", "rejected", "all"].map((item) => (
          <button
            key={item}
            type="button"
            className={item === filter ? "btn-brand" : "btn-ghost"}
            onClick={() => setFilter(item)}
          >
            {item === "open"
              ? "Offen"
              : item === "approved"
                ? "Frei"
                : item === "rejected"
                  ? "Abgelehnt"
                  : "Alle"}
          </button>
        ))}
        <button type="button" className="btn-ghost" onClick={load}>
          Neu laden
        </button>
      </div>
      <Queue
        title="Rezensionen"
        path="community_reviews"
        items={entries(reviews)}
        filter={filter}
        note={note}
        canDelete={user.role === "owner" || user.role === "admin"}
        onStatus={(key, status) => mark("reviews", key, status)}
        onDelete={(key) => drop("reviews", key)}
      />
      <Queue
        title="Screenshots"
        path="community_images"
        items={entries(images)}
        filter={filter}
        note={note}
        canDelete={user.role === "owner" || user.role === "admin"}
        shots
        onStatus={(key, status) => mark("images", key, status)}
        onDelete={(key) => drop("images", key)}
      />
    </div>
  );
}

function matches(status: string | undefined, filter: string) {
  if (filter === "all") return true;
  if (filter === "open") return status !== "approved" && status !== "rejected";
  return status === filter;
}

function Queue({
  title,
  path,
  items,
  filter,
  note,
  shots,
  canDelete,
  onStatus,
  onDelete,
}: {
  title: string;
  path: string;
  items: [string, CommunityItem][];
  filter: string;
  note: (text: string) => void;
  shots?: boolean;
  canDelete?: boolean;
  onStatus: (key: string, status: string) => void;
  onDelete: (key: string) => void;
}) {
  const rows = items.filter(([, item]) => matches(item.status, filter));
  const [ask, setAsk] = useState<string | null>(null);
  async function decide(key: string, item: CommunityItem, status: "approved" | "rejected") {
    if (status === "approved" && !canPublishCommunityItem(item, shots ? "image" : "review")) {
      note("Keine passende Freigabe zur Veröffentlichung dokumentiert.");
      return;
    }
    const result = await relayDetail(`${path}/${encodeURIComponent(key)}`, "PATCH", { status });
    if (!result.ok) {
      note(result.error || "Speichern fehlgeschlagen");
      return;
    }
    onStatus(key, status);
    note(status === "approved" ? "Freigegeben" : "Abgelehnt");
  }
  return (
    <section>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3 space-y-3">
        {rows.map(([key, item]) => (
          <article
            key={key}
            className={`card card-still p-4${freshStamp(item.ts, item.updatedAt) ? " mark-new" : ""}`}
          >
            <p className="font-semibold">
              {item.name} {item.rating ? `· ${item.rating}/5` : ""}
              <Neu ts={item.ts} updatedAt={item.updatedAt} />
            </p>
            <p className="mt-1 text-sm text-muted">{shots ? item.caption : item.text}</p>
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name ? `Eingereichtes Bild von ${item.name}` : "Eingereichtes Bild"}
                className="mt-3 max-h-40 rounded-md object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : null}
            <p className="mt-2 text-xs text-faint">
              Veröffentlichung:{" "}
              {item.publicationConsent === true
                ? "freigegeben"
                : item.publicationConsent === false
                  ? "nicht freigegeben"
                  : "nicht dokumentiert"}
              {shots
                ? ` · Bildrechte: ${item.imageRightsConfirmed === true ? "bestätigt" : item.imageRightsConfirmed === false ? "nicht bestätigt" : "nicht dokumentiert"}`
                : ""}
            </p>
            <p className="mt-2 text-xs text-faint">
              {item.status || "offen"} · {formatWhen(item.ts)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-brand"
                disabled={!canPublishCommunityItem(item, shots ? "image" : "review")}
                title={
                  !canPublishCommunityItem(item, shots ? "image" : "review")
                    ? "Eine passende Einwilligung fehlt."
                    : undefined
                }
                onClick={() => void decide(key, item, "approved")}
              >
                Frei
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => void decide(key, item, "rejected")}
              >
                Ablehnen
              </button>
              {canDelete ? (
                ask === key ? (
                  <>
                    <span className="self-center text-sm text-muted">
                      Einreichung wirklich löschen?
                    </span>
                    <button
                      type="button"
                      className="btn-ghost border-red-500 text-red-300"
                      onClick={() => {
                        void fbRemove(`${path}/${key}`)
                          .then(() => {
                            onDelete(key);
                            setAsk(null);
                            note("Gelöscht");
                          })
                          .catch((err) =>
                            note(err instanceof Error ? err.message : "Löschen fehlgeschlagen"),
                          );
                      }}
                    >
                      Ja, löschen
                    </button>
                    <button type="button" className="btn-ghost" onClick={() => setAsk(null)}>
                      Nein
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn-ghost border-red-500 text-red-300"
                    onClick={() => setAsk(key)}
                  >
                    Löschen
                  </button>
                )
              ) : null}
            </div>
          </article>
        ))}
        {!rows.length ? <p className="text-sm text-muted">Nichts in dieser Ansicht</p> : null}
      </div>
    </section>
  );
}
