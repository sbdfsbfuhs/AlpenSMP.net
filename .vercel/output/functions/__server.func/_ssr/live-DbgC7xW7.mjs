import { i as __toESM } from "../_runtime.mjs";
import { q as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as Check, u as Copy } from "../_libs/lucide-react.mjs";
import { u as SITE } from "./shell-DzkNWVRk.mjs";
import { a as fetchSiteStats, n as fetchHistory, o as fetchStatus, t as fetchDiscordCount } from "./live-SP0k_m1G.mjs";
import { a as CartesianGrid, i as Line, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as LineChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/live-DbgC7xW7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useServerStatus() {
	const [status, setStatus] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let stop = false;
		const load = () => {
			fetchStatus().then((data) => {
				if (!stop) {
					setStatus(data);
					setError(false);
				}
			}).catch(() => {
				if (!stop) setError(true);
			});
		};
		load();
		const id = window.setInterval(load, 45e3);
		return () => {
			stop = true;
			window.clearInterval(id);
		};
	}, []);
	return {
		status,
		error
	};
}
function CopyIp({ value, label }) {
	const [done, setDone] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		className: "btn-ghost w-full justify-between",
		onClick: async () => {
			try {
				await navigator.clipboard.writeText(value);
				setDone(true);
				window.setTimeout(() => setDone(false), 1800);
			} catch {
				setDone(false);
			}
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "text-left",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-xs font-medium text-faint",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-semibold tracking-wide text-fg",
				children: value
			})]
		}), done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 text-ice" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4 text-gold" })]
	});
}
function StatusCard() {
	const { status, error } = useServerStatus();
	const online = status?.online;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "card p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold",
					children: "Serverstatus"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: online ? "text-sm font-semibold text-ice" : "text-sm font-semibold text-ember",
					children: status ? online ? "Online" : "Offline" : error ? "Unbekannt" : "Lädt…"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "display mt-4 text-4xl text-fg",
				children: [status ? `${status.players}` : "–", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xl text-muted",
					children: [" / ", status ? status.max : "–"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Spieler gerade auf dem Server"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-5 grid grid-cols-2 gap-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "text-faint",
					children: "Software"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "font-medium",
					children: status ? `${status.software} ${status.version}` : "Paper 1.21.11"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "text-faint",
					children: "Empfohlen"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
					className: "font-medium",
					children: ["Minecraft ", SITE.version]
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyIp, {
					value: SITE.ip,
					label: "Server-Adresse"
				})
			})
		]
	});
}
function MotdNotice() {
	const { status } = useServerStatus();
	const lines = status?.motd ?? [];
	if (!lines.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "rounded-md border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-semibold text-gold",
			children: "Vom Server: "
		}), lines.join(" · ")]
	});
}
function StatStrip() {
	const { status } = useServerStatus();
	const [total, setTotal] = (0, import_react.useState)(null);
	const [discord, setDiscord] = (0, import_react.useState)(null);
	const [history, setHistory] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		fetchSiteStats().then((row) => setTotal(row.total)).catch(() => {});
		fetchDiscordCount().then(setDiscord).catch(() => {});
		fetchHistory().then(setHistory).catch(() => {});
	}, []);
	const windowed = (0, import_react.useMemo)(() => {
		const now = Date.now();
		const day = history.filter((p) => now - p.t < 864e5);
		const source = day.length ? day : history;
		return {
			peak: source.reduce((m, p) => Math.max(m, p.n), 0),
			avg: source.length ? Math.round(source.reduce((s, p) => s + p.n, 0) / source.length) : 0,
			span: day.length ? "24 Stunden" : "geladener Verlauf"
		};
	}, [history]);
	const items = [
		{
			label: "Unique-Spieler",
			value: total ?? "–",
			hint: "je auf dem Server"
		},
		{
			label: "Online jetzt",
			value: status ? status.players : "–",
			hint: status ? `von ${status.max}` : "Live"
		},
		{
			label: "Peak",
			value: history.length ? windowed.peak : "–",
			hint: windowed.span
		},
		{
			label: "Schnitt",
			value: history.length ? windowed.avg : "–",
			hint: windowed.span
		},
		{
			label: "Discord",
			value: discord ?? "–",
			hint: "Mitglieder"
		},
		{
			label: "Stimmen",
			value: "14+",
			hint: "freigegebene Rezensionen"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6",
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card px-4 py-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "display text-3xl text-fg",
					children: item.value
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm font-medium",
					children: item.label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-faint",
					children: item.hint
				})
			]
		}, item.label))
	});
}
function PlayerChart() {
	const [range, setRange] = (0, import_react.useState)("24h");
	const [points, setPoints] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		fetchHistory().then(setPoints).catch(() => {});
	}, []);
	const data = (0, import_react.useMemo)(() => {
		const span = range === "1h" ? 36e5 : 864e5;
		const now = Date.now();
		return points.filter((p) => now - p.t <= span).map((p) => ({
			label: new Date(p.t).toLocaleTimeString("de-CH", {
				hour: "2-digit",
				minute: "2-digit"
			}),
			spieler: p.n
		}));
	}, [points, range]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "card p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-base font-semibold",
				children: "Spieler online – Verlauf"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Aus den Live-Zählungen des Servers."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2",
				children: ["1h", "24h"].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: key === range ? "btn-gold px-3" : "btn-ghost px-3",
					onClick: () => setRange(key),
					children: key === "1h" ? "1 Std" : "24 Std"
				}, key))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 h-56",
			children: data.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
				width: "100%",
				height: "100%",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
					data,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
							stroke: "#314038",
							vertical: false
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
							dataKey: "label",
							hide: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
							allowDecimals: false,
							width: 28,
							stroke: "#748178",
							fontSize: 12
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							contentStyle: {
								background: "#1c2822",
								border: "1px solid #314038",
								borderRadius: 12
							},
							labelStyle: { color: "#a8b5ac" }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							type: "monotone",
							dataKey: "spieler",
							stroke: "#d7b56a",
							strokeWidth: 2,
							dot: false
						})
					]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Verlauf erscheint, sobald Status-Daten da sind."
			})
		})]
	});
}
//#endregion
export { StatusCard as a, StatStrip as i, MotdNotice as n, PlayerChart as r, CopyIp as t };
