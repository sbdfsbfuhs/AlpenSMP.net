import { i as __toESM } from "../_runtime.mjs";
import { q as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as Shell, o as PageHero, s as REVIEWS, u as SITE } from "./shell-DzkNWVRk.mjs";
import { i as fetchShots, r as fetchReviews } from "./live-SP0k_m1G.mjs";
import { t as ReviewForm } from "./forms-Dz4Z04WR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/community-DdtFbNm6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CommunityPage() {
	const [reviews, setReviews] = (0, import_react.useState)(REVIEWS);
	const [shots, setShots] = (0, import_react.useState)(null);
	const [active, setActive] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		fetchReviews().then((rows) => {
			if (rows.length) setReviews(rows.map(({ name, rating, text }) => ({
				name,
				rating,
				text
			})));
		}).catch(() => {});
		fetchShots().then(setShots).catch(() => setShots([]));
	}, []);
	const avg = (reviews.reduce((sum, row) => sum + row.rating, 0) / reviews.length).toFixed(1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
			kicker: "Community",
			title: "Werde Teil davon.",
			lede: "Updates, Support und gemeinsame Projekte – auf Discord und TikTok. Stimmen und Shots kommen von Spielern, nicht aus der Stock-Kiste."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "shell grid gap-4 py-12 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				className: "card p-6 hover:border-gold/40",
				href: SITE.discord,
				target: "_blank",
				rel: "noreferrer",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "kicker",
						children: "Discord"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display mt-3 text-3xl",
						children: "Beitreten"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Mitglieder, Support und Updates. Zum Spielen nicht zwingend, aber empfohlen."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				className: "card p-6 hover:border-gold/40",
				href: SITE.tiktok,
				target: "_blank",
				rel: "noreferrer",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "kicker",
						children: "TikTok"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display mt-3 text-3xl",
						children: SITE.tiktokHandle
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Clips, Builds und Server-Momente."
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-y border-line bg-bg-raised py-14",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shell",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "kicker",
						children: "Galerie"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display mt-3 text-4xl",
						children: "Eure Welt. Eure Shots."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-2xl text-muted",
						children: "Keine Stock-Bilder – nur Builds von Spielern, sobald das Team sie freigibt."
					}),
					shots === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-8 text-sm text-muted",
						children: "Galerie wird geladen…"
					}) : null,
					shots && shots.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-8 text-sm text-muted",
						children: "Noch keine freigegebenen Shots. Deiner kann der nächste sein."
					}) : null,
					shots && shots.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 grid grid-cols-2 gap-3 md:grid-cols-3",
						children: shots.map((shot) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "card overflow-hidden text-left",
							onClick: () => setActive(shot),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: shot.imageUrl,
								alt: shot.caption || shot.name,
								className: "aspect-square w-full object-cover"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "px-3 py-2 text-xs text-muted",
								children: [shot.name, shot.caption ? ` · ${shot.caption}` : ""]
							})]
						}, shot.imageUrl.slice(0, 48) + shot.ts))
					}) : null
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "shell grid gap-8 py-14 lg:grid-cols-[1fr_0.9fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "kicker",
					children: "Stimmen"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "display mt-3 text-4xl",
					children: "Was die Community sagt"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-muted",
					children: [
						reviews.length,
						" Stimmen · Schnitt ",
						avg,
						"★"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 space-y-3",
					children: reviews.map((review) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("blockquote", {
						className: "card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-gold",
								children: ["★".repeat(review.rating), "☆".repeat(Math.max(0, 5 - review.rating))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm whitespace-pre-line",
								children: review.text
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
								className: "mt-3 text-xs text-faint",
								children: review.name
							})
						]
					}, review.name + review.text.slice(0, 24)))
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewForm, {})]
		}),
		active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "fixed inset-0 z-50 grid place-items-center bg-bg/80 p-4",
			role: "dialog",
			"aria-modal": "true",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "absolute inset-0",
				"aria-label": "Schließen",
				onClick: () => setActive(null)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
				className: "relative z-10 max-h-[90vh] max-w-3xl overflow-auto rounded-lg border border-line bg-surface",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: active.imageUrl,
					alt: active.caption || active.name,
					className: "max-h-[70vh] w-full object-contain"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figcaption", {
					className: "px-4 py-3 text-sm text-muted",
					children: [active.name, active.caption ? ` · ${active.caption}` : ""]
				})]
			})]
		}) : null
	] });
}
//#endregion
export { CommunityPage as component };
