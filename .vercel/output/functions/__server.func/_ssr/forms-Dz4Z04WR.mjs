import { i as __toESM } from "../_runtime.mjs";
import { q as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as SITE } from "./shell-DzkNWVRk.mjs";
import { c as submitCommunity, l as submitTicket, s as lookupTicket } from "./live-SP0k_m1G.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/forms-Dz4Z04WR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var COOLDOWN = 6e4;
function ReviewForm() {
	const [name, setName] = (0, import_react.useState)("");
	const [text, setText] = (0, import_react.useState)("");
	const [rating, setRating] = (0, import_react.useState)(5);
	const [kind, setKind] = (0, import_react.useState)("both");
	const [file, setFile] = (0, import_react.useState)(null);
	const [note, setNote] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onSubmit(e) {
		e.preventDefault();
		const cleanName = name.trim().slice(0, 32);
		const cleanText = text.trim().slice(0, 800);
		if (cleanName.length < 2 || cleanText.length < 4) {
			setNote("Name und ein kurzer Text bitte.");
			return;
		}
		if ((kind === "image" || kind === "both") && !file) {
			setNote("Für einen Shot bitte ein Bild wählen – oder nur eine Rezension senden.");
			return;
		}
		const last = Number(localStorage.getItem("alpensmp_last_submit") || 0);
		if (Date.now() - last < COOLDOWN) {
			setNote("Maximal 1 Beitrag pro Minute.");
			return;
		}
		setBusy(true);
		setNote("Wird gesendet…");
		try {
			let imageUrl = "";
			if (file && (kind === "image" || kind === "both")) imageUrl = await compressImage(file);
			await submitCommunity({
				name: cleanName,
				text: cleanText,
				rating,
				kind,
				imageUrl
			});
			localStorage.setItem("alpensmp_last_submit", String(Date.now()));
			setName("");
			setText("");
			setFile(null);
			setNote("Danke. Dein Beitrag ist raus – das Team schaltet ihn frei, sobald er geprüft ist. Er erscheint nicht sofort.");
		} catch (err) {
			setNote(err instanceof Error ? err.message : "Senden fehlgeschlagen. Alternativ über Discord.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "card space-y-4 p-5",
		onSubmit,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-lg font-semibold",
				children: "Reicht jetzt deines ein"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Shot, Rezension oder beides. Das Team prüft kurz – danach erscheint dein Beitrag in Galerie und Stimmen."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm",
				children: ["Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "field mt-1",
					value: name,
					maxLength: 32,
					required: true,
					onChange: (e) => setName(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm",
				children: "Sterne"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex gap-2",
				children: [
					5,
					4,
					3,
					2,
					1
				].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: n === rating ? "btn-gold px-3" : "btn-ghost px-3",
					onClick: () => setRating(n),
					"aria-pressed": n === rating,
					children: [n, "★"]
				}, n))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					["both", "Beides"],
					["image", "Nur Screenshot"],
					["review", "Nur Rezension"]
				].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: kind === value ? "btn-gold px-3" : "btn-ghost px-3",
					onClick: () => setKind(value),
					children: label
				}, value))
			}),
			kind !== "review" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm",
				children: [
					"Bild",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "mt-1 block w-full text-sm text-muted",
						type: "file",
						accept: "image/png,image/jpeg,image/webp",
						onChange: (e) => setFile(e.target.files?.[0] ?? null)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-xs text-faint",
						children: "PNG, JPG oder WebP – wird vor dem Senden verkleinert."
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm",
				children: ["Text", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					className: "field mt-1 min-h-28",
					value: text,
					maxLength: 800,
					required: true,
					onChange: (e) => setText(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "btn-gold",
				type: "submit",
				disabled: busy,
				children: "Absenden zur Freigabe"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: note || "Wird nicht sofort öffentlich. Maximal 1 Beitrag pro Minute."
			})
		]
	});
}
async function compressImage(file) {
	const bmp = await createImageBitmap(file);
	const scale = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
	const canvas = document.createElement("canvas");
	canvas.width = Math.round(bmp.width * scale);
	canvas.height = Math.round(bmp.height * scale);
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Bild konnte nicht vorbereitet werden.");
	ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
	const url = canvas.toDataURL("image/jpeg", .72);
	if (url.length > 9e5) throw new Error("Bild ist nach dem Verkleinern noch zu gross. Bitte ein kleineres Foto wählen.");
	return url;
}
function TicketForm() {
	const [name, setName] = (0, import_react.useState)("");
	const [topic, setTopic] = (0, import_react.useState)("");
	const [msg, setMsg] = (0, import_react.useState)("");
	const [company, setCompany] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [code, setCode] = (0, import_react.useState)("");
	const [found, setFound] = (0, import_react.useState)(null);
	async function onSubmit(e) {
		e.preventDefault();
		if (company) return;
		if (name.trim().length < 2 || msg.trim().length < 8) {
			setNote("Name und etwas mehr Text bitte.");
			return;
		}
		setBusy(true);
		try {
			const next = await submitTicket({
				name: name.trim().slice(0, 32),
				topic: topic.trim().slice(0, 80),
				msg: msg.trim().slice(0, 800)
			});
			setCode(next);
			setNote(`Ticket-Code: ${next} — merken, damit du die Antwort lesen kannst.`);
			setName("");
			setTopic("");
			setMsg("");
		} catch (err) {
			setNote(err instanceof Error ? err.message : "Senden fehlgeschlagen.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "card p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-3",
			onSubmit,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Ticket hier oder auf Discord. Du bekommst einen Code und kannst die Antwort unten nachlesen."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "field",
					placeholder: "Name / Ingame",
					value: name,
					maxLength: 32,
					required: true,
					onChange: (e) => setName(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "field",
					placeholder: "Thema (z. B. Join-Problem)",
					value: topic,
					maxLength: 80,
					onChange: (e) => setTopic(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					className: "field min-h-32",
					placeholder: "Was ist passiert?",
					value: msg,
					maxLength: 800,
					required: true,
					onChange: (e) => setMsg(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "hidden",
					tabIndex: -1,
					autoComplete: "off",
					value: company,
					onChange: (e) => setCompany(e.target.value),
					"aria-hidden": "true"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "btn-gold",
					disabled: busy,
					type: "submit",
					children: "Ticket senden"
				}),
				note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-ice",
					children: note
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 border-t border-line pt-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-semibold",
					children: "Antwort prüfen"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Code eingeben, den du nach dem Senden bekommen hast."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-col gap-2 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						placeholder: "z. B. ALP-4K2P",
						value: code,
						maxLength: 16,
						onChange: (e) => setCode(e.target.value)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn-ghost",
						onClick: async () => {
							const row = await lookupTicket(code);
							setFound(row);
							if (!row) setNote("Kein Ticket unter diesem Code.");
						},
						children: "Status laden"
					})]
				}),
				found ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-faint",
								children: "Status: "
							}),
							found.status,
							found.topic ? ` · ${found.topic}` : ""
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted",
							children: found.msg
						}),
						found.replies.length ? found.replies.map((reply, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "rounded-md bg-bg px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-medium text-gold",
								children: [reply.by, ": "]
							}), reply.text]
						}, i)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-faint",
							children: "Noch keine Antwort."
						})
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					className: "btn-ice mt-4",
					href: SITE.discord,
					target: "_blank",
					rel: "noreferrer",
					children: "Oder Discord öffnen"
				})
			]
		})]
	});
}
//#endregion
export { TicketForm as n, ReviewForm as t };
