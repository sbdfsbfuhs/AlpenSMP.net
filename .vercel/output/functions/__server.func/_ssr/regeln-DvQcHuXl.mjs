import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as RULES, d as Shell, l as RULES_INTRO, o as PageHero, u as SITE } from "./shell-DzkNWVRk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/regeln-DvQcHuXl.js
var import_jsx_runtime = require_jsx_runtime();
function RulesPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
			kicker: "Offizielles Regelwerk",
			title: "14 klare Regeln.",
			lede: RULES_INTRO + " Für Survival, Chat, Mods und Fairplay – ohne Kleinprint-Dschungel."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "shell flex flex-wrap gap-3 py-8 text-sm text-muted",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full border border-line px-3 py-1",
					children: "14 Regeln"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full border border-line px-3 py-1",
					children: "Java & Bedrock"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full border border-line px-3 py-1",
					children: "Kein Pay-to-Win"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "shell grid gap-8 pb-8 lg:grid-cols-[16rem_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "card h-fit p-4 lg:sticky lg:top-24",
				"aria-label": "Regelverzeichnis",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-widest text-faint uppercase",
					children: "Inhalt"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-3 space-y-1 text-sm",
					children: RULES.map((rule) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						className: "block rounded-md px-2 py-1.5 text-muted hover:bg-surface-2 hover:text-fg",
						href: `#regel-${rule.id}`,
						children: [
							rule.id,
							". ",
							rule.title
						]
					}) }, rule.id))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [RULES.map((rule) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					id: `regel-${rule.id}`,
					className: "card scroll-mt-24 p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "display text-2xl text-gold",
									children: String(rule.id).padStart(2, "0")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-xl font-semibold",
									children: rule.title
								}),
								rule.highlight ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-ice",
									children: "Wichtig"
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 space-y-3 text-sm text-muted",
							children: rule.paragraphs.map((paragraph) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: paragraph }, paragraph))
						}),
						rule.forbidden?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold text-ember",
								children: "Verboten"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 flex flex-wrap gap-2",
								children: rule.forbidden.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "rounded-full border border-ember/40 px-3 py-1 text-sm text-fg",
									children: item
								}, item))
							})]
						}) : null,
						rule.allowed?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold text-ice",
								children: "Erlaubt"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 flex flex-wrap gap-2",
								children: rule.allowed.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "rounded-full border border-ice/40 px-3 py-1 text-sm text-fg",
									children: item
								}, item))
							})]
						}) : null,
						rule.bullets?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 list-disc space-y-1 pl-5 text-sm text-muted",
							children: rule.bullets.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, item))
						}) : null,
						rule.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-fg",
							children: rule.note
						}) : null
					]
				}, rule.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-faint",
					children: [
						"Unklar? Frag AlpenKI unten links oder das Team auf",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "text-gold",
							href: SITE.discord,
							target: "_blank",
							rel: "noreferrer",
							children: "Discord"
						}),
						"."
					]
				})]
			})]
		})
	] });
}
//#endregion
export { RulesPage as component };
