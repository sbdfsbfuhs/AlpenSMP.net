import { useState, type FormEvent } from "react";
import { loginStaff, savePassword, writeSession, type StaffSession } from "@/lib/alpen/staff";

export function Settings({ user, note }: { user: StaffSession; note: (text: string) => void }) {
  const [oldPw, setOld] = useState("");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!a) return note("Passwort fehlt");
    if (a !== b) return note("Stimmt nicht überein");
    try {
      const session = await loginStaff(user.email, oldPw);
      await savePassword(user.username, a);
      writeSession({ ...session, mustChangePw: false });
    } catch (err) {
      return note(err instanceof Error ? err.message : "Altes Passwort falsch");
    }
    note("Passwort geändert");
  }

  return (
    <form className="card card-still max-w-md p-5" onSubmit={save}>
      <h2 className="text-lg font-semibold">Passwort ändern</h2>
      <input className="field mt-3" type="password" placeholder="Altes Passwort" value={oldPw} onChange={(e) => setOld(e.target.value)} />
      <input className="field mt-2" type="password" placeholder="Neu" value={a} onChange={(e) => setA(e.target.value)} />
      <input className="field mt-2" type="password" placeholder="Wiederholen" value={b} onChange={(e) => setB(e.target.value)} />
      <button className="btn-brand mt-4" type="submit">Speichern</button>
    </form>
  );
}

