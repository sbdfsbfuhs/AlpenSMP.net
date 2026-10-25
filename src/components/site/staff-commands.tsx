import { useState, type FormEvent } from "react";
import { CopyBurstButton } from "@/components/site/copy-burst";
import { useLive, wipe } from "@/components/site/staff-live";
import { can } from "@/lib/alpen/roles";
import { entries, fbPush, fbUpdate, formatWhen, type CommandItem, type StaffSession } from "@/lib/alpen/staff";

const ROLE_MARKS = [
  { id: "admin" as const, mark: "A", label: "Admin" },
  { id: "helper" as const, mark: "H", label: "Helper" },
  { id: "supporter" as const, mark: "S", label: "Supporter" },
];

function seesCommand(item: CommandItem, role: string) {
  if (role === "owner") return true;
  const picked = ROLE_MARKS.filter((entry) => item.roles?.[entry.id]);
  if (!picked.length) return role === "admin" || role === "helper" || role === "supporter";
  return Boolean(item.roles?.[role as "admin" | "helper" | "supporter"]);
}

export function Commands({ user, view, note }: { user: StaffSession; view: string; note: (text: string) => void }) {
  const data = useLive<CommandItem>("commands");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [editKey, setEditKey] = useState("");
  const [roles, setRoles] = useState<CommandItem["roles"]>({ admin: true, helper: true, supporter: true });
  const edit = can(user.role, "commandsEdit");
  const rows = entries(data)
    .filter(([, item]) => seesCommand(item, view))
    .sort((a, b) => (b[1].ts || 0) - (a[1].ts || 0));

  function toggle(id: "admin" | "helper" | "supporter") {
    setRoles((current) => ({ ...current, [id]: !current?.[id] }));
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!edit) return note("Deine echte Rolle darf das nicht");
    if (!name.trim()) return note("Command fehlt");
    const payload = {
      name: name.trim(),
      desc: desc.trim() || "–",
      category: category.trim(),
      by: user.username,
      ts: Date.now(),
      roles: roles || {},
    };
    if (editKey) await fbUpdate(`commands/${editKey}`, payload);
    else await fbPush("commands", payload);
    setName("");
    setDesc("");
    setCategory("");
    setEditKey("");
    setRoles({ admin: true, helper: true, supporter: true });
    note("Command gespeichert");
  }

  return (
    <div className="space-y-6">
      {edit && view === "owner" ? (
        <form className="card card-still p-5" onSubmit={save}>
          <h2 className="text-lg font-semibold">{editKey ? "Internen Befehl ändern" : "Internen Befehl hinzufügen"}</h2>
          <input className="field mt-3" placeholder="/befehl" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="field mt-2" placeholder="Was macht er?" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <input className="field mt-2" placeholder="Kategorie, z. B. Claims" value={category} onChange={(e) => setCategory(e.target.value)} />
          <div className="mt-3 flex flex-wrap gap-2">
            {ROLE_MARKS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                aria-pressed={Boolean(roles?.[entry.id])}
                className={roles?.[entry.id] ? "btn-brand px-3" : "btn-ghost px-3"}
                onClick={() => toggle(entry.id)}
              >
                {entry.mark} {entry.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">Nur die markierten Rollen sehen den Befehl. Owner sieht immer alles.</p>
          <button className="btn-brand mt-4" type="submit">{editKey ? "Änderungen speichern" : "Speichern"}</button>
        </form>
      ) : null}
      <ul className="space-y-2">
        {rows.map(([key, item]) => (
          <li key={key} className="cmd-in card card-still flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold text-brand">
                {item.name}
                <span className="ml-2 inline-flex gap-1 align-middle">
                  {(ROLE_MARKS.some((entry) => item.roles?.[entry.id]) ? ROLE_MARKS.filter((entry) => item.roles?.[entry.id]) : ROLE_MARKS).map((entry) => (
                    <span key={entry.id} title={entry.label} className="inline-grid size-5 place-items-center rounded-full bg-brand/15 text-[10px] font-bold text-brand">
                      {entry.mark}
                    </span>
                  ))}
                </span>
              </p>
              <p className="text-sm text-muted">{item.desc}</p>
              <p className="text-xs text-faint">{item.category || "Allgemein"} · {item.by} · {formatWhen(item.ts)}</p>
            </div>
            <div className="flex gap-2">
              <CopyBurstButton value={`${item.name} ${item.desc}`} className="btn-ghost" ariaLabel="Befehl kopieren">
                Kopieren
              </CopyBurstButton>
              {edit && view === "owner" ? (
                <>
                  <button type="button" className="btn-ghost" onClick={() => { setEditKey(key); setName(item.name || ""); setDesc(item.desc || ""); setCategory(item.category || ""); setRoles(item.roles || { admin: true, helper: true, supporter: true }); }}>Bearbeiten</button>
                  <button type="button" className="btn-ghost" onClick={() => void wipe("commands", key, note)}>Löschen</button>
                </>
              ) : null}
            </div>
          </li>
        ))}
        {!rows.length ? <li className="text-sm text-muted">Keine internen Befehle für diese Rolle.</li> : null}
      </ul>
    </div>
  );
}