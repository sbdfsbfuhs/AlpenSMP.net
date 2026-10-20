import { useLive, wipe } from "@/components/site/staff-live";
import { entries, type ModItem, type StaffSession } from "@/lib/alpen/staff";

export function Archive({ user, note }: { user: StaffSession; note: (text: string) => void }) {
  const bans = useLive<ModItem>("bans");
  const warns = useLive<ModItem>("warns");
  const help = useLive<ModItem>("helpRequests");
  const rows = [
    ...entries(bans).map(([key, item]) => ({ path: "bans", key, item })),
    ...entries(warns).map(([key, item]) => ({ path: "warns", key, item })),
    ...entries(help).map(([key, item]) => ({ path: "helpRequests", key, item })),
  ].filter((row) => row.item.archived);

  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li key={row.path + row.key} className="card card-still p-4 text-sm">
          <p className="font-semibold">{row.item.name || row.item.by} · {row.path}</p>
          <p className="text-muted">{row.item.reason || row.item.msg || row.item.text}</p>
          <p className="text-xs text-faint">Archiv: {row.item.archiveReason} · {row.item.archivedBy}</p>
          {user.role === "owner" ? (
            <button type="button" className="btn-ghost mt-2" onClick={() => void wipe(row.path, row.key, note)}>Endgültig löschen</button>
          ) : null}
        </li>
      ))}
      {!rows.length ? <li className="text-muted">Archiv ist leer</li> : null}
    </ul>
  );
}

