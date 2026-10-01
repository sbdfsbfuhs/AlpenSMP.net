import { i as __toESM } from "../_runtime.mjs";
import { q as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as Shell, n as FAQ, o as PageHero } from "./shell-DzkNWVRk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/faq-BO3DWOlI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FaqPage() {
	const [open, setOpen] = (0, import_react.useState)(0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
		kicker: "FAQ",
		title: "Häufig gestellte Fragen",
		lede: "IP, Version, Bedrock, Claims, Voice und Support – die Antworten, die auf AlpenSMP wirklich gelten."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "shell max-w-3xl py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "divide-y divide-line overflow-hidden rounded-lg border border-line",
			children: FAQ.map((item, index) => {
				const isOpen = open === index;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-surface",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold",
						"aria-expanded": isOpen,
						onClick: () => setOpen(isOpen ? null : index),
						children: [item.q, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-gold",
							"aria-hidden": "true",
							children: isOpen ? "–" : "+"
						})]
					}), isOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-5 pb-5 text-sm text-muted",
						children: item.a
					}) : null]
				}, item.q);
			})
		})
	})] });
}
//#endregion
export { FaqPage as component };
