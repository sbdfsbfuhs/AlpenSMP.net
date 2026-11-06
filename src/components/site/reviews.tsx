import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchReviews, type LiveReview } from "@/lib/alpen/live";

export function ReviewCard({ review }: { review: LiveReview }) {
  const stars = Math.max(0, Math.min(5, review.rating));
  return (
    <blockquote className="card relative overflow-hidden p-6">
      <span className="display pointer-events-none absolute -top-4 left-4 text-7xl leading-none text-brand/35" aria-hidden="true">
        “
      </span>
      <p className="text-star" aria-label={`${stars} von 5 Sternen`}>
        {"★".repeat(stars)}
        <span className="text-faint">{"☆".repeat(5 - stars)}</span>
      </p>
      <p className="mt-3 line-clamp-4 whitespace-pre-line text-fg">{review.text}</p>
      <footer className="mt-4 flex items-center gap-3 text-sm">
        <span className="grid size-8 place-items-center rounded-full bg-brand/15 font-semibold text-brand">
          {(review.name || "?").slice(0, 1).toUpperCase()}
        </span>
        <span className="font-semibold">{review.name}</span>
      </footer>
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
          <blockquote className="card relative overflow-hidden p-6 md:p-8">
            <span className="display pointer-events-none absolute -top-4 left-4 text-7xl leading-none text-brand/35" aria-hidden="true">
              “
            </span>
            <p className="display text-2xl md:text-3xl">Die erste Stimme ist noch frei.</p>
            <p className="mt-3 max-w-xl text-muted">Gerade ist keine Rezension freigegeben. Wenn du spielst, kannst du die erste schreiben.</p>
            <Link to="/community" className="btn-brand mt-5">
              Rezension schreiben
            </Link>
          </blockquote>
        )}
      </div>
    </section>
  );
}
