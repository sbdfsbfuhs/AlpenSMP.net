import { Download, Keyboard, Mic, Package, Radio } from "lucide-react";
import { MOD_CATEGORIES, MOD_FORBIDDEN, VOICE_STEPS } from "@/lib/alpen/content";
import { SITE } from "@/lib/alpen/site";
import { DiscordLink } from "@/components/site/shell";

const STEP_ICON = {
  what: Mic,
  app: Download,
  install: Package,
  use: Keyboard,
  where: Radio,
} as const;

export function ModrinthMark() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
    </svg>
  );
}

export function ModrinthLink({ href, children }: { href: string; children: string }) {
  return (
    <a className="btn-modrinth" href={href} target="_blank" rel="noopener noreferrer">
      <ModrinthMark />
      {children}
    </a>
  );
}

export function ModsGuide() {
  return (
    <section id="mods" className="scroll-mt-24 space-y-8" aria-labelledby="mods-title">
      <div>
        <p className="kicker">Java</p>
        <h2 id="mods-title" className="display mt-2 text-4xl">Mods und Voice</h2>
        <p className="mt-3 max-w-2xl text-muted">Zwei Teile. Zuerst sprechen, danach welche Mods erlaubt sind. Ohne Mods kannst du trotzdem joinen.</p>
      </div>

      <section className="card card-still p-5 sm:p-6" aria-labelledby="voice-title">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-md bg-brand/15 text-brand" aria-hidden="true">
            <Mic className="size-5" />
          </span>
          <div>
            <p className="kicker">Block 1</p>
            <h3 id="voice-title" className="text-2xl font-semibold">Simple Voice Chat</h3>
          </div>
        </div>
        <ol className="mt-5 space-y-4">
          {VOICE_STEPS.map((step, index) => {
            const Icon = STEP_ICON[step.id as keyof typeof STEP_ICON] ?? Mic;
            const href = step.href === "app" ? SITE.modrinthApp : step.href === "voice" ? SITE.voiceClient : "";
            return (
              <li key={step.id} className="card card-still guide-step p-5 sm:p-6">
                <span className="guide-step-no" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <div className="guide-step-body">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-md border border-line text-brand" aria-hidden="true">
                      <Icon className="size-4" />
                    </span>
                    <h4 className="text-xl font-semibold">{step.title}</h4>
                  </div>
                  <p className="mt-3 max-w-xl text-muted">{step.text}</p>
                  {step.id === "install" ? (
                    <p className="chip-note warn mt-3">Empfohlen: Minecraft {SITE.version}</p>
                  ) : null}
                  {href ? (
                    <div className="mt-4">
                      <ModrinthLink href={href}>{step.hrefLabel || "Öffnen"}</ModrinthLink>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="card card-still p-5 sm:p-6" aria-labelledby="allowed-title">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-md bg-brand/15 text-brand" aria-hidden="true">
            <Package className="size-5" />
          </span>
          <div>
            <p className="kicker">Block 2</p>
            <h3 id="allowed-title" className="text-2xl font-semibold">Erlaubte Mods</h3>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-muted">Erlaubt sind Mods, die dir keinen Vorteil gegenüber anderen geben. Sie dürfen nichts sehen oder tun, was ein normaler Spieler nicht kann.</p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-3">
          {MOD_CATEGORIES.map((group) => (
            <li key={group.id} className="rounded-md border border-line bg-bg p-4">
              <h4 className="font-semibold">{group.title}</h4>
              <p className="mt-2 text-sm text-muted">{group.text}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {group.examples.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-md border border-brand/40 bg-brand/10 p-4">
          <h4 className="font-semibold">Verboten</h4>
          <ul className="mt-2 flex flex-wrap gap-2">
            {MOD_FORBIDDEN.map((name) => (
              <li key={name} className="chip-note warn">{name}</li>
            ))}
          </ul>
        </div>
        <p className="mt-4 text-sm text-muted">Bei Unsicherheit im Discord fragen.</p>
        <div className="mt-3">
          <DiscordLink>Discord fragen</DiscordLink>
        </div>
      </section>
    </section>
  );
}
