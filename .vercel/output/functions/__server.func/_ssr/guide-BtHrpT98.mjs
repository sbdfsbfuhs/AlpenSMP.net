import { i as __toESM } from "../_runtime.mjs";
import { q as require_react, x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as Shell, i as GUIDE, o as PageHero } from "./shell-DzkNWVRk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/guide-BtHrpT98.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GuidePage() {
	const [track, setTrack] = (0, import_react.useState)(null);
	const [query, setQuery] = (0, import_react.useState)("");
	const chapters = (0, import_react.useMemo)(() => {
		const pool = track ? GUIDE.filter((chapter) => chapter.track === track) : GUIDE;
		const q = query.trim().toLowerCase();
		if (!q) return pool;
		return pool.filter((chapter) => (chapter.title + chapter.description + chapter.keywords + chapter.blocks.join(" ")).toLowerCase().includes(q));
	}, [track, query]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
		kicker: "Spieler-Guide",
		title: "Alles für den Start.",
		lede: "Neu bei AlpenSMP? Hier findest du, was du für die ersten Stunden wissen musst – ob du Minecraft schon kennst oder nicht."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "shell py-12",
		children: track === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "card p-6 text-left",
				onClick: () => setTrack("alpen"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl font-semibold",
						children: "Ja, ich kenne Minecraft"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-muted",
						children: "Ich kenne die Grundlagen bereits."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "btn-gold mt-6",
						children: "AlpenSMP entdecken"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "card p-6 text-left",
				onClick: () => setTrack("mc"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl font-semibold",
						children: "Nein, ich bin neu bei Minecraft"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-muted",
						children: "Zuerst die wichtigsten Grundlagen lernen."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "btn-ghost mt-6",
						children: "Minecraft lernen"
					})
				]
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "field",
					type: "search",
					placeholder: "Was möchtest du wissen?",
					value: query,
					onChange: (e) => setQuery(e.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn-ghost",
					onClick: () => setTrack(null),
					children: "Auswahl ändern"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-sm text-faint",
				children: [
					chapters.length,
					" ",
					chapters.length === 1 ? "Kapitel" : "Kapitel",
					" ·",
					" ",
					track === "mc" ? "Minecraft-Grundlagen" : "AlpenSMP"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 space-y-4",
				children: [chapters.map((chapter, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chapter, {
					chapter,
					index: index + 1,
					total: chapters.length
				}, chapter.id)), !chapters.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: "Nichts dazu gefunden. Versuch ein anderes Wort."
				}) : null]
			}),
			track === "mc" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "btn-gold mt-8",
				onClick: () => setTrack("alpen"),
				children: "Weiter zu AlpenSMP"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/server",
				className: "btn-gold mt-8",
				children: "Jetzt beitreten"
			})
		] })
	})] });
}
function Chapter({ chapter, index, total }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "card p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs font-semibold text-gold",
				children: [
					index,
					" / ",
					total
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 text-xl font-semibold",
				children: chapter.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: chapter.description
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 list-disc space-y-2 pl-5 text-sm text-fg",
				children: chapter.blocks.map((block) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: block }, block))
			})
		]
	});
}
//#endregion
export { GuidePage as component };
