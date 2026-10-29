import { useEffect, useState } from "react";
import { Neu } from "@/components/site/staff-shared";
import { entries, fbGet, fbUpdate, formatWhen, freshStamp, type CommunityItem, type StaffSession } from "@/lib/alpen/staff";

export function Community({ user, note }: { user: StaffSession; note: (text: string) => void }) {
  const [reviews, setReviews] = useState<Record<string, CommunityItem>>({});
  const [images, setImages] = useState<Record<string, CommunityItem>>({});
  const [filter, setFilter] = useState("open");
  const load = () => {
    void fbGet<Record<string, CommunityItem>>("community_reviews").then((value) => setReviews(value ?? {}));
    void fbGet<Record<string, CommunityItem>>("community_images").then((value) => setImages(value ?? {}));
  };
  useEffect(() => {
    load();
  }, []);
  const mark = (kind: "reviews" | "images", key: string, status: string) => {
    const set = kind === "reviews" ? setReviews : setImages;
    set((prev) => ({ ...prev, [key]: { ...prev[key], status } }));
  };
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {["open", "approved", "rejected", "all"].map((item) => (
          <button key={item} type="button" className={item === filter ? "btn-brand" : "btn-ghost"} onClick={() => setFilter(item)}>
            {item === "open" ? "Offen" : item === "approved" ? "Frei" : item === "rejected" ? "Abgelehnt" : "Alle"}
          </button>
        ))}
        <button type="button" className="btn-ghost" onClick={load}>
          Neu laden
        </button>
      </div>
      <Queue title="Rezensionen" path="community_reviews" items={entries(reviews)} filter={filter} user={user} note={note} onStatus={(key, status) => mark("reviews", key, status)} />
      <Queue title="Screenshots" path="community_images" items={entries(images)} filter={filter} user={user} note={note} shots onStatus={(key, status) => mark("images", key, status)} />
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
  user,
  note,
  shots,
  onStatus,
}: {
  title: string;
  path: string;
  items: [string, CommunityItem][];
  filter: string;
  user: StaffSession;
  note: (text: string) => void;
  shots?: boolean;
  onStatus: (key: string, status: string) => void;
}) {
  const rows = items.filter(([, item]) => matches(item.status, filter));
  return (
    <section>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3 space-y-3">
        {rows.map(([key, item]) => (
          <article key={key} className={`card card-still p-4${freshStamp(item.ts, item.updatedAt) ? " mark-new" : ""}`}>
            <p className="font-semibold">{item.name} {item.rating ? `· ${item.rating}/5` : ""}<Neu ts={item.ts} updatedAt={item.updatedAt} /></p>
            <p className="mt-1 text-sm text-muted">{shots ? item.caption : item.text}</p>
            {item.imageUrl ? <img src={item.imageUrl} alt={item.name ? `Eingereichtes Bild von ${item.name}` : "Eingereichtes Bild"} className="mt-3 max-h-40 rounded-md object-cover" /> : null}
            <p className="mt-2 text-xs text-faint">{item.status || "offen"} · {formatWhen(item.ts)}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" className="btn-brand" onClick={() => void fbUpdate(`${path}/${key}`, { status: "approved", moderatedBy: user.username, moderatedAt: Date.now(), updatedAt: Date.now() }).then(() => { onStatus(key, "approved"); note("Freigegeben"); })}>Frei</button>
              <button type="button" className="btn-ghost" onClick={() => void fbUpdate(`${path}/${key}`, { status: "rejected", moderatedBy: user.username, moderatedAt: Date.now(), updatedAt: Date.now() }).then(() => { onStatus(key, "rejected"); note("Abgelehnt"); })}>Ablehnen</button>
            </div>
          </article>
        ))}
        {!rows.length ? <p className="text-sm text-muted">Nichts in dieser Ansicht</p> : null}
      </div>
    </section>
  );
}

