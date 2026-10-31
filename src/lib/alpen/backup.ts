import { fbGet } from "@/lib/alpen/staff";

const PATHS = [
  "bans",
  "warns",
  "notes",
  "helpRequests",
  "tickets",
  "commands",
  "playerCommands",
  "banGuide",
  "tasks",
  "absences",
  "rulesStaff",
  "rulesPublic",
  "guideTopics",
  "site_copy",
  "site_settings",
  "changelog",
  "season",
  "mascotSettings",
  "live_streams",
  "community_reviews",
  "community_images",
];

export type StaffBackup = { at: number; data: Record<string, unknown> };

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open("alpensmp-sicherung", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("snaps")) db.createObjectStore("snaps", { keyPath: "at" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function rememberStaffBackup() {
  const pairs = await Promise.all(
    PATHS.map(async (path) => {
      try {
        return [path, await fbGet(path)] as const;
      } catch {
        return [path, null] as const;
      }
    }),
  );
  const snap: StaffBackup = { at: Date.now(), data: Object.fromEntries(pairs) };
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("snaps", "readwrite");
    tx.objectStore("snaps").put(snap);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  const keys = await new Promise<number[]>((resolve, reject) => {
    const tx = db.transaction("snaps", "readonly");
    const req = tx.objectStore("snaps").getAllKeys();
    req.onsuccess = () => resolve((req.result as number[]).sort((a, b) => a - b));
    req.onerror = () => reject(req.error);
  });
  const extra = keys.slice(0, Math.max(0, keys.length - 8));
  if (extra.length) {
    const tx = db.transaction("snaps", "readwrite");
    for (const key of extra) tx.objectStore("snaps").delete(key);
  }
  db.close();
  return snap;
}

export async function latestStaffBackup() {
  const db = await openDb();
  const snap = await new Promise<StaffBackup | null>((resolve, reject) => {
    const tx = db.transaction("snaps", "readonly");
    const req = tx.objectStore("snaps").getAll();
    req.onsuccess = () => {
      const rows = (req.result as StaffBackup[]).sort((a, b) => b.at - a.at);
      resolve(rows[0] || null);
    };
    req.onerror = () => reject(req.error);
  });
  db.close();
  return snap;
}

export function downloadStaffBackup(snap: StaffBackup) {
  const blob = new Blob([JSON.stringify(snap)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  const day = new Date(snap.at).toISOString().slice(0, 16).replace(":", "-");
  link.download = `alpensmp-sicherung-${day}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}
