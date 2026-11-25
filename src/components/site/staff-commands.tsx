import { useState, type FormEvent } from "react";
import { CopyBurstButton } from "@/components/site/copy-burst";
import { useLive, wipe } from "@/components/site/staff-live";
import { can } from "@/lib/alpen/roles";
import { entries, fbPush, fbUpdate, formatWhen, type CommandItem, type StaffSession } from "@/lib/alpen/staff";

type InternalRole = "admin" | "helper" | "supporter";

const ROLE_MARKS: { id: InternalRole; mark: string; label: string }[] = [
  { id: "admin", mark: "A", label: "Admin" },
  { id: "helper", mark: "H", label: "Helper" },
  { id: "supporter", mark: "S", label: "Supporter" },
];

const DEFAULT_ROLES = { admin: true, helper: true, supporter: true };

function seesCommand(item: CommandItem, role: string) {
  if (role === "owner") return true;
  const picked = ROLE_MARKS.filter((entry) => item.roles?.[entry.id]);
  if (!picked.length) return role === "admin" || role === "helper" || role === "supporter";
  const selectedRole = ROLE_MARKS.find((entry) => entry.id === role);
  return selectedRole ? Boolean(item.roles?.[selectedRole.id]) : false;
}

export function Commands({ user, view, note }: { user: StaffSession; view: string; note: (text: string) => void }) {
  const data = useLive<CommandItem>("commands");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [editKey, setEditKey] = useState("");
  const [roles, setRoles] = useState<CommandItem["roles"]>(DEFAULT_ROLES);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const edit = can(user.role, "commandsEdit");
  const rows = entries(data)
    .filter(([, item]) => seesCommand(item, view))
    .sort((first, second) =>
      (first[1].category || "Allgemein").localeCompare(second[1].category || "Allgemein", "de")
      || (first[1].name || "").localeCompare(second[1].name || "", "de"),
    );
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleRows = rows.filter(([, item]) =>
    [item.name, item.desc, item.category, item.by]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase()
      .includes(normalizedQuery),
  );

  function resetForm() {
    setName("");
    setDesc("");
    setCategory("");
    setEditKey("");
    setRoles(DEFAULT_ROLES);
    setFormOpen(false);
  }

  function toggle(id: InternalRole) {
    setRoles((current) => ({ ...current, [id]: !current?.[id] }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!edit) return note("Deine echte Rolle darf das nicht");
    if (!name.trim()) return note("Command fehlt");
    setSaving(true);
    const payload = {
      name: name.trim(),
      desc: desc.trim() || "–",
      category: category.trim(),
      by: user.username,
      ts: Date.now(),
      roles: roles || {},
    };
    try {
      if (editKey) await fbUpdate(`commands/${editKey}`, payload);
      else await fbPush("commands", payload);
      resetForm();
      note("Command gespeichert");
    } catch (error) {
      note(error instanceof Error ? error.message : "Command konnte nicht gespeichert werden");
    } finally {
      setSaving(false);
    }
  }

  return (
    <details className="group card card-still p-4 sm:p-5">
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
        <span>
          <span className="block text-lg font-semibold">Interne Befehle</span>
          <span className="mt-1 block text-sm text-muted">Team-Befehle, nach Kategorie sortiert und nur für passende Rollen sichtbar.</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="rounded-full border border-line px-3 py-1 text-sm text-muted">{rows.length} {rows.length === 1 ? "Befehl" : "Befehle"}</span>
          <span aria-hidden="true" className="text-lg text-muted transition-transform group-open:rotate-180">⌄</span>
        </span>
      </summary>

      <div className="mt-4 space-y-4">
        {edit && view === "owner" && !editKey ? (
          <button
            type="button"
            className="btn-ghost"
            aria-expanded={formOpen}
            onClick={() => setFormOpen((current) => !current)}
          >
            {formOpen ? "Formular schließen" : "Internen Befehl hinzufügen"}
          </button>
        ) : null}

        {formOpen && edit && view === "owner" ? (
          <form className="rounded-lg border border-line p-4" onSubmit={(event) => void save(event)}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{editKey ? "Internen Befehl ändern" : "Neuen internen Befehl"}</h3>
                <p className="mt-1 text-sm text-muted">Lege fest, welcher Rolle der Befehl angezeigt wird.</p>
              </div>
              {editKey ? <button className="btn-ghost px-3" type="button" onClick={resetForm}>Abbrechen</button> : null}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Befehl
                <input className="field mt-1" placeholder="/befehl" value={name} onChange={(event) => setName(event.target.value)} required />
              </label>
              <label className="block text-sm font-medium">
                Kategorie <span className="font-normal text-muted">(optional)</span>
                <input className="field mt-1" placeholder="z. B. Claims" value={category} onChange={(event) => setCategory(event.target.value)} />
              </label>
              <label className="block text-sm font-medium sm:col-span-2">
                Beschreibung
                <input className="field mt-1" placeholder="Was macht der Befehl?" value={desc} onChange={(event) => setDesc(event.target.value)} />
              </label>
            </div>
            <fieldset className="mt-4">
              <legend className="text-sm font-medium">Sichtbar für</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {ROLE_MARKS.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    aria-pressed={Boolean(roles?.[entry.id])}
                    className={roles?.[entry.id] ? "btn-brand px-3" : "btn-ghost px-3"}
                    onClick={() => toggle(entry.id)}
                  >
                    {entry.mark} · {entry.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted">Owner sieht immer alle internen Befehle.</p>
            </fieldset>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn-brand" type="submit" disabled={saving}>
                {saving ? "Speichert …" : editKey ? "Änderungen speichern" : "Befehl speichern"}
              </button>
              {!editKey ? <button className="btn-ghost" type="button" onClick={resetForm}>Abbrechen</button> : null}
            </div>
          </form>
        ) : null}

        {rows.length ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h3 className="font-semibold">Befehlsliste</h3>
              <label className="block w-full text-sm font-medium sm:max-w-sm">
                Interne Befehle durchsuchen
                <input
                  className="field mt-1"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Befehl, Kategorie oder Beschreibung"
                />
              </label>
            </div>
            <ul className="space-y-2">
              {visibleRows.map(([key, item]) => {
                const visibleRoles = ROLE_MARKS.some((entry) => item.roles?.[entry.id])
                  ? ROLE_MARKS.filter((entry) => item.roles?.[entry.id])
                  : ROLE_MARKS;
                return (
                  <li key={key} className="card card-still flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="font-semibold text-brand">{item.name}</code>
                        <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">{item.category || "Allgemein"}</span>
                        <span className="inline-flex gap-1" aria-label={`Sichtbar für ${visibleRoles.map((entry) => entry.label).join(", ")}`}>
                          {visibleRoles.map((entry) => (
                            <span key={entry.id} title={entry.label} className="inline-grid size-5 place-items-center rounded-full bg-brand/15 text-[10px] font-bold text-brand">
                              {entry.mark}
                            </span>
                          ))}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted">{item.desc}</p>
                      <p className="mt-1 text-xs text-faint">Hinzugefügt von {item.by || "Unbekannt"} · {formatWhen(item.ts)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <CopyBurstButton value={`${item.name || ""} ${item.desc || ""}`} className="btn-ghost" ariaLabel="Befehl kopieren">
                        Kopieren
                      </CopyBurstButton>
                      {edit && view === "owner" ? (
                        <>
                          <button
                            type="button"
                            className="btn-ghost"
                            onClick={() => {
                              setEditKey(key);
                              setName(item.name || "");
                              setDesc(item.desc || "");
                              setCategory(item.category || "");
                              setRoles(item.roles || DEFAULT_ROLES);
                              setFormOpen(true);
                            }}
                          >
                            Bearbeiten
                          </button>
                          <button type="button" className="btn-ghost" onClick={() => void wipe("commands", key, note)}>Löschen</button>
                        </>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
            {!visibleRows.length ? <p className="text-sm text-muted">Keine internen Befehle passen zu dieser Suche.</p> : null}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-line p-4 text-sm text-muted">
            {view === "owner" ? "Es sind noch keine internen Befehle angelegt." : "Für diese Rolle sind keine internen Befehle hinterlegt."}
          </p>
        )}
      </div>
    </details>
  );
}
