export type LiveNotice = {
  by?: string;
  name?: string;
  title?: string;
  ts?: number;
};

export type LiveNoticeGroup = {
  key: string;
  ids: string[];
  item: LiveNotice;
};

export function groupLiveNotices(rows: Record<string, LiveNotice> | null | undefined): LiveNoticeGroup[] {
  const sorted = Object.entries(rows ?? {}).sort(
    ([, first], [, second]) => (Number(second.ts) || 0) - (Number(first.ts) || 0),
  );
  const groups = new Map<string, LiveNoticeGroup>();

  for (const [id, item] of sorted) {
    const sender = item.by?.trim() || item.name?.trim();
    const key = sender ? sender.toLowerCase() : `notice:${id}`;
    const existing = groups.get(key);
    if (existing) {
      existing.ids.push(id);
    } else {
      groups.set(key, { key, ids: [id], item });
    }
  }

  return [...groups.values()];
}
