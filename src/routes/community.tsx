import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DiscordMark, PageHero, Shell, TikTokMark } from "@/components/site/shell";
import { SiteMascot } from "@/components/site/assistant";
import { ReviewForm } from "@/components/site/forms";
import { REVIEWS, type Review } from "@/lib/alpen/content";
import { fetchReviews, fetchShots, type Shot } from "@/lib/alpen/live";
import { SITE } from "@/lib/alpen/site";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community · AlpenSMP" },
      {
        name: "description",
        content: "Discord, TikTok, freigegebene Rezensionen und Community-Shots von AlpenSMP.",
      },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);
  const [shots, setShots] = useState<Shot[] | null>(null);
  const [active, setActive] = useState<Shot | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  useEffect(() => {
    fetchReviews()
      .then((rows) => {
        if (rows.length) setReviews(rows.map(({ name, rating, text }) => ({ name, rating, text })));
      })
      .catch(() => {});
    fetchShots()
      .then(setShots)
      .catch(() => setShots([]));
  }, []);

  const avg = (reviews.reduce((sum, row) => sum + row.rating, 0) / reviews.length).toFixed(1);

  return (
    <Shell>
      <PageHero
        kicker="Community"
        title="Werde Teil davon."
        lede="Updates, Support und gemeinsame Projekte – auf Discord und TikTok. Stimmen und Shots kommen von Spielern, nicht aus der Stock-Kiste."
      />
      <div className="shell stagger grid gap-4 py-12 md:grid-cols-2">
        <a className="card-discord relative block p-6" href={SITE.discord} target="_blank" rel="noreferrer">
          <span className="blob blob-a" />
          <span className="blob blob-b" />
          <span className="blob blob-c" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-md bg-white/15 px-3 py-2 text-sm font-bold text-white">
              <DiscordMark />
              Discord
            </span>
            <h2 className="display mt-4 text-3xl">Beitreten</h2>
            <p className="mt-2 max-w-sm text-sm text-white/80">Mitglieder, Support und Updates. Zum Spielen nicht zwingend, aber empfohlen.</p>
          </div>
        </a>
        <a className="card-tiktok relative block p-6" href={SITE.tiktok} target="_blank" rel="noreferrer">
          <span className="blob tiktok-a" />
          <span className="blob tiktok-b" />
          <span className="blob tiktok-c" />
          <div className="relative">
            <TikTokMark />
            <p className="mt-4 text-sm font-semibold tracking-wide text-white/70">TikTok</p>
            <h2 className="display mt-1 text-3xl">{SITE.tiktokHandle}</h2>
            <p className="mt-2 text-sm text-white/75">Clips, Builds und Server-Momente.</p>
          </div>
        </a>
      </div>

      <SiteMascot home="community" bias="wave" line="Discord ist freiwillig. Zum Spielen reicht die IP." />

      <section className="border-y border-line bg-bg-raised py-14">
        <div className="shell">
          <p className="kicker">Galerie</p>
          <h2 className="display mt-3 text-4xl">Eure Welt. Eure Shots.</h2>
          <p className="mt-3 max-w-2xl text-muted">Keine Stock-Bilder – nur Builds von Spielern, sobald das Team sie freigibt.</p>
          {shots === null ? <p className="mt-8 text-sm text-muted">Galerie wird geladen…</p> : null}
          {shots && shots.length === 0 ? (
            <p className="mt-8 text-sm text-muted">Noch keine freigegebenen Shots. Deiner kann der nächste sein.</p>
          ) : null}
          {shots && shots.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
              {shots.map((shot) => (
                <button
                  key={shot.imageUrl.slice(0, 48) + shot.ts}
                  type="button"
                  className="card cursor-zoom-in overflow-hidden text-left"
                  onClick={() => setActive(shot)}
                >
                  <img src={shot.imageUrl} alt={shot.caption || shot.name} className="aspect-square w-full object-cover" />
                  <p className="px-3 py-2 text-xs text-muted">
                    {shot.name}
                    {shot.caption ? ` · ${shot.caption}` : ""}
                  </p>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="shell grid gap-8 py-14 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <p className="kicker">Stimmen</p>
          <h2 className="display mt-3 text-4xl">Was die Community sagt</h2>
          <p className="mt-3 text-muted">
            {reviews.length} Stimmen · Schnitt {avg}★
          </p>
          <div className="mt-6 space-y-3">
            {reviews.map((review) => (
              <blockquote key={review.name + review.text.slice(0, 24)} className="card p-5">
                <p className="text-sm text-gold">{"★".repeat(review.rating)}{"☆".repeat(Math.max(0, 5 - review.rating))}</p>
                <p className="mt-2 text-sm whitespace-pre-line">{review.text}</p>
                <footer className="mt-3 text-xs text-faint">{review.name}</footer>
              </blockquote>
            ))}
          </div>
        </div>
        <ReviewForm />
      </section>

      {active && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/88 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="Bild groß">
              <button type="button" className="absolute inset-0" aria-label="Schließen" onClick={() => setActive(null)} />
              <button
                type="button"
                className="absolute top-4 right-4 z-10 grid size-11 place-items-center rounded-full bg-white text-black"
                aria-label="Schließen"
                onClick={() => setActive(null)}
              >
                ×
              </button>
              <figure className="relative z-10 max-h-[94vh] max-w-[96vw]">
                <img src={active.imageUrl} alt={active.caption || active.name} className="max-h-[88vh] max-w-[96vw] rounded-lg object-contain" />
                <figcaption className="mt-3 text-center text-sm text-white">
                  {active.name}
                  {active.caption ? ` · ${active.caption}` : ""}
                </figcaption>
              </figure>
            </div>,
            document.body,
          )
        : null}
    </Shell>
  );
}
