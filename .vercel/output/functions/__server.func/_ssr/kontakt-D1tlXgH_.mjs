import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as Shell, o as PageHero } from "./shell-DzkNWVRk.mjs";
import { n as TicketForm } from "./forms-Dz4Z04WR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/kontakt-D1tlXgH_.js
var import_jsx_runtime = require_jsx_runtime();
function ContactPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
		kicker: "Support",
		title: "Kontakt & Ticket",
		lede: "Ticket hier oder auf Discord. Du bekommst einen Code und kannst die Antwort danach nachlesen."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "shell max-w-2xl py-12",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TicketForm, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-6 text-sm text-faint",
			children: "AlpenSMP ist ein privater, nicht-kommerzieller Minecraft-Server."
		})]
	})] });
}
//#endregion
export { ContactPage as component };
