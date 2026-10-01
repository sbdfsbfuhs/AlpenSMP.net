import { x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as Shell, o as PageHero, u as SITE } from "./shell-DzkNWVRk.mjs";
import { a as StatusCard, n as MotdNotice, t as CopyIp } from "./live-DbgC7xW7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-CHUQgDqg.js
var import_jsx_runtime = require_jsx_runtime();
function ServerPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
		kicker: "Beitreten",
		title: "Bereit für dein Abenteuer?",
		lede: "Adresse und Port stehen direkt bei den Schritten – zum Kopieren. Java und Bedrock spielen auf derselben Welt."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "shell grid gap-6 py-12 lg:grid-cols-[1.2fr_0.8fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotdNotice, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "card p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xl font-semibold",
							children: "Java Edition"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
							className: "mt-4 list-decimal space-y-2 pl-5 text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Minecraft Java öffnen" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Mehrspieler, dann Server hinzufügen" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Adresse eingeben und speichern" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Beitreten" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyIp, {
								value: SITE.ip,
								label: "Server-Adresse"
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "card p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xl font-semibold",
							children: "Bedrock Edition"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
							className: "mt-4 list-decimal space-y-2 pl-5 text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Minecraft Bedrock öffnen" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Server hinzufügen" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Adresse und Port eingeben" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Beitreten" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 grid gap-2 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyIp, {
								value: SITE.ip,
								label: "Server-Adresse"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyIp, {
								value: SITE.bedrockPort,
								label: "Port"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "card p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-xl font-semibold",
							children: ["Empfohlene Version: Minecraft ", SITE.version]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-muted",
							children: "Andere Versionen können funktionieren. Minecraft 26.2+ kann aktuell Verbindungsprobleme verursachen. Der Server läuft auf Paper."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-muted",
							children: "AlpenSMP ist kostenlos. Es gibt keine Pay-to-Win-Ränge und keinen Spenden-Zwang. Der Server ist privat und nicht-kommerziell."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/guide",
								className: "btn-gold",
								children: "Spieler-Guide"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/features",
								className: "btn-ghost",
								children: "Features & Befehle"
							})]
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusCard, {})]
	})] });
}
//#endregion
export { ServerPage as component };
