import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as Shell, f as TEAM, o as PageHero, u as SITE } from "./shell-DzkNWVRk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/team-B2RiKx7m.js
var import_jsx_runtime = require_jsx_runtime();
function TeamPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
			kicker: "Wer steckt dahinter",
			title: "Persönliche Leitung.",
			lede: "Owner, Moderation und Community – eng verbunden für eine faire Spielumgebung. Keine anonyme Netzwerk-Fassade."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shell grid gap-4 py-12 md:grid-cols-3",
			children: TEAM.map((member) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "card p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "kicker",
						children: member.role
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-3 text-xl font-semibold",
						children: member.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: member.text
					})
				]
			}, member.role))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shell pb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold",
						children: "Für das Team"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-sm text-muted",
						children: "Moderation, Freigaben und interne Werkzeuge bleiben im bestehenden Staff-Bereich. Diese öffentliche Seite zeigt nur, wer den Server trägt – ohne interne Schaltflächen."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: "btn-ghost mt-5",
						href: SITE.staff,
						target: "_blank",
						rel: "noreferrer",
						children: "Staff-Bereich öffnen"
					})
				]
			})
		})
	] });
}
//#endregion
export { TeamPage as component };
