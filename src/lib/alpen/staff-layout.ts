export type StaffLayout = {
  quickTabs: string[];
  moreTabs: string[];
};

function uniqueKnown(values: unknown, allowed: Set<string>) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.filter((value): value is string => typeof value === "string" && allowed.has(value)))];
}

export function normalizeStaffLayout(value: unknown, tabIds: readonly string[], defaultQuickTabs: readonly string[]): StaffLayout {
  const allowed = new Set(tabIds);
  const saved = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  const quickTabs = uniqueKnown(saved.quickTabs, allowed);
  const moreTabs = uniqueKnown(saved.moreTabs, allowed).filter((tab) => !quickTabs.includes(tab));
  const missingTabs = tabIds.filter((tab) => !quickTabs.includes(tab) && !moreTabs.includes(tab));

  if (quickTabs.length === 0 && moreTabs.length === 0) {
    const defaults = uniqueKnown(defaultQuickTabs, allowed);
    return {
      quickTabs: defaults,
      moreTabs: tabIds.filter((tab) => !defaults.includes(tab)),
    };
  }

  return {
    quickTabs,
    moreTabs: [...moreTabs, ...missingTabs],
  };
}

export function moveStaffLayoutTab(layout: StaffLayout, tab: string, destination: keyof StaffLayout): StaffLayout {
  const source: keyof StaffLayout = destination === "quickTabs" ? "moreTabs" : "quickTabs";
  if (!layout[source].includes(tab)) return layout;
  return {
    ...layout,
    [source]: layout[source].filter((item) => item !== tab),
    [destination]: [...layout[destination], tab],
  };
}

export function reorderStaffLayoutTab(layout: StaffLayout, list: keyof StaffLayout, tab: string, direction: -1 | 1): StaffLayout {
  const currentIndex = layout[list].indexOf(tab);
  const nextIndex = currentIndex + direction;
  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= layout[list].length) return layout;
  const values = [...layout[list]];
  [values[currentIndex], values[nextIndex]] = [values[nextIndex], values[currentIndex]];
  return { ...layout, [list]: values };
}
