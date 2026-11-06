import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fetchReviews, type LiveReview } from "@/lib/alpen/live";

export function ReviewCard({ review }: { review: LiveReview }) {
  const [open, setOpen] = useState(false);
  const stars = Math.max(0, Math.min(5, review.rating));
  const text = review.text.trim();
  return (
    <blockquote className="review-card card">
      <span className="review-quote" aria-hidden="true">“</span>
      {review.imageUrl ? (
        <button type="button" className="review-shot" onClick={() => setOpen(true)} aria-label="Bild groß">
          <img src={review.imageUrl} alt="" />
        </button>
      ) : null}
      <p className="text-star text-sm" aria-label={`${stars} von 5 Sternen`}>
        {"★".repeat(stars)}
        <span className="text-faint">{"☆".repeat(5 - stars)}</span>
      </p>
      {text ? <p className="whitespace-pre-line text-sm text-fg">{text}</p> : null}
      <footer className="review-by">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand/15 text-xs font-semibold text-brand">
          {(review.name || "?").slice(0, 1).toUpperCase()}
        </span>
        <span className="text-sm font-semibold">{review.name}</span>
      </footer>
      {open && review.imageUrl && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/88 p-3" role="dialog" aria-modal="true" aria-label="Bild groß">
              <button type="button" className="absolute inset-0" aria-label="Schließen" onClick={() => setOpen(false)} />
              <img src={review.imageUrl} alt="" className="relative z-10 max-h-[88vh] max-w-[96vw] rounded-lg object-contain" />
            </div>,
            document.body,
          )
        : null}
    </blockquote>
  );
}

export function FooterReview() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [review, setReview] = useState<LiveReview | null | undefined>(undefined);
  const hide = path.startsWith("/team") || path === "/community";
  useEffect(() => {
    if (hide) return;
    let stop = false;
    fetchReviews()
      .then((rows) => {
        if (!stop) setReview(rows[0] ?? null);
      })
      .catch(() => {
        if (!stop) setReview(null);
      });
    return () => {
      stop = true;
    };
  }, [hide]);
  if (hide || review === undefined) return null;
  return (
    <section className="border-t border-line bg-bg-raised">
      <div className="shell py-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <p className="kicker">Stimmen</p>
          <Link to="/community" className="text-sm font-semibold text-brand">
            Alle Rezensionen
          </Link>
        </div>
        {review ? (
          <ReviewCard review={review} />
        ) : (
          <blockquote className="review-card card">
            <p className="display text-2xl">Die erste Stimme ist noch frei.</p>
            <p className="text-sm text-muted">Gerade ist keine Rezension freigegeben. Wenn du spielst, kannst du die erste schreiben.</p>
            <Link to="/community" className="btn-brand mt-2">
              Rezension schreiben
            </Link>
          </blockquote>
        )}
      </div>
    </section>
  );
}
