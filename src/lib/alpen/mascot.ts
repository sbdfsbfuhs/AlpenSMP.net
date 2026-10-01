export type Act =
  | "stand"
  | "sit"
  | "sleep"
  | "wake"
  | "stretch"
  | "look"
  | "pet"
  | "wave"
  | "yawn"
  | "scratch"
  | "scarf"
  | "bored"
  | "up"
  | "surprise"
  | "stumble"
  | "hop"
  | "walk";

export type MascotMode = "auto" | "stand" | "idle" | "sit" | "sleep" | "wake" | "wave" | "interactive" | "custom";

export type MascotSettings = {
  mode: MascotMode;
  order: string;
  pace: number;
  sleep: number;
  sit: number;
  special: number;
  idle: number;
  reaction: number;
};

export const MASCOT_DEFAULT: MascotSettings = {
  mode: "auto",
  order: "",
  pace: 2,
  sleep: 12,
  sit: 24,
  special: 16,
  idle: 10,
  reaction: 2,
};

export function readOrder(text: string): Act | "auto" | null {
  const q = text.toLowerCase();
  if (!q.trim()) return null;
  if (/schlaf|müde|penn/.test(q)) return "sleep";
  if (/wink/.test(q)) return "wave";
  if (/sitz|setz|hinsetz/.test(q)) return "sit";
  if (/streck/.test(q)) return "stretch";
  if (/gähn|aufwach/.test(q)) return "wake";
  if (/kratz/.test(q)) return "scratch";
  if (/schal/.test(q)) return "scarf";
  if (/langweil/.test(q)) return "bored";
  if (/überrasch|huch/.test(q)) return "surprise";
  if (/stolper/.test(q)) return "stumble";
  if (/nach oben/.test(q)) return "up";
  if (/schau mich|mich an|nach links|nach rechts/.test(q)) return "look";
  if (/hüpf|hupf|hop/.test(q)) return "hop";
  if (/lauf|geh/.test(q)) return "walk";
  if (/umschau|schau dich|beobachte/.test(q)) return "look";
  if (/freu|fröhlich|automatisch|\bauto\b/.test(q)) return "auto";
  if (/steh|aufrecht/.test(q)) return "stand";
  return null;
}

export function mascotLine(act: Act | "auto") {
  const lines: Record<string, string> = {
    sit: "Alles klar, ich setze mich.",
    sleep: "Ich mach kurz die Augen zu.",
    wake: "Ich bin wach.",
    stand: "Ich stehe wieder.",
    wave: "Hallo.",
    stretch: "Kurz strecken.",
    yawn: "Haaa.",
    scratch: "Moment, das Ohr juckt.",
    scarf: "Schal sitzt.",
    bored: "Ist ruhig hier.",
    up: "Ich schau nach oben.",
    surprise: "Oh.",
    stumble: "Hoppla. Steht wieder.",
    hop: "Hupf.",
    walk: "Ich lauf kurz hin und her.",
    look: "Ich schau mich um.",
    pet: "Das ist nett.",
    auto: "Ich mach wieder mein Ding.",
  };
  return lines[act] ?? "Okay.";
}

export function pickIdle(settings: MascotSettings, bias?: Act, kind: "full" | "small" = "full"): Act {
  if (kind === "small") {
    const small: Act[] = ["look", "yawn", "scarf", "scratch", "stretch", "up"];
    if (bias && small.includes(bias) && Math.random() < 0.4) return bias;
    return small[Math.floor(Math.random() * small.length)] ?? "look";
  }
  const bag: Act[] = [];
  const add = (act: Act, n: number) => {
    for (let i = 0; i < n; i += 1) bag.push(act);
  };
  add("look", 5);
  add("yawn", 2);
  add("scarf", 2);
  add("scratch", 2);
  add("up", 2);
  add("bored", 2);
  add("wave", 1);
  add("walk", 2);
  add("stretch", 1 + Math.round(settings.special / 50));
  add("sit", Math.max(1, Math.round(settings.sit / 18)));
  if (settings.sleep > 8) add("sleep", Math.max(1, Math.round(settings.sleep / 28)));
  add("surprise", Math.max(1, Math.round(settings.special / 35)));
  if (settings.special > 20) add("stumble", 1);
  if (settings.special > 30) add("hop", 1);
  if (bias) add(bias, 3);
  return bag[Math.floor(Math.random() * bag.length)] ?? "look";
}

export function holdMs(act: Act) {
  if (act === "sleep") return 12000;
  if (act === "wake") return 4200;
  if (act === "walk") return 4600;
  if (act === "sit" || act === "bored") return 8000;
  if (act === "hop" || act === "surprise" || act === "stumble") return 1400;
  return 2200;
}

export function waitMs(settings: MascotSettings) {
  const pace = Math.min(5, Math.max(1, settings.pace));
  const base = Math.max(4, settings.idle) * 1000;
  const factor = 1.55 - pace * 0.18;
  return Math.max(4500, base * factor * (0.75 + Math.random() * 0.7));
}
