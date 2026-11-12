import { createContext, useContext } from "react";
import type { EditableCommandGroup } from "@/lib/alpen/player-commands";

export type CatalogState = {
  groups: EditableCommandGroup[];
  error: string | null;
};

export const CatalogContext = createContext<CatalogState | null>(null);

export function usePlayerCommandGroups() {
  const catalog = useContext(CatalogContext);
  if (!catalog) throw new Error("PlayerCommandsProvider fehlt");
  return catalog;
}
