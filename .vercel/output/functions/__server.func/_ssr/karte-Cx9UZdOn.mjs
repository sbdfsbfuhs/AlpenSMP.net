import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as Shell, o as PageHero, u as SITE } from "./shell-DzkNWVRk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/karte-Cx9UZdOn.js
var import_jsx_runtime = require_jsx_runtime();
function MapPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
		kicker: "Live-Karte",
		title: "Die Hauptworld, von oben.",
		lede: "BlueMap der gemeinsamen Overworld. Die Karte öffnet sich in einem eigenen Tab, damit sie flüssig bleibt."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "shell py-12",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative overflow-hidden rounded-lg border border-line",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/media/ridge.jpg",
				alt: "",
				className: "h-80 w-full object-cover opacity-50 md:h-96"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 flex flex-col items-center justify-center gap-4 bg-bg/55 px-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "kicker",
						children: "Neu"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display text-4xl",
						children: "AlpenSMP Live-Karte"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-md text-muted",
						children: "BlueMap – Hauptworld (Overworld)."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: "btn-gold",
						href: SITE.map,
						target: "_blank",
						rel: "noreferrer",
						children: "Live-Karte öffnen"
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-faint",
			children: "Öffnet BlueMap der Hauptworld in einem neuen Tab."
		})]
	})] });
}
//#endregion
export { MapPage as component };
