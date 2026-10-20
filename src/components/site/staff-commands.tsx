import { useState, type FormEvent } from "react";
import { CopyBurstButton } from "@/components/site/copy-burst";
import { useLive, wipe } from "@/components/site/staff-live";
import { can } from "@/lib/alpen/roles";
import { entries, fbPush, fbUpdate, formatWhen, type CommandItem, type StaffSession } from "@/lib/alpen/staff";

export function Commands({ user, note }: { user: StaffSession; note: (text: string) => void }) {
  const data = useLive<CommandItem>("commands");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [editKey, setEditKey] = useState("");
  const rows = entries(data).sort((a, b) => (b[1].ts || 0) - (a[1].ts || 0));

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!can(user.role, "commandsEdit")) return note("Deine echte Rolle darf das nicht");
    if (!name.trim()) return note("Command fehlt");
    const payload = { name: name.trim(), desc: desc.trim() || "–", category: category.trim(), by: user.username, ts: Date.now() };
    if (editKey) await fbUpdate(`commands/${editKey}`, payload);
    else await fbPush("commands", payload);
    setName("");
    setDesc("");
    setCategory("");
    setEditKey("");
    note("Command gespeichert");
  }

  return (
    <div className="space-y-6">
      {can(user.role, "commandsEdit") ? (
        <form className="card card-still p-5" onSubmit={save}>
          <h2 className="text-lg font-semibold">{editKey ? "Internen Befehl ändern" : "Internen Befehl hinzufügen"}</h2>
          <input className="field mt-3" placeholder="/befehl" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="field mt-2" placeholder="Was macht er?" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <input className="field mt-2" placeholder="Kategorie, z. B. Claims" value={category} onChange={(e) => setCategory(e.target.value)} />
          <button className="btn-brand mt-4" type="submit">{editKey ? "Änderungen speichern" : "Speichern"}</button>
        </form>
      ) : null}
      <ul className="space-y-2">
        {rows.map(([key, item]) => (
          <li key={key} className="cmd-in card card-still flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold text-brand">{item.name}</p>
              <p className="text-sm text-muted">{item.desc}</p>
              <p className="text-xs text-faint">{item.category || "Allgemein"} · {item.by} · {formatWhen(item.ts)}</p>
            </div>
            <div className="flex gap-2">
              <CopyBurstButton value={`${item.name} ${item.desc}`} className="btn-ghost" ariaLabel="Befehl kopieren">
                Kopieren
              </CopyBurstButton>
              {can(user.role, "commandsEdit") ? (
                <>
                  <button type="button" className="btn-ghost" onClick={() => { setEditKey(key); setName(item.name || ""); setDesc(item.desc || ""); setCategory(item.category || ""); }}>Bearbeiten</button>
                  <button type="button" className="btn-ghost" onClick={() => void wipe("commands", key, note)}>Löschen</button>
                </>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

