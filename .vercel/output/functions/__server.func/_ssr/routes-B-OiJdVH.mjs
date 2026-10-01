import { x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as ArrowUpRight, l as Map, o as Mic, r as Shield } from "../_libs/lucide-react.mjs";
import { a as PILLARS, d as Shell, r as FEATURES, s as REVIEWS, u as SITE } from "./shell-DzkNWVRk.mjs";
import { a as StatusCard, i as StatStrip, n as MotdNotice, r as PlayerChart, t as CopyIp } from "./live-DbgC7xW7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B-OiJdVH.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative overflow-hidden border-b border-line",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/media/ridge.jpg",
					alt: "Abendlicht über einem Alpenkamm und Fichtenwald",
					className: "absolute inset-0 h-full w-full object-cover opacity-40"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-linear-to-b from-bg/30 via-bg/75 to-bg" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "shell relative grid items-end gap-10 py-16 md:grid-cols-[1.3fr_0.7fr] md:py-24",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "kicker",
							children: "Deutschsprachiger Minecraft Survival Server"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "display mt-4 text-5xl text-fg md:text-7xl",
							children: ["Alpen", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-gold",
								children: "SMP"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "display mt-5 max-w-xl text-2xl text-fg italic md:text-3xl",
							children: "Vanilla Survival. Faire Community. Persönliche Serverleitung."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-5 max-w-xl text-lg text-muted",
							children: "Gemeinsame Survival-Welt mit Claims und Simple Voice Chat – für Java und Bedrock. Kein Pay-to-Win, keine überladenen Plugins."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex flex-wrap gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/server",
									className: "btn-gold",
									children: "Jetzt spielen"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/regeln",
									className: "btn-ghost",
									children: "Server-Regeln"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									className: "btn-ice",
									href: SITE.discord,
									target: "_blank",
									rel: "noreferrer",
									children: "Discord"
								})
							]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusCard, {})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shell mt-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotdNotice, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "shell py-16",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-2xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "kicker",
						children: "Über AlpenSMP"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display mt-3 text-4xl",
						children: "Vanilla Survival, ohne Umwege."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-muted",
						children: "Eine gemeinsame Survival-Welt mit fairer, deutschsprachiger Community. Keine Pay-to-Win-Mechaniken, keine überladenen Plugins – nur Minecraft, so wie es gedacht ist."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 grid gap-4 md:grid-cols-3",
				children: PILLARS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "card p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-lg font-semibold",
						children: item.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: item.text
					})]
				}, item.title))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-y border-line bg-bg-raised py-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shell",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "kicker",
						children: "Features"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display mt-3 text-4xl",
						children: "Was dich erwartet"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/features",
						className: "btn-ghost",
						children: "Alle Features"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
					children: FEATURES.map((feature) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/features",
						hash: feature.id,
						className: "card p-4 hover:border-gold/50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-semibold",
							children: feature.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: feature.summary
						})]
					}, feature.id))
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "shell py-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "kicker",
					children: "In Zahlen"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "display mt-3 text-4xl",
					children: "AlpenSMP gerade jetzt"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-2xl text-muted",
					children: "Live-Daten und Community-Zahlen – ohne Schnickschnack."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatStrip, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerChart, {})
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "shell grid gap-4 pb-16 lg:grid-cols-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "card overflow-hidden lg:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/media/lichen.jpg",
					alt: "Fichten und Flechten im Alpenwald",
					className: "h-44 w-full object-cover"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-6 p-6 md:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-gold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold text-fg",
								children: "Java Edition"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
							className: "mt-3 list-decimal space-y-1 pl-5 text-sm text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Minecraft Java öffnen" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Mehrspieler, Server hinzufügen" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Adresse eingeben und speichern" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Beitreten" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyIp, {
								value: SITE.ip,
								label: "Server-Adresse"
							})
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-gold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold text-fg",
								children: "Bedrock Edition"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
							className: "mt-3 list-decimal space-y-1 pl-5 text-sm text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Minecraft Bedrock öffnen" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Server hinzufügen" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Adresse und Port eingeben" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Beitreten" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyIp, {
								value: SITE.ip,
								label: "Server-Adresse"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyIp, {
								value: SITE.bedrockPort,
								label: "Port"
							})]
						})
					] })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "card flex flex-col justify-between p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-ice",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold text-fg",
						children: "Voice, Karte, Discord"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm text-muted",
					children: [
						"Simple Voice Chat ist optional. Die BlueMap zeigt die Hauptworld. Updates und Support laufen über Discord und TikTok ",
						SITE.tiktokHandle,
						"."
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							className: "btn-gold",
							href: SITE.map,
							target: "_blank",
							rel: "noreferrer",
							children: ["Live-Karte öffnen ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "btn-ghost",
							href: SITE.discord,
							target: "_blank",
							rel: "noreferrer",
							children: "Discord beitreten"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/guide",
							className: "btn-ghost",
							children: "Spieler-Guide"
						})
					]
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-t border-line bg-bg-raised py-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shell",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "kicker",
						children: "Stimmen"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display mt-3 text-4xl",
						children: "Was die Community sagt"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/community",
						className: "btn-ghost",
						children: "Alle Rezensionen"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 grid gap-4 md:grid-cols-3",
					children: REVIEWS.slice(0, 3).map((review) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("blockquote", {
						className: "card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-gold",
								children: "★".repeat(review.rating)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm whitespace-pre-line text-fg",
								children: review.text
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
								className: "mt-4 text-sm text-faint",
								children: review.name
							})
						]
					}, review.name + review.text.slice(0, 12)))
				})]
			})
		})
	] });
}
//#endregion
export { Home as component };
