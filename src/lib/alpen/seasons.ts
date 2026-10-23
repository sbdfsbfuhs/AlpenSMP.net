import { useEffect, useState } from "react";

export const SEASON_KEYS = [
  "default",
  "spring",
  "summer",
  "autumn",
  "halloween",
  "winter",
  "christmas",
  "easter",
  "newyear",
] as const;

export type SeasonKey = (typeof SEASON_KEYS)[number];

export type Season = {
  key: SeasonKey;
  label: string;
  months: string;
  mascotOutfit: string;
  decorations: string;
  accent: string;
};

export const SEASONS: Season[] = [
  { key: "default", label: "Normal", months: "Fallback", mascotOutfit: "keins", decorations: "keine", accent: "#e1062c" },
  { key: "spring", label: "Frühling", months: "März–Mai", mascotOutfit: "Blumenkranz", decorations: "Kirschblüten", accent: "#4caf50" },
  { key: "summer", label: "Sommer", months: "Juni–August", mascotOutfit: "Strohhut und Brille", decorations: "Sonne und Blasen", accent: "#f2b544" },
  { key: "autumn", label: "Herbst", months: "September", mascotOutfit: "Blatt", decorations: "fallende Blätter", accent: "#d4641c" },
  { key: "halloween", label: "Halloween", months: "Oktober", mascotOutfit: "Kürbiseimer", decorations: "Fledermäuse, Nebel, Kürbisse", accent: "#ff6b1a" },
  { key: "winter", label: "Winter", months: "November, Januar ab dem 7., Februar", mascotOutfit: "Beanie", decorations: "leichter Schnee", accent: "#9fd7e8" },
  { key: "christmas", label: "Weihnachten", months: "1.–30. Dezember und 2.–6. Januar", mascotOutfit: "Mütze mit Bommel", decorations: "Schnee, Lichter, Zweige", accent: "#cc0000" },
  { key: "easter", label: "Ostern", months: "Woche vor Ostersonntag bis Ostermontag", mascotOutfit: "Hasenohren und Körbchen", decorations: "Eier und Schmetterlinge", accent: "#f6c6ea" },
  { key: "newyear", label: "Neujahr", months: "31. Dezember und 1. Januar", mascotOutfit: "Partyhut", decorations: "Konfetti, Feuerwerk nur 31.12. 20 Uhr bis 1.1. 3 Uhr", accent: "#ffd700" },
];

export function isSeason(value: string | undefined | null): value is SeasonKey {
  return SEASON_KEYS.includes(value as SeasonKey);
}

export function easterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

export function fireworksOpen(now = new Date()) {
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hour = now.getHours();
  return (month === 12 && day === 31 && hour >= 20) || (month === 1 && day === 1 && hour < 3);
}

export function autoSeason(now = new Date()): SeasonKey {
  const month = now.getMonth() + 1;
  const day = now.getDate();
  if ((month === 12 && day === 31) || (month === 1 && day === 1)) return "newyear";
  if (month === 10) return "halloween";
  if (month === 12 || (month === 1 && day <= 6)) return "christmas";
  const easter = easterSunday(now.getFullYear());
  const start = new Date(easter);
  start.setDate(easter.getDate() - 7);
  start.setHours(0, 0, 0, 0);
  const end = new Date(easter);
  end.setDate(easter.getDate() + 1);
  end.setHours(23, 59, 59, 999);
  if (now >= start && now <= end) return "easter";
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month === 9) return "autumn";
  if (month === 11 || month === 1 || month === 2) return "winter";
  return "default";
}

export function useSeason(): SeasonKey {
  const [season, setSeason] = useState<SeasonKey>("default");
  useEffect(() => {
    const read = () => {
      const value = document.documentElement.dataset.season;
      setSeason(isSeason(value) ? value : autoSeason());
    };
    read();
    window.addEventListener("alpen-season", read);
    return () => window.removeEventListener("alpen-season", read);
  }, []);
  return season;
}
