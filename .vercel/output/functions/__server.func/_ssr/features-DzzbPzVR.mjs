import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as Shell, o as PageHero, r as FEATURES, t as COMMANDS, u as SITE } from "./shell-DzkNWVRk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/features-DzzbPzVR.js
var import_jsx_runtime = require_jsx_runtime();
function FeaturesPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
			kicker: "Features",
			title: "Was dich erwartet",
			lede: "Vanilla-Survival mit genau den Komfort-Funktionen, die das gemeinsame Spielen leichter machen – und sonst nichts."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shell grid gap-4 py-12 md:grid-cols-2",
			children: FEATURES.map((feature) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				id: feature.id,
				className: "card scroll-mt-24 p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-semibold",
						children: feature.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-gold",
						children: feature.summary
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-3 text-sm text-muted",
						children: feature.body.map((paragraph) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: paragraph }, paragraph))
					})
				]
			}, feature.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-t border-line bg-bg-raised py-14",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shell",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "kicker",
						children: "Befehle"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display mt-3 text-4xl",
						children: "Wichtige Commands"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-2xl text-muted",
						children: "Nur Befehle, die auf AlpenSMP bestätigt sind."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-8 divide-y divide-line overflow-hidden rounded-lg border border-line",
						children: COMMANDS.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "grid gap-1 bg-surface px-5 py-4 sm:grid-cols-[9rem_1fr] sm:items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "font-semibold text-gold",
								children: row.cmd
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm text-muted",
								children: row.text
							})]
						}, row.cmd))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-wrap gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "btn-gold",
							href: SITE.voiceMod,
							target: "_blank",
							rel: "noreferrer",
							children: "Simple Voice Chat auf Modrinth"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "btn-ghost",
							href: SITE.modrinthApp,
							target: "_blank",
							rel: "noreferrer",
							children: "Modrinth App"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-2xl text-sm text-muted",
						children: "Joinen geht auch ohne Client-Mods. Voice Chat nur, wenn du den Mod installierst. Erlaubt sind ausserdem OptiFine, Sodium, Iris, Freecam, Xaero’s Minimap, Shulker-Tooltips, Inventory HUD sowie Performance- und Komfort-Mods. Cheats wie X-Ray, Fly oder KillAura sind verboten."
					})
				]
			})
		})
	] });
}
//#endregion
export { FeaturesPage as component };
