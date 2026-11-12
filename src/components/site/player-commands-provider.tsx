import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CatalogContext } from "@/components/site/player-commands-context";
import { fbGet } from "@/lib/alpen/staff";
import {
  mergeLegacyCommands,
  type EditableCommandGroup,
  type LegacyCommand,
} from "@/lib/alpen/player-commands";

export function PlayerCommandsProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<EditableCommandGroup[]>(() =>
    mergeLegacyCommands(null, null, null),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stop = false;
    const load = () => {
      if (document.hidden) return;
      Promise.allSettled([
        fbGet<unknown>("playerCommands/catalog"),
        fbGet<Record<string, LegacyCommand>>("playerCommands/java"),
        fbGet<Record<string, LegacyCommand>>("playerCommands/bedrock"),
      ]).then(([catalog, java, bedrock]) => {
        if (stop) return;
        const failures = [catalog, java, bedrock].filter((result) => result.status === "rejected");
        if (failures.length) {
          const reason = failures[0].status === "rejected" ? failures[0].reason : null;
          const detail = reason instanceof Error ? reason.message : "Datenquelle nicht erreichbar";
          setError(
            `COMMANDS-LOAD-001 · Gespeicherte Befehle konnten nicht geladen werden: ${detail}`,
          );
          console.error("[Public Commands] COMMANDS-LOAD-001", reason);
        } else {
          setError(null);
        }
        setGroups(
          mergeLegacyCommands(
            catalog.status === "fulfilled" ? catalog.value : null,
            java.status === "fulfilled" ? java.value : null,
            bedrock.status === "fulfilled" ? bedrock.value : null,
          ),
        );
      });
    };
    load();
    const id = window.setInterval(load, 30000);
    document.addEventListener("visibilitychange", load);
    return () => {
      stop = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", load);
    };
  }, []);

  const value = useMemo(() => ({ groups, error }), [groups, error]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}
