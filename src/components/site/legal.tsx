import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { PageHero, Shell } from "@/components/site/shell";

export function LegalArticle({
  kicker,
  title,
  lede,
  children,
}: {
  kicker: string;
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <Shell>
      <PageHero kicker={kicker} title={title} lede={lede} />
      <article className="shell max-w-3xl space-y-8 py-12 text-sm leading-relaxed text-muted">{children}</article>
    </Shell>
  );
}

export function LegalLinks() {
  return (
    <p>
      Weiter: <Link to="/impressum" className="text-brand underline">Impressum</Link>
      {" · "}
      <Link to="/datenschutz" className="text-brand underline">Datenschutz</Link>
      {" · "}
      <Link to="/nutzung" className="text-brand underline">Nutzung</Link>
      {" · "}
      <Link to="/erstattung" className="text-brand underline">Erstattung</Link>
      {" · "}
      <Link to="/regeln" className="text-brand underline">Spielregeln</Link>
    </p>
  );
}
