export const SITE = {
  name: "AlpenSMP",
  ip: "alpensmp.net",
  play: "play.alpensmp.net",
  javaPort: "25565",
  bedrockPort: "19132",
  version: "1.21.11",
  discord: "https://discord.gg/FfR56Ddtj8",
  discordCode: "FfR56Ddtj8",
  tiktok: "https://www.tiktok.com/@alpensmp",
  tiktokHandle: "@alpensmp",
  map: "https://alpensmp-map.falix.org/#hauptworld:-1792:139:493:38:0.01:0:0:0:perspective",
  mapOpen: false,
  voiceMod: "https://modrinth.com/plugin/simple-voice-chat",
  modrinthApp: "https://modrinth.com/app",
  staff: "https://alpensmp.net/team",
  rulesPage: "https://alpensmp.net/regeln/",
  fb: "https://alpensmp-ad844-default-rtdb.europe-west1.firebasedatabase.app",
  fbKey: "AIzaSyBugFF4T6y_XEhCYde99bwpSyYZOuKbJHc",
} as const;

export const NAV = [
  { to: "/", label: "Start" },
  { to: "/server", label: "Server" },
  { to: "/features", label: "Features" },
  { to: "/prefix", label: "Team-Prefix" },
  { to: "/regeln", label: "Regeln" },
  { to: "/team", label: "Staff" },
  { to: "/karte", label: "Karte" },
  { to: "/community", label: "Community" },
] as const;

export const MORE = [
  { to: "/guide", label: "Guide" },
  { to: "/faq", label: "FAQ" },
  { to: "/kontakt", label: "Kontakt" },
] as const;
